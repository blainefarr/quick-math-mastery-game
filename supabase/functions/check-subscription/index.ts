
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.0.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.14.0";

// Set up CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper logging function
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Supabase environment variables are not set");
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    logStep("Supabase client initialized");

    // Get Stripe secret key
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecretKey) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }
    
    // Initialize Stripe
    const stripe = new Stripe(stripeSecretKey, { apiVersion: "2023-10-16" });
    logStep("Stripe client initialized");

    // Parse the request body
    const requestData = await req.json().catch(() => ({}));
    const sessionId = requestData.sessionId;
    
    // Verify authentication (unless checking a specific session)
    let userId = null;

    // If we have a specific session ID, we'll use that directly
    if (sessionId) {
      logStep("Using provided session ID for checkout verification", { sessionId });

      try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        logStep("Retrieved checkout session", {
          sessionId,
          status: session.status,
          customerId: session.customer,
          metadata: session.metadata
        });
        
        // Get user_id from metadata
        if (session.metadata?.user_id) {
          userId = session.metadata.user_id;
          logStep("Found user ID in session metadata", { userId });
        } else {
          // Try to find user by customer ID
          const { data: accountData } = await supabase
            .from("accounts")
            .select("id")
            .eq("stripe_customer_id", session.customer)
            .maybeSingle();
            
          if (accountData?.id) {
            userId = accountData.id;
            logStep("Found user ID via customer ID lookup", { userId });
          } else {
            logStep("Could not determine user ID from session");
          }
        }
        
        // Update subscription info if we have a user ID and the session is complete
        if (userId && session.status === 'complete') {
          const planType = session.metadata?.plan_type || 'free';
          const interval = session.metadata?.interval || 'monthly';
          let subscriptionStatus = 'free';
          let expiryDate = null;

          if (interval === 'one_time') {
            // Handle one-time payment
            logStep("Processing one-time payment");
            
            // Calculate expiry date - 1 year from now for one-time purchases
            const oneYearFromNow = new Date();
            oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
            expiryDate = oneYearFromNow.toISOString();
            subscriptionStatus = 'one_time';
            
            // Update account with new plan
            const { error: updateError } = await supabase
              .from("accounts")
              .update({
                plan_type: planType,
                subscription_status: subscriptionStatus,
                plan_expires_at: expiryDate
              })
              .eq("id", userId);
            
            if (updateError) {
              logStep("Error updating account", { error: updateError.message });
              throw new Error(`Failed to update account: ${updateError.message}`);
            }
            
            // Check if we already have a subscription history entry for this session
            const { data: existingHistory } = await supabase
              .from("subscription_history")
              .select("id")
              .eq("account_id", userId)
              .eq("payment_session_id", sessionId)
              .maybeSingle();
              
            if (!existingHistory) {
              // Create subscription history entry
              const { error: historyError } = await supabase
                .from("subscription_history")
                .insert({
                  account_id: userId,
                  plan_type: planType,
                  subscription_status: 'one_time',
                  payment_session_id: sessionId,
                  price_paid: session.amount_total ? session.amount_total / 100 : null,
                  payment_method: 'card',
                  started_at: new Date().toISOString(),
                  ended_at: expiryDate
                });
                
              if (historyError) {
                logStep("Error creating history entry", { error: historyError.message });
              }
            }
            
            logStep("One-time payment processed successfully");
          } else if (session.subscription) {
            // Handle subscription
            logStep("Processing subscription", { subscriptionId: session.subscription });
            
            // Get subscription details
            const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
            
            // Calculate expiry date
            expiryDate = new Date(subscription.current_period_end * 1000).toISOString();
            subscriptionStatus = 'active';
            
            // Update account with new subscription
            const { error: updateError } = await supabase
              .from("accounts")
              .update({
                plan_type: planType,
                subscription_status: subscriptionStatus,
                plan_expires_at: expiryDate
              })
              .eq("id", userId);
            
            if (updateError) {
              logStep("Error updating account", { error: updateError.message });
              throw new Error(`Failed to update account: ${updateError.message}`);
            }
            
            // Check if we already have a subscription history entry for this subscription
            const { data: existingHistory } = await supabase
              .from("subscription_history")
              .select("id")
              .eq("account_id", userId)
              .eq("stripe_subscription_id", subscription.id)
              .maybeSingle();
              
            if (!existingHistory) {
              // Create subscription history entry
              const { error: historyError } = await supabase
                .from("subscription_history")
                .insert({
                  account_id: userId,
                  plan_type: planType,
                  subscription_status: subscriptionStatus,
                  stripe_subscription_id: subscription.id,
                  payment_session_id: sessionId,
                  price_paid: subscription.items.data[0].price.unit_amount 
                    ? subscription.items.data[0].price.unit_amount / 100 : null,
                  payment_method: 'card',
                  started_at: new Date(subscription.start_date * 1000).toISOString(),
                  ended_at: expiryDate
                });
                
              if (historyError) {
                logStep("Error creating history entry", { error: historyError.message });
              }
            }
            
            logStep("Subscription processed successfully");
          }
          
          // Return updated subscription info
          return new Response(JSON.stringify({
            success: true,
            is_active: true,
            plan_type: planType,
            subscription_status: subscriptionStatus,
            plan_expires_at: expiryDate,
          }), { 
            headers: { ...corsHeaders, "Content-Type": "application/json" }, 
            status: 200 
          });
        }
      } catch (sessionError) {
        logStep("Error retrieving session", { error: sessionError.message });
        // Continue to regular auth flow as fallback
      }
    }

    // Regular authentication flow for checking current user's subscription
    if (!sessionId) {
      const authHeader = req.headers.get("Authorization");
      if (!authHeader) {
        throw new Error("No authorization header provided");
      }
      
      const token = authHeader.replace("Bearer ", "");
      const { data: userData, error: userError } = await supabase.auth.getUser(token);
      
      if (userError || !userData.user) {
        throw new Error("User not authenticated: " + (userError?.message || "No user found"));
      }
      
      userId = userData.user.id;
      logStep("User authenticated", { id: userId, email: userData.user.email });
    }

    // If we couldn't determine a user ID by this point, we can't proceed
    if (!userId) {
      throw new Error("Could not determine user ID");
    }

    // Get the account data
    const { data: accountData, error: accountError } = await supabase
      .from("accounts")
      .select("stripe_customer_id, plan_type, subscription_status, plan_expires_at")
      .eq("id", userId)
      .single();
      
    if (accountError) {
      throw new Error("Could not fetch account: " + accountError.message);
    }
    
    logStep("Found account data", accountData);

    const customerId = accountData?.stripe_customer_id;
    const currentPlanType = accountData?.plan_type || 'free';
    const currentStatus = accountData?.subscription_status || 'free';
    const expiryDate = accountData?.plan_expires_at;
    
    if (!customerId) {
      // No Stripe customer - return current account state
      logStep("No Stripe customer, returning current status");
      return new Response(
        JSON.stringify({
          success: true,
          plan_type: currentPlanType,
          subscription_status: currentStatus,
          plan_expires_at: expiryDate,
          is_active: ['active', 'one_time'].includes(currentStatus) && 
                     (!expiryDate || new Date(expiryDate) > new Date())
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" }, 
          status: 200 
        }
      );
    }
    
    // Check with Stripe for the latest subscription status
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'active',
      limit: 1
    });
    
    let stripeStatus = currentStatus;
    let stripePlanType = currentPlanType;
    let stripeExpiryDate = expiryDate;
    let needsUpdate = false;
    
    if (subscriptions.data.length > 0) {
      const subscription = subscriptions.data[0];
      logStep("Found active subscription", { subscriptionId: subscription.id });
      
      stripeStatus = 'active';
      stripeExpiryDate = new Date(subscription.current_period_end * 1000).toISOString();
      
      // Extract plan type from metadata if available
      const priceId = subscription.items.data[0].price.id;
      const { data: planData } = await supabase
        .from("plans")
        .select("plan_type")
        .or(`stripe_price_id_monthly.eq.${priceId},stripe_price_id_annual.eq.${priceId},stripe_price_id_one_time.eq.${priceId}`)
        .maybeSingle();
        
      if (planData) {
        stripePlanType = planData.plan_type;
      }
      
      // Check if we need to update the account in Supabase
      if (
        stripeStatus !== currentStatus || 
        stripePlanType !== currentPlanType || 
        stripeExpiryDate !== expiryDate
      ) {
        needsUpdate = true;
      }
    } else if (currentStatus === 'one_time') {
      // One-time purchase - check expiry
      if (expiryDate) {
        const now = new Date();
        const expiry = new Date(expiryDate);
        if (expiry < now) {
          stripeStatus = 'free';
          stripePlanType = 'free';
          needsUpdate = true;
        }
      }
    } else if (currentStatus === 'active') {
      // If current status is active but Stripe has no active subscription, 
      // we need to update the account
      stripeStatus = 'canceled';
      needsUpdate = true;
    }
    
    // Update account if needed
    if (needsUpdate) {
      logStep("Updating account with latest subscription details", {
        planType: stripePlanType,
        status: stripeStatus,
        expiryDate: stripeExpiryDate
      });
      
      const { error: updateError } = await supabase
        .from("accounts")
        .update({
          plan_type: stripePlanType,
          subscription_status: stripeStatus,
          plan_expires_at: stripeExpiryDate
        })
        .eq("id", userId);
        
      if (updateError) {
        logStep("Error updating account", { error: updateError.message });
      }
    }
    
    // Return the latest subscription info
    return new Response(
      JSON.stringify({
        success: true,
        plan_type: stripePlanType,
        subscription_status: stripeStatus,
        plan_expires_at: stripeExpiryDate,
        is_active: ['active', 'one_time'].includes(stripeStatus) && 
                    (!stripeExpiryDate || new Date(stripeExpiryDate) > new Date())
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }, 
        status: 200 
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("ERROR:", errorMessage);

    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }, 
        status: 500 
      }
    );
  }
});

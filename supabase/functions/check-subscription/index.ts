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

    // Verify authentication
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !userData.user) {
      throw new Error("User not authenticated: " + (userError?.message || "No user found"));
    }
    
    const user = userData.user;
    logStep("User authenticated", { id: user.id, email: user.email });

    // Get the account data
    const { data: accountData, error: accountError } = await supabase
      .from("accounts")
      .select("stripe_customer_id, plan_type, subscription_status, plan_expires_at")
      .eq("id", user.id)
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
    
    let stripeStatus = 'free';
    let stripePlanType = currentPlanType;
    let stripeExpiryDate = expiryDate;
    let needsUpdate = false;
    
    if (subscriptions.data.length > 0) {
      const subscription = subscriptions.data[0];
      logStep("Found active subscription", { subscriptionId: subscription.id });
      
      stripeStatus = 'active';
      stripeExpiryDate = new Date(subscription.current_period_end * 1000).toISOString();
      
      // Extract plan type from metadata if available, or determine by price
      // This is a simplified example - you'd need a more robust mapping mechanism
      const priceId = subscription.items.data[0].price.id;
      const { data: planData } = await supabase
        .from("plans")
        .select("plan_type")
        .or(`stripe_price_id_monthly.eq.${priceId},stripe_price_id_annual.eq.${priceId}`)
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
    } else {
      logStep("No active subscription found");
      
      // If current status is active but Stripe has no active subscription, 
      // we need to update the account
      if (currentStatus === 'active') {
        stripeStatus = 'canceled';
        needsUpdate = true;
      }
      
      // If one_time purchase, we keep the status but need to check expiry
      if (currentStatus === 'one_time' && expiryDate) {
        const now = new Date();
        const expiry = new Date(expiryDate);
        if (expiry < now) {
          stripeStatus = 'free';
          stripePlanType = 'free';
          needsUpdate = true;
        }
      }
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
        .eq("id", user.id);
        
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

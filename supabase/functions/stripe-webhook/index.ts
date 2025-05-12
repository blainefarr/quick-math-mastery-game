
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.0.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.14.0";

// Helper for logging function execution steps
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  try {
    logStep("Function started");
    
    // Get Stripe webhook secret and API key
    const stripeWebhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    
    if (!stripeWebhookSecret || !stripeSecretKey) {
      throw new Error("Stripe environment variables are not set");
    }
    
    // Initialize Stripe
    const stripe = new Stripe(stripeSecretKey, { apiVersion: "2023-10-16" });
    logStep("Stripe client initialized");

    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Supabase environment variables are not set");
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    logStep("Supabase client initialized");

    // Get the signature from the header
    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      throw new Error("No Stripe signature found in request");
    }

    // Get the raw request body
    const body = await req.text();
    
    // Verify the webhook signature
    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, stripeWebhookSecret);
      logStep("Webhook signature verified", { eventType: event.type });
    } catch (err) {
      logStep("Webhook signature verification failed", { error: err instanceof Error ? err.message : String(err) });
      return new Response(
        JSON.stringify({ success: false, error: "Webhook signature verification failed" }),
        { status: 400 }
      );
    }

    // Process the event based on its type
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        logStep("Checkout session completed", { sessionId: session.id });
        
        if (!session.metadata?.user_id) {
          logStep("No user ID in session metadata");
          break;
        }
        
        const userId = session.metadata.user_id;
        const planType = session.metadata.plan_type;
        const interval = session.metadata.interval;
        
        if (!userId || !planType || !interval) {
          logStep("Missing metadata", { userId, planType, interval });
          break;
        }
        
        // Get subscription or payment details
        if (interval === 'one_time') {
          // Handle one-time payment
          logStep("Processing one-time payment");
          
          // Calculate expiry date - 1 year from now for one-time purchases
          const expiryDate = new Date();
          expiryDate.setFullYear(expiryDate.getFullYear() + 1);
          
          // Update account with new plan
          const { error: updateError } = await supabase
            .from("accounts")
            .update({
              plan_type: planType,
              subscription_status: 'one_time',
              plan_expires_at: expiryDate.toISOString()
            })
            .eq("id", userId);
          
          if (updateError) {
            logStep("Error updating account", { error: updateError.message });
            break;
          }
          
          // Create subscription history entry
          await supabase
            .from("subscription_history")
            .insert({
              account_id: userId,
              plan_type: planType,
              subscription_status: 'one_time',
              price_paid: session.amount_total ? session.amount_total / 100 : null,
              payment_method: 'card',
              started_at: new Date().toISOString(),
              ended_at: expiryDate.toISOString()
            });
            
          logStep("One-time payment processed successfully");
        } else if (session.subscription) {
          // Handle subscription
          logStep("Processing subscription", { subscriptionId: session.subscription });
          
          // Get subscription details
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
          
          // Calculate expiry date
          const expiryDate = new Date(subscription.current_period_end * 1000);
          
          // Update account with new subscription
          const { error: updateError } = await supabase
            .from("accounts")
            .update({
              plan_type: planType,
              subscription_status: 'active',
              plan_expires_at: expiryDate.toISOString()
            })
            .eq("id", userId);
          
          if (updateError) {
            logStep("Error updating account", { error: updateError.message });
            break;
          }
          
          // Create subscription history entry
          await supabase
            .from("subscription_history")
            .insert({
              account_id: userId,
              plan_type: planType,
              subscription_status: 'active',
              stripe_subscription_id: subscription.id,
              price_paid: subscription.items.data[0].price.unit_amount 
                ? subscription.items.data[0].price.unit_amount / 100 : null,
              payment_method: 'card',
              started_at: new Date(subscription.start_date * 1000).toISOString(),
              ended_at: expiryDate.toISOString()
            });
            
          logStep("Subscription processed successfully");
        }
        
        break;
      }
      
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        logStep("Subscription updated", { subscriptionId: subscription.id });
        
        // Get the customer ID
        const customerId = subscription.customer as string;
        
        // Find the associated account
        const { data: accountData, error: accountError } = await supabase
          .from("accounts")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .single();
          
        if (accountError) {
          logStep("Error finding account", { error: accountError.message, customerId });
          break;
        }
        
        const userId = accountData.id;
        
        // Calculate expiry date
        const expiryDate = new Date(subscription.current_period_end * 1000);
        
        // Update account with subscription status
        const status = subscription.status === 'active' ? 'active' : 
                      subscription.status === 'canceled' ? 'canceled' : 
                      subscription.status;
                      
        const { error: updateError } = await supabase
          .from("accounts")
          .update({
            subscription_status: status,
            plan_expires_at: expiryDate.toISOString()
          })
          .eq("id", userId);
        
        if (updateError) {
          logStep("Error updating account", { error: updateError.message });
          break;
        }
        
        // Update subscription history
        const { data: historyData } = await supabase
          .from("subscription_history")
          .select("id")
          .eq("stripe_subscription_id", subscription.id)
          .eq("account_id", userId)
          .order("created_at", { ascending: false })
          .limit(1);
          
        if (historyData && historyData.length > 0) {
          await supabase
            .from("subscription_history")
            .update({
              subscription_status: status,
              ended_at: expiryDate.toISOString()
            })
            .eq("id", historyData[0].id);
        }
        
        logStep("Subscription update processed successfully");
        break;
      }
      
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        logStep("Subscription deleted", { subscriptionId: subscription.id });
        
        // Get the customer ID
        const customerId = subscription.customer as string;
        
        // Find the associated account
        const { data: accountData, error: accountError } = await supabase
          .from("accounts")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .single();
          
        if (accountError) {
          logStep("Error finding account", { error: accountError.message, customerId });
          break;
        }
        
        const userId = accountData.id;
        
        // Update account with expired subscription 
        const { error: updateError } = await supabase
          .from("accounts")
          .update({
            subscription_status: 'canceled',
            plan_type: 'free'  // Reset to free plan when subscription ends
          })
          .eq("id", userId);
        
        if (updateError) {
          logStep("Error updating account", { error: updateError.message });
          break;
        }
        
        // Update subscription history
        const { data: historyData } = await supabase
          .from("subscription_history")
          .select("id")
          .eq("stripe_subscription_id", subscription.id)
          .eq("account_id", userId)
          .order("created_at", { ascending: false })
          .limit(1);
          
        if (historyData && historyData.length > 0) {
          await supabase
            .from("subscription_history")
            .update({
              subscription_status: 'canceled',
              ended_at: new Date().toISOString()
            })
            .eq("id", historyData[0].id);
        }
        
        logStep("Subscription deletion processed successfully");
        break;
      }

      default: {
        logStep(`Unhandled event type: ${event.type}`);
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200 }
    );
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("ERROR:", errorMessage);

    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500 }
    );
  }
});

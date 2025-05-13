
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.0.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.14.0";

// Set up CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper for logging function execution steps
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
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

    // Parse request body
    const { planType, interval, promo } = await req.json();

    if (!planType || !interval) {
      throw new Error("Missing required parameters: planType or interval");
    }
    
    logStep("Request parameters", { planType, interval, promo });

    // Map frontend plan type to backend plan type (if different)
    let databasePlanType = planType;
    if (planType === 'individual') {
      databasePlanType = 'premium';  // Map "individual" to "premium" plan in database
    }

    // Get plan details from the database
    const { data: planData, error: planError } = await supabase
      .from("plans")
      .select("*")
      .eq("plan_type", databasePlanType)
      .single();
    
    if (planError || !planData) {
      throw new Error("Could not find plan: " + (planError?.message || "No plan found"));
    }
    
    logStep("Found plan", { plan: planData });

    // Get price ID based on interval
    let priceId: string | null = null;
    
    switch (interval) {
      case "monthly":
        priceId = planData.stripe_price_id_monthly;
        break;
      case "annual":
        priceId = planData.stripe_price_id_annual;
        break;
      case "one_time":
        priceId = planData.stripe_price_id_one_time;
        break;
      default:
        throw new Error("Invalid interval");
    }

    if (!priceId) {
      throw new Error(`No price found for plan ${planType} with interval ${interval}`);
    }
    
    logStep("Selected price", { priceId });

    // Check for existing Stripe customer
    const { data: accountData, error: accountError } = await supabase
      .from("accounts")
      .select("stripe_customer_id, email")
      .eq("id", user.id)
      .single();
    
    if (accountError) {
      throw new Error("Could not fetch account: " + accountError.message);
    }
    
    logStep("Found account", { account: accountData });

    let customerId = accountData?.stripe_customer_id;
    const userEmail = accountData?.email || user.email;
    
    // If no Stripe customer exists, or if searching by email 
    // doesn't find one, we'll create a new customer
    if (!customerId) {
      logStep("No Stripe customer ID found, searching by email");
      const customers = await stripe.customers.list({ email: userEmail, limit: 1 });

      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
        logStep("Found existing customer by email", { customerId });
        
        // Update the account with the Stripe customer ID
        await supabase
          .from("accounts")
          .update({ stripe_customer_id: customerId })
          .eq("id", user.id);
      } else {
        // Create a new customer
        logStep("Creating new Stripe customer");
        const customer = await stripe.customers.create({
          email: userEmail,
          metadata: {
            supabase_id: user.id
          }
        });
        
        customerId = customer.id;
        logStep("Created new customer", { customerId });
        
        // Update the account with the Stripe customer ID
        await supabase
          .from("accounts")
          .update({ stripe_customer_id: customerId })
          .eq("id", user.id);
      }
    }

    // Create checkout session options
    const checkoutOptions: any = {
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1
        }
      ],
      mode: interval === 'one_time' ? 'payment' : 'subscription',
      success_url: `${req.headers.get('origin')}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin')}/account`,
      metadata: {
        user_id: user.id,
        plan_type: databasePlanType, // Make sure to use the mapped plan type here
        interval: interval
      }
    };

    // Add promo code if provided
    if (promo) {
      logStep("Checking promo code", { promo });
      
      const { data: promoData, error: promoError } = await supabase
        .from("promo_codes")
        .select("*")
        .eq("code", promo)
        .single();
        
      if (promoError || !promoData) {
        logStep("Invalid promo code", { error: promoError?.message });
      } else if (promoData.valid_until && new Date(promoData.valid_until) < new Date()) {
        logStep("Expired promo code");
      } else if (promoData.max_uses && promoData.current_uses >= promoData.max_uses) {
        logStep("Max uses reached for promo code");
      } else {
        // Valid promo code
        logStep("Valid promo code", { discount: promoData.discount_percent });
        
        // Add promo code for existing coupon, or create a coupon
        try {
          const coupon = await stripe.coupons.create({
            percent_off: promoData.discount_percent,
            duration: 'once',
            metadata: {
              promo_code: promo
            }
          });
          
          checkoutOptions.discounts = [{ coupon: coupon.id }];
          logStep("Created coupon for promo", { couponId: coupon.id });
          
          // Update promo code usage
          await supabase
            .from("promo_codes")
            .update({ current_uses: promoData.current_uses + 1 })
            .eq("code", promo);
            
          // Associate promo code with user account
          await supabase
            .from("accounts")
            .update({ promo_code: promo })
            .eq("id", user.id);
        } catch (e) {
          console.error("Error creating coupon:", e);
        }
      }
    }

    // Create checkout session
    logStep("Creating checkout session");
    const session = await stripe.checkout.sessions.create(checkoutOptions);
    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    // Return the checkout URL to the client
    return new Response(
      JSON.stringify({ success: true, url: session.url }),
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

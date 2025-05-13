
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
  console.log(`[CUSTOMER-PORTAL] ${step}${detailsStr}`);
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

    // Get the customer ID
    const { data: accountData, error: accountError } = await supabase
      .from("accounts")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .single();
      
    if (accountError) {
      throw new Error("Could not fetch account: " + accountError.message);
    }
    
    const customerId = accountData?.stripe_customer_id;
    if (!customerId) {
      throw new Error("No Stripe customer ID associated with this account");
    }
    
    logStep("Found customer ID", { customerId });

    try {
      // Create the portal session
      const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: `${req.headers.get("origin")}/account`,
      });
      
      logStep("Created customer portal session", { sessionUrl: session.url });

      // Return the portal URL to the client
      return new Response(
        JSON.stringify({ success: true, url: session.url }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" }, 
          status: 200 
        }
      );
    } catch (stripeError: any) {
      // Handle Stripe-specific errors better
      logStep("Stripe error", { message: stripeError.message });
      
      // Check if it's the portal configuration error
      if (stripeError.message?.includes("configuration has not been created")) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: "Your Stripe Customer Portal has not been configured. Please visit the Stripe dashboard to set it up.", 
            isStripeConfigError: true 
          }),
          { 
            headers: { ...corsHeaders, "Content-Type": "application/json" }, 
            status: 422  // Using 422 instead of 500 for better client-side handling
          }
        );
      }
      
      // Rethrow for general handler
      throw stripeError;
    }
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

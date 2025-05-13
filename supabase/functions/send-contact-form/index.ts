
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend@0.15.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ContactFormRequest {
  name: string;
  email: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the RESEND_API_KEY from environment variables
    const apiKey = Deno.env.get("RESEND_API_KEY");
    if (!apiKey) {
      throw new Error("RESEND_API_KEY is not set");
    }

    // Parse request body
    const { name, email, message }: ContactFormRequest = await req.json();
    
    // Initialize Resend with API key
    const resend = new Resend(apiKey);
    
    // Define admin email (your email)
    const adminEmail = Deno.env.get("ADMIN_EMAIL") || "admin@example.com";
    
    // Send email to admin
    const { data, error } = await resend.emails.send({
      from: "Math Game <onboarding@resend.dev>",
      to: [adminEmail],
      subject: `New District Pricing Inquiry from ${name}`,
      html: `
        <h2>New District Pricing Inquiry</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    });
    
    console.log("Email sending result:", { data, error });

    if (error) {
      throw error;
    }

    // Send confirmation email to the sender
    await resend.emails.send({
      from: "Math Game <onboarding@resend.dev>",
      to: [email],
      subject: "We've received your district pricing inquiry",
      html: `
        <h2>Thank you for your interest!</h2>
        <p>Hello ${name},</p>
        <p>We've received your inquiry about district pricing. Our team will review your request and get back to you soon.</p>
        <p>Here's a copy of your message:</p>
        <blockquote>${message}</blockquote>
        <p>Best regards,<br>The Math Game Team</p>
      `,
    });

    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("Error in send-contact-form function:", error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
};

serve(handler);

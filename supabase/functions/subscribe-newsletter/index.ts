import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SubscribeRequest {
  email: string;
  source?: string;
}

const sendWelcomeEmail = async (email: string) => {
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  if (!resendApiKey) {
    console.log("RESEND_API_KEY not configured, skipping welcome email");
    return;
  }

  const resend = new Resend(resendApiKey);

  try {
    await resend.emails.send({
      from: "UISU Archive <noreply@resend.dev>",
      to: [email],
      subject: "Welcome to UISU Archive Newsletter!",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Georgia, 'Times New Roman', serif; line-height: 1.6; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #0a2e52; font-size: 28px; margin-bottom: 10px;">Welcome to UISU Archive</h1>
            <p style="color: #c9a227; font-style: italic; font-size: 14px; text-transform: uppercase; letter-spacing: 2px;">First and Best</p>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 30px; border-left: 4px solid #c9a227;">
            <p style="font-size: 16px; margin-bottom: 15px;">Dear Subscriber,</p>
            <p style="font-size: 16px; margin-bottom: 15px;">
              Thank you for subscribing to the UISU Archive newsletter. You've joined a community dedicated to preserving and celebrating the rich history, culture, and intellectual heritage of the University of Ibadan Students' Union.
            </p>
            <p style="font-size: 16px; margin-bottom: 15px;">
              As a subscriber, you'll receive:
            </p>
            <ul style="font-size: 15px; color: #444;">
              <li style="margin-bottom: 8px;">Historical documents and archival discoveries</li>
              <li style="margin-bottom: 8px;">Updates on union governance and leadership</li>
              <li style="margin-bottom: 8px;">Exclusive stories from past student leaders</li>
              <li style="margin-bottom: 8px;">Event announcements and community news</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="https://uisu.lovable.app" style="display: inline-block; background-color: #0a2e52; color: white; padding: 12px 30px; text-decoration: none; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; font-size: 13px;">
              Explore the Archive
            </a>
          </div>
          
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #888; font-size: 12px;">
            <p>© ${new Date().getFullYear()} UISU Archive. University of Ibadan Students' Union.</p>
            <p style="margin-top: 5px;">
              <a href="https://uisu.lovable.app/privacy-policy" style="color: #0a2e52; text-decoration: none;">Privacy Policy</a> | 
              <a href="https://uisu.lovable.app/terms-of-service" style="color: #0a2e52; text-decoration: none;">Terms of Service</a>
            </p>
          </div>
        </body>
        </html>
      `,
    });
    console.log("Welcome email sent successfully to:", email);
  } catch (error) {
    console.error("Error sending welcome email:", error);
    // Don't throw - subscription should still succeed even if email fails
  }
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, source = "website" }: SubscribeRequest = await req.json();

    if (!email) {
      throw new Error("Email is required");
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error("Invalid email format");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if email already exists
    const { data: existing } = await supabase
      .from("newsletter_subscribers")
      .select("id, is_active")
      .eq("email", email.toLowerCase())
      .single();

    if (existing) {
      if (existing.is_active) {
        return new Response(
          JSON.stringify({ success: true, message: "Already subscribed!" }),
          {
            status: 200,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      } else {
        // Reactivate subscription
        await supabase
          .from("newsletter_subscribers")
          .update({ is_active: true, subscribed_at: new Date().toISOString() })
          .eq("id", existing.id);
        
        // Send welcome back email
        await sendWelcomeEmail(email.toLowerCase());
        
        return new Response(
          JSON.stringify({ success: true, message: "Welcome back! Subscription reactivated." }),
          {
            status: 200,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }
    }

    // Insert new subscriber
    const { error: dbError } = await supabase
      .from("newsletter_subscribers")
      .insert({ email: email.toLowerCase(), source });

    if (dbError) {
      console.error("Database error:", dbError);
      throw new Error("Failed to subscribe");
    }

    // Send welcome email to new subscriber
    await sendWelcomeEmail(email.toLowerCase());

    return new Response(
      JSON.stringify({ success: true, message: "Successfully subscribed!" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in subscribe-newsletter:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);

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

const ADMIN_EMAIL = "theharbystud@gmail.com"; // Admin notification recipient
const logoUrl = "https://uisu.lovable.app/uisu-logo.png";

// Send welcome/confirmation email to the new subscriber
const sendWelcomeEmail = async (resend: Resend, email: string) => {
  try {
    await resend.emails.send({
      from: "UISU Archive <newsletter@uisu.space>",
      to: [email],
      subject: "Welcome to UISU Archive Newsletter!",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: Georgia, 'Times New Roman', serif; background-color: #f8f6f1;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8f6f1;">
            <tr>
              <td align="center" style="padding: 40px 20px;">
                <table role="presentation" width="100%" style="max-width: 560px; background-color: #f8f6f1;">
                  
                  <!-- Logo Section -->
                  <tr>
                    <td align="right" style="padding-bottom: 40px;">
                      <img src="${logoUrl}" alt="UISU" width="48" height="48" style="display: block;" />
                      <p style="margin: 8px 0 0 0; font-size: 14px; color: #0a2e52; font-weight: 600; letter-spacing: 2px; text-transform: uppercase;">UISU ARCHIVE</p>
                    </td>
                  </tr>
                  
                  <!-- Title Section -->
                  <tr>
                    <td style="padding-bottom: 32px;">
                      <h1 style="margin: 0; font-size: 26px; font-weight: 700; color: #0a2e52; line-height: 1.3; border-bottom: 3px solid #0a2e52; display: inline-block; padding-bottom: 8px;">
                        Welcome to the Archive
                      </h1>
                    </td>
                  </tr>
                  
                  <!-- Content Section -->
                  <tr>
                    <td style="padding-bottom: 24px;">
                      <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.7; color: #1a1a1a;">
                        Thank you for subscribing. You've joined a community dedicated to preserving and celebrating the rich history, culture, and intellectual heritage of the University of Ibadan Students' Union.
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Benefits List -->
                  <tr>
                    <td style="padding-bottom: 32px;">
                      <p style="margin: 0 0 16px 0; font-size: 15px; color: #444;">As a subscriber, you'll receive:</p>
                      <ul style="margin: 0; padding: 0 0 0 20px; font-size: 15px; color: #1a1a1a; line-height: 1.8;">
                        <li style="margin-bottom: 8px;">Historical documents and archival discoveries</li>
                        <li style="margin-bottom: 8px;">Updates on union governance and leadership</li>
                        <li style="margin-bottom: 8px;">Exclusive stories from past student leaders</li>
                        <li style="margin-bottom: 8px;">Event announcements and community news</li>
                      </ul>
                    </td>
                  </tr>
                  
                  <!-- CTA Button -->
                  <tr>
                    <td style="padding-bottom: 48px;">
                      <a href="https://uisu.lovable.app" style="display: inline-block; background-color: #0a2e52; color: #ffffff; padding: 14px 32px; text-decoration: none; font-weight: 600; font-size: 14px; letter-spacing: 1px; border-radius: 4px;">
                        Explore the Archive →
                      </a>
                    </td>
                  </tr>
                  
                  <!-- Footer Section -->
                  <tr>
                    <td style="border-top: 1px solid #d4d0c8; padding-top: 24px;">
                      <table role="presentation" width="100%">
                        <tr>
                          <td style="vertical-align: bottom;">
                            <p style="margin: 0 0 4px 0; font-size: 18px; font-style: italic; color: #c9a227;">First and Best</p>
                            <p style="margin: 0; font-size: 12px; color: #888;">UISU Archive</p>
                          </td>
                          <td align="right" style="vertical-align: bottom;">
                            <div style="width: 60px; height: 2px; background-color: #c9a227;"></div>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <!-- Legal Footer -->
                  <tr>
                    <td style="padding-top: 32px; text-align: center;">
                      <p style="margin: 0 0 8px 0; font-size: 11px; color: #888;">
                        © ${new Date().getFullYear()} UISU Archive. University of Ibadan Students' Union.
                      </p>
                      <p style="margin: 0; font-size: 11px;">
                        <a href="https://uisu.lovable.app/privacy-policy" style="color: #0a2e52; text-decoration: none;">Privacy Policy</a>
                        <span style="color: #ccc; margin: 0 8px;">|</span>
                        <a href="https://uisu.lovable.app/terms-of-service" style="color: #0a2e52; text-decoration: none;">Terms of Service</a>
                      </p>
                    </td>
                  </tr>
                  
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });
    console.log("Welcome email sent successfully to:", email);
  } catch (error) {
    console.error("Error sending welcome email:", error);
  }
};

// Send admin notification about new subscriber
const sendAdminNotification = async (resend: Resend, subscriberEmail: string, source: string) => {
  try {
    const timestamp = new Date().toLocaleString('en-NG', { timeZone: 'Africa/Lagos' });
    
    await resend.emails.send({
      from: "UISU Archive <newsletter@uisu.space>",
      to: [ADMIN_EMAIL],
      subject: `📬 New Newsletter Subscriber: ${subscriberEmail}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8f6f1;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8f6f1;">
            <tr>
              <td align="center" style="padding: 40px 20px;">
                <table role="presentation" width="100%" style="max-width: 500px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                  
                  <!-- Header -->
                  <tr>
                    <td style="padding: 32px 32px 24px; border-bottom: 1px solid #eee;">
                      <table role="presentation" width="100%">
                        <tr>
                          <td>
                            <h1 style="margin: 0; font-size: 20px; font-weight: 600; color: #0a2e52;">
                              New Subscriber Alert
                            </h1>
                          </td>
                          <td align="right">
                            <img src="${logoUrl}" alt="UISU" width="40" height="40" />
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 24px 32px;">
                      <p style="margin: 0 0 16px 0; font-size: 15px; color: #333;">
                        A new user has subscribed to the UISU Archive newsletter:
                      </p>
                      
                      <table role="presentation" width="100%" style="background-color: #f8f6f1; border-radius: 8px; padding: 16px;">
                        <tr>
                          <td style="padding: 12px 16px;">
                            <p style="margin: 0 0 8px 0; font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 1px;">Email Address</p>
                            <p style="margin: 0; font-size: 16px; color: #0a2e52; font-weight: 600;">${subscriberEmail}</p>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 12px 16px;">
                            <p style="margin: 0 0 8px 0; font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 1px;">Source</p>
                            <p style="margin: 0; font-size: 14px; color: #333;">${source}</p>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 12px 16px;">
                            <p style="margin: 0 0 8px 0; font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 1px;">Subscribed At</p>
                            <p style="margin: 0; font-size: 14px; color: #333;">${timestamp}</p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <!-- CTA -->
                  <tr>
                    <td style="padding: 0 32px 32px;">
                      <a href="https://uisu.lovable.app/admin" style="display: inline-block; background-color: #0a2e52; color: #ffffff; padding: 12px 24px; text-decoration: none; font-weight: 600; font-size: 13px; border-radius: 6px;">
                        View in Dashboard →
                      </a>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="padding: 16px 32px; background-color: #f8f6f1; border-radius: 0 0 12px 12px;">
                      <p style="margin: 0; font-size: 11px; color: #888; text-align: center;">
                        This is an automated notification from UISU Archive.
                      </p>
                    </td>
                  </tr>
                  
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });
    console.log("Admin notification sent for new subscriber:", subscriberEmail);
  } catch (error) {
    console.error("Error sending admin notification:", error);
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

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const resend = resendApiKey ? new Resend(resendApiKey) : null;

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
        
        // Send welcome back email and notify admin
        if (resend) {
          await Promise.all([
            sendWelcomeEmail(resend, email.toLowerCase()),
            sendAdminNotification(resend, email.toLowerCase(), `${source} (reactivated)`),
          ]);
        }
        
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

    // Send welcome email to new subscriber AND notify admin (in parallel)
    if (resend) {
      await Promise.all([
        sendWelcomeEmail(resend, email.toLowerCase()),
        sendAdminNotification(resend, email.toLowerCase(), source),
      ]);
    } else {
      console.log("RESEND_API_KEY not configured, skipping emails");
    }

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

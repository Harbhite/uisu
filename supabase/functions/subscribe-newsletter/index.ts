import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SubscribeRequest {
  email: string;
  source?: string;
}

const ADMIN_EMAIL = "theharbystud@gmail.com";

// Hosted gold fist logo URL
const logoUrl = "https://uisu.lovable.app/newsletter-logo.png";

// Generate unsubscribe URL
const getUnsubscribeUrl = (email: string) => 
  `https://uisu.lovable.app/unsubscribe?email=${encodeURIComponent(email)}`;

// Send welcome/confirmation email to the new subscriber
const sendWelcomeEmail = async (plunkApiKey: string, email: string) => {
  try {
    await fetch('https://api.useplunk.com/v1/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${plunkApiKey}` },
      body: JSON.stringify({
        name: 'UISU Archive '.trim(),
        from: 'newsletter@uisu.space',
        to: email,
        subject: "Welcome to the Archive — UISU Newsletter",
        body: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: Georgia, 'Times New Roman', serif; background-color: #F8F6F1;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #F8F6F1;">
            <tr>
              <td align="center" style="padding: 48px 20px;">
                <table role="presentation" width="100%" style="max-width: 580px;">
                  
                  <!-- Header with Gold Logo -->
                  <tr>
                    <td style="padding-bottom: 32px;">
                      <table role="presentation" width="100%">
                        <tr>
                          <td align="center">
                            <img src="${logoUrl}" alt="UISU" width="80" height="80" style="display: block; margin-bottom: 16px;" />
                            <p style="margin: 0; font-size: 11px; color: #C5A059; text-transform: uppercase; letter-spacing: 4px; font-weight: 600;">UISU ARCHIVE</p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <!-- Welcome Banner -->
                  <tr>
                    <td style="padding-bottom: 32px; text-align: center;">
                      <h1 style="margin: 0 0 8px 0; font-size: 36px; font-weight: 700; color: #0F172A; line-height: 1.2;">
                        Welcome to the Archive
                      </h1>
                      <div style="width: 60px; height: 3px; background-color: #C5A059; margin: 16px auto;"></div>
                    </td>
                  </tr>
                  
                  <!-- Content Card -->
                  <tr>
                    <td style="padding-bottom: 32px;">
                      <table role="presentation" width="100%" style="background-color: #FFFFFF; border: 1px solid #E2E8F0; box-shadow: 0 4px 24px rgba(0,0,0,0.06);">
                        <tr>
                          <td style="padding: 40px;">
                            <p style="margin: 0 0 24px 0; font-size: 17px; line-height: 1.8; color: #1E293B;">
                              Thank you for subscribing. You've joined a community dedicated to preserving and celebrating the rich history, culture, and intellectual heritage of the University of Ibadan Students' Union.
                            </p>
                            
                            <p style="margin: 0 0 16px 0; font-size: 14px; color: #64748B; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">
                              What to Expect
                            </p>
                            
                            <table role="presentation" width="100%" style="margin-bottom: 24px;">
                              <tr>
                                <td style="padding: 12px 0; border-bottom: 1px solid #F1F5F9;">
                                  <table role="presentation">
                                    <tr>
                                      <td style="width: 32px; vertical-align: top;">
                                        <span style="display: inline-block; width: 24px; height: 24px; background-color: #C5A059; color: white; text-align: center; line-height: 24px; font-size: 12px; font-weight: bold;">1</span>
                                      </td>
                                      <td style="padding-left: 12px; font-size: 15px; color: #1E293B;">Historical documents and archival discoveries</td>
                                    </tr>
                                  </table>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 12px 0; border-bottom: 1px solid #F1F5F9;">
                                  <table role="presentation">
                                    <tr>
                                      <td style="width: 32px; vertical-align: top;">
                                        <span style="display: inline-block; width: 24px; height: 24px; background-color: #C5A059; color: white; text-align: center; line-height: 24px; font-size: 12px; font-weight: bold;">2</span>
                                      </td>
                                      <td style="padding-left: 12px; font-size: 15px; color: #1E293B;">Updates on union governance and leadership</td>
                                    </tr>
                                  </table>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 12px 0; border-bottom: 1px solid #F1F5F9;">
                                  <table role="presentation">
                                    <tr>
                                      <td style="width: 32px; vertical-align: top;">
                                        <span style="display: inline-block; width: 24px; height: 24px; background-color: #C5A059; color: white; text-align: center; line-height: 24px; font-size: 12px; font-weight: bold;">3</span>
                                      </td>
                                      <td style="padding-left: 12px; font-size: 15px; color: #1E293B;">Exclusive stories from past student leaders</td>
                                    </tr>
                                  </table>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 12px 0;">
                                  <table role="presentation">
                                    <tr>
                                      <td style="width: 32px; vertical-align: top;">
                                        <span style="display: inline-block; width: 24px; height: 24px; background-color: #C5A059; color: white; text-align: center; line-height: 24px; font-size: 12px; font-weight: bold;">4</span>
                                      </td>
                                      <td style="padding-left: 12px; font-size: 15px; color: #1E293B;">Event announcements and community news</td>
                                    </tr>
                                  </table>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <!-- CTA Button -->
                  <tr>
                    <td style="padding-bottom: 48px; text-align: center;">
                      <a href="https://uisu.lovable.app" style="display: inline-block; background-color: #C5A059; color: #FFFFFF; padding: 18px 48px; text-decoration: none; font-weight: 600; font-size: 13px; letter-spacing: 2px; text-transform: uppercase; font-family: Arial, sans-serif;">
                        Explore the Archive
                      </a>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="border-top: 1px solid #E2E8F0; padding-top: 32px; text-align: center;">
                      <p style="margin: 0 0 8px 0; font-size: 22px; font-style: italic; color: #C5A059; font-family: Georgia, serif;">First and Best</p>
                      <p style="margin: 0 0 16px 0; font-size: 12px; color: #64748B;">UISU Archive • Est. 1948</p>
                      <p style="margin: 0; font-size: 11px; color: #94A3B8;">
                        © ${new Date().getFullYear()} UISU Archive. University of Ibadan Students' Union.
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Unsubscribe Footer -->
                  <tr>
                    <td style="padding: 24px 32px; text-align: center; border-top: 1px solid #E2E8F0;">
                      <p style="margin: 0; font-size: 11px; color: #94A3B8;">
                        You're receiving this because you subscribed to the UISU Archive newsletter.
                      </p>
                      <p style="margin: 8px 0 0 0; font-size: 11px;">
                        <a href="${getUnsubscribeUrl(email)}" style="color: #64748B; text-decoration: underline;">Unsubscribe</a>
                        <span style="color: #CBD5E1; margin: 0 8px;">|</span>
                        <a href="https://uisu.lovable.app/privacy-policy" style="color: #64748B; text-decoration: none;">Privacy Policy</a>
                        <span style="color: #CBD5E1; margin: 0 8px;">|</span>
                        <a href="https://uisu.lovable.app/terms-of-service" style="color: #64748B; text-decoration: none;">Terms of Service</a>
                      </p>
                    </td>
                  </tr>
                  
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `
      })
    });
    console.log("Welcome email sent successfully to:", email);
  } catch (error) {
    console.error("Error sending welcome email:", error);
  }
};

// Send admin notification about new subscriber
const sendAdminNotification = async (plunkApiKey: string, subscriberEmail: string, source: string) => {
  try {
    const timestamp = new Date().toLocaleString('en-NG', { timeZone: 'Africa/Lagos' });
    
    await fetch('https://api.useplunk.com/v1/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${plunkApiKey}` },
      body: JSON.stringify({
        name: 'UISU Archive '.trim(),
        from: 'newsletter@uisu.space',
        to: ADMIN_EMAIL,
        subject: `📬 New Newsletter Subscriber: ${subscriberEmail}`,
        body: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #F8F6F1;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #F8F6F1;">
            <tr>
              <td align="center" style="padding: 40px 20px;">
                <table role="presentation" width="100%" style="max-width: 480px; background-color: #FFFFFF; border: 1px solid #E2E8F0; box-shadow: 0 4px 24px rgba(0,0,0,0.06);">
                  
                  <!-- Header -->
                  <tr>
                    <td style="padding: 32px 32px 24px; border-bottom: 1px solid #F1F5F9;">
                      <table role="presentation" width="100%">
                        <tr>
                          <td>
                            <span style="display: inline-block; background-color: #C5A059; color: white; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; padding: 6px 12px;">
                              New Subscriber
                            </span>
                            <h1 style="margin: 12px 0 0 0; font-size: 18px; font-weight: 600; color: #0F172A;">
                              Newsletter Alert
                            </h1>
                          </td>
                          <td align="right" style="vertical-align: top;">
                            <img src="${logoUrl}" alt="UISU" width="48" height="48" />
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 24px 32px;">
                      <p style="margin: 0 0 20px 0; font-size: 15px; color: #475569;">
                        A new user has subscribed to the UISU Archive newsletter.
                      </p>
                      
                      <table role="presentation" width="100%" style="background-color: #F8F6F1; border-left: 3px solid #C5A059;">
                        <tr>
                          <td style="padding: 16px 20px;">
                            <p style="margin: 0 0 4px 0; font-size: 11px; color: #64748B; text-transform: uppercase; letter-spacing: 1px;">Email Address</p>
                            <p style="margin: 0; font-size: 16px; color: #0F172A; font-weight: 600;">${subscriberEmail}</p>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 0 20px 16px;">
                            <table role="presentation" width="100%">
                              <tr>
                                <td style="width: 50%;">
                                  <p style="margin: 0 0 4px 0; font-size: 11px; color: #64748B; text-transform: uppercase; letter-spacing: 1px;">Source</p>
                                  <p style="margin: 0; font-size: 14px; color: #1E293B;">${source}</p>
                                </td>
                                <td style="width: 50%;">
                                  <p style="margin: 0 0 4px 0; font-size: 11px; color: #64748B; text-transform: uppercase; letter-spacing: 1px;">Time</p>
                                  <p style="margin: 0; font-size: 14px; color: #1E293B;">${timestamp}</p>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <!-- CTA -->
                  <tr>
                    <td style="padding: 0 32px 32px;">
                      <a href="https://uisu.lovable.app/admin" style="display: inline-block; background-color: #0F172A; color: #FFFFFF; padding: 14px 28px; text-decoration: none; font-weight: 600; font-size: 12px; letter-spacing: 1px; text-transform: uppercase;">
                        View Dashboard →
                      </a>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="padding: 16px 32px; background-color: #F8F6F1; text-align: center;">
                      <p style="margin: 0; font-size: 11px; color: #94A3B8;">
                        Automated notification from UISU Archive
                      </p>
                    </td>
                  </tr>
                  
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `
      })
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

    const resendApiKey = Deno.env.get("PLUNK_API_KEY");
    const plunk = resendApiKey ? resendApiKey : null;

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
        if (plunk) {
          await Promise.all([
            sendWelcomeEmail(plunk, email.toLowerCase()),
            sendAdminNotification(plunk, email.toLowerCase(), `${source} (reactivated)`),
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

    // Send welcome email and admin notification
    if (plunk) {
      await Promise.all([
        sendWelcomeEmail(plunk, email.toLowerCase()),
        sendAdminNotification(plunk, email.toLowerCase(), source),
      ]);
    }

    console.log("Newsletter subscription successful for:", email);

    return new Response(
      JSON.stringify({ success: true, message: "Successfully subscribed!" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Error in subscribe-newsletter function:", error);
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

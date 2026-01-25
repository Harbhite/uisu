import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SendNewsletterRequest {
  campaignId?: string;
  subject: string;
  content: string;
  template?: string;
  testEmail?: string;
  scheduledAt?: string; // ISO date string for scheduling
}

// Gold colored SVG logo (inline for email compatibility)
const goldLogoSvg = `<svg width="48" height="48" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="45" fill="none" stroke="#C5A059" stroke-width="3"/>
  <circle cx="50" cy="50" r="35" fill="none" stroke="#C5A059" stroke-width="2"/>
  <text x="50" y="58" font-family="Georgia, serif" font-size="24" font-weight="bold" fill="#C5A059" text-anchor="middle">UI</text>
  <text x="50" y="75" font-family="Georgia, serif" font-size="10" fill="#C5A059" text-anchor="middle">SU</text>
</svg>`;

const goldLogoBase64 = `data:image/svg+xml;base64,${btoa(goldLogoSvg)}`;

// Template: Classic Editorial
const generateClassicTemplate = (content: string, subject: string) => {
  const htmlContent = convertMarkdown(content);
  return `
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
            <table role="presentation" width="100%" style="max-width: 640px;">
              
              <!-- Header with Gold Accents -->
              <tr>
                <td style="padding-bottom: 32px;">
                  <table role="presentation" width="100%">
                    <tr>
                      <td style="width: 60px; vertical-align: top;">
                        <div style="width: 48px; height: 48px; border: 2px solid #C5A059; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                          <img src="${goldLogoBase64}" alt="UISU" width="44" height="44" style="display: block;" />
                        </div>
                      </td>
                      <td style="padding-left: 16px; vertical-align: middle;">
                        <p style="margin: 0; font-size: 11px; color: #C5A059; text-transform: uppercase; letter-spacing: 3px; font-weight: 600;">The Archive Newsletter</p>
                        <p style="margin: 4px 0 0 0; font-size: 12px; color: #64748B;">University of Ibadan Students' Union</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Gold Divider -->
              <tr>
                <td style="padding-bottom: 32px;">
                  <table role="presentation" width="100%">
                    <tr>
                      <td style="height: 1px; background: linear-gradient(to right, transparent, #C5A059, transparent);"></td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Title -->
              <tr>
                <td style="padding-bottom: 24px;">
                  <h1 style="margin: 0; font-size: 32px; font-weight: 700; color: #0F172A; line-height: 1.2; font-family: Georgia, serif;">
                    ${subject}
                  </h1>
                </td>
              </tr>
              
              <!-- Content Card -->
              <tr>
                <td style="padding-bottom: 32px;">
                  <table role="presentation" width="100%" style="background-color: #FFFFFF; border: 1px solid #E2E8F0; box-shadow: 0 4px 24px rgba(0,0,0,0.06);">
                    <tr>
                      <td style="padding: 40px;">
                        <div style="font-size: 17px; line-height: 1.8; color: #1E293B;">
                          ${htmlContent}
                        </div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- CTA Button -->
              <tr>
                <td style="padding-bottom: 48px; text-align: center;">
                  <a href="https://uisu.lovable.app" style="display: inline-block; background-color: #C5A059; color: #FFFFFF; padding: 16px 40px; text-decoration: none; font-weight: 600; font-size: 13px; letter-spacing: 2px; text-transform: uppercase; font-family: Arial, sans-serif;">
                    Visit the Archive
                  </a>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="border-top: 1px solid #E2E8F0; padding-top: 32px;">
                  <table role="presentation" width="100%">
                    <tr>
                      <td style="text-align: center;">
                        <p style="margin: 0 0 8px 0; font-size: 20px; font-style: italic; color: #C5A059; font-family: Georgia, serif;">First and Best</p>
                        <p style="margin: 0 0 16px 0; font-size: 12px; color: #64748B;">UISU Archive • Est. 1948</p>
                        <p style="margin: 0; font-size: 11px; color: #94A3B8;">
                          <a href="https://uisu.lovable.app/privacy-policy" style="color: #64748B; text-decoration: none;">Privacy</a>
                          <span style="margin: 0 8px; color: #CBD5E1;">|</span>
                          <a href="https://uisu.lovable.app/terms-of-service" style="color: #64748B; text-decoration: none;">Terms</a>
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};

// Template: Minimal Modern
const generateMinimalTemplate = (content: string, subject: string) => {
  const htmlContent = convertMarkdown(content);
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #FFFFFF;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #FFFFFF;">
        <tr>
          <td align="center" style="padding: 60px 24px;">
            <table role="presentation" width="100%" style="max-width: 560px;">
              
              <!-- Minimal Header -->
              <tr>
                <td style="padding-bottom: 48px; text-align: center;">
                  <div style="display: inline-block; border-bottom: 2px solid #C5A059; padding-bottom: 8px;">
                    <span style="font-size: 11px; color: #C5A059; text-transform: uppercase; letter-spacing: 4px; font-weight: 600;">UISU Archive</span>
                  </div>
                </td>
              </tr>
              
              <!-- Title -->
              <tr>
                <td style="padding-bottom: 32px; text-align: center;">
                  <h1 style="margin: 0; font-size: 28px; font-weight: 300; color: #0F172A; line-height: 1.4; font-family: Georgia, serif;">
                    ${subject}
                  </h1>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding-bottom: 48px;">
                  <div style="font-size: 16px; line-height: 1.9; color: #475569; text-align: left;">
                    ${htmlContent}
                  </div>
                </td>
              </tr>
              
              <!-- Minimal CTA -->
              <tr>
                <td style="padding-bottom: 48px; text-align: center;">
                  <a href="https://uisu.lovable.app" style="display: inline-block; color: #C5A059; text-decoration: none; font-size: 14px; font-weight: 500; border-bottom: 1px solid #C5A059; padding-bottom: 2px;">
                    Explore the Archive →
                  </a>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="text-align: center; padding-top: 32px; border-top: 1px solid #F1F5F9;">
                  <p style="margin: 0 0 4px 0; font-size: 18px; font-style: italic; color: #C5A059;">First and Best</p>
                  <p style="margin: 0; font-size: 11px; color: #94A3B8;">UISU Archive • University of Ibadan</p>
                </td>
              </tr>
              
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};

// Template: Bold Announcement
const generateAnnouncementTemplate = (content: string, subject: string) => {
  const htmlContent = convertMarkdown(content);
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: Georgia, 'Times New Roman', serif; background-color: #0F172A;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0F172A;">
        <tr>
          <td align="center" style="padding: 48px 20px;">
            <table role="presentation" width="100%" style="max-width: 600px;">
              
              <!-- Header Badge -->
              <tr>
                <td style="padding-bottom: 32px; text-align: center;">
                  <span style="display: inline-block; background-color: #C5A059; color: #0F172A; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; padding: 8px 16px;">
                    Official Announcement
                  </span>
                </td>
              </tr>
              
              <!-- Logo -->
              <tr>
                <td style="padding-bottom: 24px; text-align: center;">
                  <img src="${goldLogoBase64}" alt="UISU" width="64" height="64" />
                </td>
              </tr>
              
              <!-- Title -->
              <tr>
                <td style="padding-bottom: 24px; text-align: center;">
                  <h1 style="margin: 0; font-size: 36px; font-weight: 700; color: #FFFFFF; line-height: 1.2;">
                    ${subject}
                  </h1>
                </td>
              </tr>
              
              <!-- Gold Divider -->
              <tr>
                <td style="padding-bottom: 32px; text-align: center;">
                  <div style="width: 80px; height: 3px; background-color: #C5A059; margin: 0 auto;"></div>
                </td>
              </tr>
              
              <!-- Content Card -->
              <tr>
                <td style="padding-bottom: 40px;">
                  <table role="presentation" width="100%" style="background-color: #1E293B; border-left: 4px solid #C5A059;">
                    <tr>
                      <td style="padding: 32px;">
                        <div style="font-size: 17px; line-height: 1.8; color: #E2E8F0;">
                          ${htmlContent}
                        </div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- CTA Button -->
              <tr>
                <td style="padding-bottom: 48px; text-align: center;">
                  <a href="https://uisu.lovable.app" style="display: inline-block; background-color: #C5A059; color: #0F172A; padding: 18px 48px; text-decoration: none; font-weight: 700; font-size: 14px; letter-spacing: 2px; text-transform: uppercase;">
                    Read More
                  </a>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="text-align: center; border-top: 1px solid #334155; padding-top: 32px;">
                  <p style="margin: 0 0 8px 0; font-size: 20px; font-style: italic; color: #C5A059;">First and Best</p>
                  <p style="margin: 0; font-size: 12px; color: #64748B;">UISU Archive • University of Ibadan Students' Union</p>
                </td>
              </tr>
              
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};

// Template: Newspaper Style
const generateNewspaperTemplate = (content: string, subject: string) => {
  const htmlContent = convertMarkdown(content);
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: Georgia, 'Times New Roman', serif; background-color: #FFFEF7;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #FFFEF7;">
        <tr>
          <td align="center" style="padding: 32px 20px;">
            <table role="presentation" width="100%" style="max-width: 680px; background-color: #FFFEF7; border: 1px solid #E5E2D9;">
              
              <!-- Masthead -->
              <tr>
                <td style="padding: 24px 32px; border-bottom: 3px double #0F172A; text-align: center;">
                  <p style="margin: 0 0 4px 0; font-size: 10px; color: #64748B; text-transform: uppercase; letter-spacing: 3px;">The Official Newsletter of</p>
                  <h1 style="margin: 0; font-size: 42px; font-weight: 400; color: #0F172A; font-family: Georgia, serif; letter-spacing: -1px;">
                    THE ARCHIVE
                  </h1>
                  <div style="display: flex; justify-content: center; align-items: center; gap: 16px; margin-top: 8px;">
                    <span style="font-size: 11px; color: #64748B;">${today}</span>
                    <span style="display: inline-block; width: 4px; height: 4px; background-color: #C5A059; border-radius: 50%;"></span>
                    <span style="font-size: 11px; color: #C5A059;">University of Ibadan</span>
                  </div>
                </td>
              </tr>
              
              <!-- Headline -->
              <tr>
                <td style="padding: 32px 32px 16px;">
                  <h2 style="margin: 0; font-size: 28px; font-weight: 700; color: #0F172A; line-height: 1.3; text-align: center; border-bottom: 1px solid #0F172A; padding-bottom: 16px;">
                    ${subject}
                  </h2>
                </td>
              </tr>
              
              <!-- Content in columns style -->
              <tr>
                <td style="padding: 16px 32px 32px;">
                  <div style="font-size: 16px; line-height: 1.8; color: #1E293B; text-align: justify;">
                    ${htmlContent}
                  </div>
                </td>
              </tr>
              
              <!-- Action Strip -->
              <tr>
                <td style="padding: 24px 32px; background-color: #0F172A; text-align: center;">
                  <a href="https://uisu.lovable.app" style="color: #C5A059; text-decoration: none; font-size: 13px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase;">
                    Continue Reading on the Archive →
                  </a>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="padding: 24px 32px; text-align: center; border-top: 1px solid #E5E2D9;">
                  <img src="${goldLogoBase64}" alt="UISU" width="36" height="36" style="margin-bottom: 12px;" />
                  <p style="margin: 0 0 4px 0; font-size: 16px; font-style: italic; color: #C5A059;">First and Best</p>
                  <p style="margin: 0; font-size: 11px; color: #94A3B8;">UISU Archive • Est. 1948</p>
                </td>
              </tr>
              
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};

// Helper to convert markdown to HTML
const convertMarkdown = (content: string) => {
  return content
    .replace(/\n\n/g, '</p><p style="margin: 0 0 20px 0;">')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br>')
    .replace(/^/, '<p style="margin: 0 0 20px 0;">')
    .replace(/$/, '</p>');
};

// Main template generator
const generateNewsletterHtml = (content: string, subject: string, template: string = 'classic') => {
  switch (template) {
    case 'minimal':
      return generateMinimalTemplate(content, subject);
    case 'announcement':
      return generateAnnouncementTemplate(content, subject);
    case 'newspaper':
      return generateNewspaperTemplate(content, subject);
    case 'classic':
    default:
      return generateClassicTemplate(content, subject);
  }
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    
    // Verify user is staff
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    
    const { data: claims, error: claimsError } = await userClient.auth.getUser();
    if (claimsError || !claims?.user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Use service client for operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if user is admin/moderator
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", claims.user.id)
      .in("role", ["admin", "moderator"])
      .maybeSingle();

    if (!roleData) {
      return new Response(
        JSON.stringify({ error: "Forbidden: Staff access required" }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { campaignId, subject, content, template = 'classic', testEmail, scheduledAt }: SendNewsletterRequest = await req.json();

    if (!subject || !content) {
      throw new Error("Subject and content are required");
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY not configured");
    }
    
    const resend = new Resend(resendApiKey);
    const htmlContent = generateNewsletterHtml(content, subject, template);

    // If scheduling for later, just save to database
    if (scheduledAt && !testEmail) {
      const scheduledDate = new Date(scheduledAt);
      if (scheduledDate <= new Date()) {
        throw new Error("Scheduled time must be in the future");
      }

      const { data: campaign, error: insertError } = await supabase
        .from("newsletter_campaigns")
        .insert({
          subject,
          content,
          html_content: htmlContent,
          template,
          status: "scheduled",
          scheduled_at: scheduledAt,
          sent_by: claims.user.id,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Newsletter scheduled for ${scheduledDate.toLocaleString()}`,
          isScheduled: true,
          campaignId: campaign.id,
        }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // If testEmail is provided, send only to that email (test mode)
    if (testEmail) {
      try {
        const { data, error } = await resend.emails.send({
          from: "UISU Archive <newsletter@uisu.space>",
          to: testEmail,
          subject: `[TEST] ${subject}`,
          html: htmlContent,
        });

        if (error) {
          console.error("Test send error:", error);
          throw new Error(`Failed to send test email: ${error.message}`);
        }

        console.log(`Test newsletter sent to ${testEmail}`);

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: `Test email sent to ${testEmail}`,
            isTest: true,
          }),
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      } catch (testError: any) {
        console.error("Test email error:", testError);
        return new Response(
          JSON.stringify({ error: testError.message }),
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
    }

    // Fetch active subscribers for regular send
    const { data: subscribers, error: fetchError } = await supabase
      .from("newsletter_subscribers")
      .select("email")
      .eq("is_active", true);

    if (fetchError) {
      throw new Error("Failed to fetch subscribers");
    }

    if (!subscribers || subscribers.length === 0) {
      return new Response(
        JSON.stringify({ success: false, message: "No active subscribers found" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Send emails in batches using Resend's batch API
    let successCount = 0;
    let failCount = 0;
    const batchSize = 50; // Resend batch limit

    for (let i = 0; i < subscribers.length; i += batchSize) {
      const batch = subscribers.slice(i, i + batchSize);
      
      try {
        const emails = batch.map((sub) => ({
          from: "UISU Archive <newsletter@uisu.space>",
          to: sub.email,
          subject: subject,
          html: htmlContent,
        }));

        const { data, error } = await resend.batch.send(emails);
        
        if (error) {
          console.error("Batch send error:", error);
          failCount += batch.length;
        } else {
          successCount += batch.length;
        }
      } catch (batchError) {
        console.error("Batch error:", batchError);
        failCount += batch.length;
      }
    }

    // Update or create campaign record
    if (campaignId) {
      await supabase
        .from("newsletter_campaigns")
        .update({
          status: "sent",
          sent_at: new Date().toISOString(),
          sent_by: claims.user.id,
          recipients_count: subscribers.length,
          successful_count: successCount,
          failed_count: failCount,
          html_content: htmlContent,
          template,
        })
        .eq("id", campaignId);
    } else {
      await supabase
        .from("newsletter_campaigns")
        .insert({
          subject,
          content,
          html_content: htmlContent,
          template,
          status: "sent",
          sent_at: new Date().toISOString(),
          sent_by: claims.user.id,
          recipients_count: subscribers.length,
          successful_count: successCount,
          failed_count: failCount,
        });
    }

    console.log(`Newsletter sent: ${successCount} success, ${failCount} failed`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Newsletter sent to ${successCount} subscribers`,
        stats: {
          total: subscribers.length,
          successful: successCount,
          failed: failCount,
        }
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-newsletter:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);

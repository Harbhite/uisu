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
  scheduledAt?: string;
}

// Hosted gold fist logo URL
const logoUrl = "https://uisu.lovable.app/newsletter-logo.png";

// Tracking base URL
const TRACKING_BASE_URL = "https://zdxmmwqjvkedddcgucyz.supabase.co/functions/v1/track-email";

// Generate tracking pixel URL
const getTrackingPixelUrl = (campaignId: string, email: string) =>
  `${TRACKING_BASE_URL}?c=${encodeURIComponent(campaignId)}&e=${encodeURIComponent(email)}&t=open`;

// Generate tracked link URL
const getTrackedLinkUrl = (campaignId: string, email: string, originalUrl: string) =>
  `${TRACKING_BASE_URL}?c=${encodeURIComponent(campaignId)}&e=${encodeURIComponent(email)}&t=click&l=${encodeURIComponent(originalUrl)}`;

// Generate unsubscribe URL
const getUnsubscribeUrl = (email: string) => 
  `https://uisu.lovable.app/unsubscribe?email=${encodeURIComponent(email)}`;

// Wrap all links in content for tracking
const wrapLinksForTracking = (html: string, campaignId: string, email: string): string => {
  // Match href attributes but exclude unsubscribe, privacy, and terms links
  return html.replace(
    /href="(https?:\/\/[^"]+)"/g,
    (match, url) => {
      // Skip tracking for unsubscribe, privacy, terms links and tracking URLs
      if (url.includes('unsubscribe') || 
          url.includes('privacy-policy') || 
          url.includes('terms-of-service') ||
          url.includes('track-email')) {
        return match;
      }
      return `href="${getTrackedLinkUrl(campaignId, email, url)}"`;
    }
  );
};

// Unsubscribe footer section
const generateUnsubscribeFooter = (email: string) => `
  <tr>
    <td style="padding: 24px 32px; text-align: center; border-top: 1px solid #E2E8F0;">
      <p style="margin: 0; font-size: 11px; color: #94A3B8;">
        You're receiving this because you subscribed to the UISU Archive newsletter.
      </p>
      <p style="margin: 8px 0 0 0; font-size: 11px;">
        <a href="${getUnsubscribeUrl(email)}" style="color: #64748B; text-decoration: underline;">Unsubscribe</a>
        <span style="color: #CBD5E1; margin: 0 8px;">|</span>
        <a href="https://uisu.lovable.app/privacy-policy" style="color: #64748B; text-decoration: none;">Privacy</a>
        <span style="color: #CBD5E1; margin: 0 8px;">|</span>
        <a href="https://uisu.lovable.app/terms-of-service" style="color: #64748B; text-decoration: none;">Terms</a>
      </p>
    </td>
  </tr>
`;

// Template: Classic Editorial
const generateClassicTemplate = (content: string, subject: string, email: string) => {
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
              
              <!-- Header with Gold Logo -->
              <tr>
                <td style="padding-bottom: 32px;">
                  <table role="presentation" width="100%">
                    <tr>
                      <td style="width: 80px; vertical-align: top;">
                        <img src="${logoUrl}" alt="UISU" width="64" height="64" style="display: block;" />
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
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Unsubscribe Footer -->
              ${generateUnsubscribeFooter(email)}
              
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};

// Template: Minimal Modern
const generateMinimalTemplate = (content: string, subject: string, email: string) => {
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
              
              <!-- Minimal Header with Logo -->
              <tr>
                <td style="padding-bottom: 48px; text-align: center;">
                  <img src="${logoUrl}" alt="UISU" width="56" height="56" style="display: block; margin: 0 auto 16px;" />
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
              
              <!-- Unsubscribe Footer -->
              ${generateUnsubscribeFooter(email)}
              
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};

// Template: Bold Announcement
const generateAnnouncementTemplate = (content: string, subject: string, email: string) => {
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
                  <img src="${logoUrl}" alt="UISU" width="80" height="80" style="display: block; margin: 0 auto;" />
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
              
              <!-- Unsubscribe Footer (dark mode) -->
              <tr>
                <td style="padding: 24px 32px; text-align: center; border-top: 1px solid #334155;">
                  <p style="margin: 0; font-size: 11px; color: #64748B;">
                    You're receiving this because you subscribed to the UISU Archive newsletter.
                  </p>
                  <p style="margin: 8px 0 0 0; font-size: 11px;">
                    <a href="${getUnsubscribeUrl(email)}" style="color: #94A3B8; text-decoration: underline;">Unsubscribe</a>
                    <span style="color: #475569; margin: 0 8px;">|</span>
                    <a href="https://uisu.lovable.app/privacy-policy" style="color: #94A3B8; text-decoration: none;">Privacy</a>
                    <span style="color: #475569; margin: 0 8px;">|</span>
                    <a href="https://uisu.lovable.app/terms-of-service" style="color: #94A3B8; text-decoration: none;">Terms</a>
                  </p>
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
const generateNewspaperTemplate = (content: string, subject: string, email: string) => {
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
            <table role="presentation" width="100%" style="max-width: 680px; background-color: #FFFEF7; border: 3px double #0F172A;">
              
              <!-- Masthead -->
              <tr>
                <td style="padding: 24px 32px; border-bottom: 3px double #0F172A; text-align: center;">
                  <img src="${logoUrl}" alt="UISU" width="48" height="48" style="display: block; margin: 0 auto 12px;" />
                  <p style="margin: 0 0 4px 0; font-size: 10px; color: #64748B; text-transform: uppercase; letter-spacing: 3px;">The Official Newsletter of</p>
                  <h1 style="margin: 0; font-size: 42px; font-weight: 400; color: #0F172A; font-family: Georgia, serif; letter-spacing: -1px;">
                    THE ARCHIVE
                  </h1>
                  <p style="margin: 12px 0 0 0; font-size: 11px; color: #64748B;">
                    ${today} <span style="color: #C5A059; margin: 0 8px;">★</span> University of Ibadan
                  </p>
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
                  <p style="margin: 0 0 4px 0; font-size: 16px; font-style: italic; color: #C5A059;">First and Best</p>
                  <p style="margin: 0; font-size: 11px; color: #94A3B8;">UISU Archive • Est. 1948</p>
                </td>
              </tr>
              
              <!-- Unsubscribe Footer -->
              ${generateUnsubscribeFooter(email)}
              
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

// Main template generator (without tracking pixel - added separately per campaign)
const generateNewsletterHtml = (content: string, subject: string, template: string = 'classic', email: string = '') => {
  switch (template) {
    case 'minimal':
      return generateMinimalTemplate(content, subject, email);
    case 'announcement':
      return generateAnnouncementTemplate(content, subject, email);
    case 'newspaper':
      return generateNewspaperTemplate(content, subject, email);
    case 'classic':
    default:
      return generateClassicTemplate(content, subject, email);
  }
};

// Add tracking pixel and wrap links for a campaign
const addTrackingToHtml = (html: string, campaignId: string, email: string): string => {
  // Add tracking pixel before closing body tag
  const trackingPixel = `<img src="${getTrackingPixelUrl(campaignId, email)}" alt="" width="1" height="1" style="display:none;visibility:hidden;width:1px;height:1px;opacity:0;">`;
  const htmlWithPixel = html.replace('</body>', `${trackingPixel}</body>`);
  
  // Wrap all links for click tracking
  return wrapLinksForTracking(htmlWithPixel, campaignId, email);
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
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const resend = new Resend(resendApiKey);

    const { campaignId, subject, content, template = 'classic', testEmail, scheduledAt }: SendNewsletterRequest = await req.json();

    if (!subject || !content) {
      throw new Error("Subject and content are required");
    }

    // If test email is provided, send only to that email (no tracking for tests)
    if (testEmail) {
      const htmlContent = generateNewsletterHtml(content, subject, template, testEmail);
      
      await resend.emails.send({
        from: "UISU Archive <newsletter@uisu.space>",
        to: [testEmail],
        subject: `[TEST] ${subject}`,
        html: htmlContent,
      });

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Test email sent to ${testEmail}`,
          testEmail: true
        }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Handle scheduling
    if (scheduledAt) {
      const scheduledTime = new Date(scheduledAt);
      const now = new Date();
      
      if (scheduledTime > now) {
        // Store campaign as scheduled (tracking will be added when sent)
        const { data: newCampaign, error: campaignError } = await supabase
          .from("newsletter_campaigns")
          .insert({
            subject,
            content,
            template,
            status: 'scheduled',
            scheduled_at: scheduledAt,
            html_content: generateNewsletterHtml(content, subject, template, 'preview@example.com'),
          })
          .select()
          .single();

        if (campaignError) {
          console.error("Error creating scheduled campaign:", campaignError);
          throw new Error("Failed to schedule campaign");
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: `Newsletter scheduled for ${scheduledTime.toLocaleString()}`,
            scheduled: true,
            campaignId: newCampaign?.id
          }),
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
    }

    // Get active subscribers
    const { data: subscribers, error: subError } = await supabase
      .from("newsletter_subscribers")
      .select("email")
      .eq("is_active", true);

    if (subError) {
      throw new Error("Failed to fetch subscribers");
    }

    if (!subscribers || subscribers.length === 0) {
      return new Response(
        JSON.stringify({ success: false, message: "No active subscribers found" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Create campaign record first to get campaign ID for tracking
    let activeCampaignId: string = campaignId || '';
    if (!activeCampaignId) {
      const { data: newCampaign, error: insertError } = await supabase
        .from("newsletter_campaigns")
        .insert({
          subject,
          content,
          template,
          status: 'sending',
          recipients_count: subscribers.length,
          html_content: generateNewsletterHtml(content, subject, template, 'preview@example.com'),
        })
        .select()
        .single();

      if (insertError || !newCampaign) {
        console.error("Error creating campaign:", insertError);
        throw new Error("Failed to create campaign record");
      }
      activeCampaignId = newCampaign.id;
    }

    // Send to all subscribers with tracking
    let successCount = 0;
    let failCount = 0;

    for (const subscriber of subscribers) {
      try {
        // Generate email with template
        const baseHtml = generateNewsletterHtml(content, subject, template, subscriber.email);
        // Add tracking pixel and wrap links
        const trackedHtml = addTrackingToHtml(baseHtml, activeCampaignId, subscriber.email);
        
        await resend.emails.send({
          from: "UISU Archive <newsletter@uisu.space>",
          to: [subscriber.email],
          subject,
          html: trackedHtml,
        });
        successCount++;
      } catch (error) {
        console.error(`Failed to send to ${subscriber.email}:`, error);
        failCount++;
      }
    }

    // Update campaign record with final stats
    await supabase
      .from("newsletter_campaigns")
      .update({
        status: 'sent',
        sent_at: new Date().toISOString(),
        recipients_count: subscribers.length,
        successful_count: successCount,
        failed_count: failCount,
      })
      .eq("id", activeCampaignId);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Newsletter sent to ${successCount} subscribers (${failCount} failed)`,
        recipientsCount: subscribers.length,
        successCount,
        failCount,
        campaignId: activeCampaignId
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

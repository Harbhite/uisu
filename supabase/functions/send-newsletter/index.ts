import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface RecipientNames {
  first_name?: string | null;
  full_name?: string | null;
}
interface SendNewsletterRequest {
  campaignId?: string;
  subject: string;
  content: string;
  template?: string;
  testEmail?: string;
  scheduledAt?: string;
  customTemplateHtml?: string;
  abEnabled?: boolean;
  abVariantA?: string;
  abVariantB?: string;
  senderName?: string;
  audienceId?: string;
  audienceEmails?: string[];
  // NEW: preview mode — returns rendered HTML for a recipient without sending
  previewOnly?: boolean;
  previewEmail?: string;
  previewFirstName?: string;
  previewFullName?: string;
}

const SENDER_EMAIL = "newsletter@uisu.space";
const DEFAULT_SENDER_NAME = "UISU Archive";
const sanitizeSenderName = (name?: string): string => {
  const cleaned = (name || "").replace(/[\r\n<>"\\]/g, "").trim();
  return cleaned.length > 0 ? cleaned.slice(0, 80) : DEFAULT_SENDER_NAME;
};
// RFC 5322 — always quote the display name to maximise client compatibility
const buildFromHeader = (name?: string) => {
  const display = sanitizeSenderName(name);
  return `"${display}" <${SENDER_EMAIL}>`;
};

// Derive a friendly first name from an email local part as a soft fallback.
const nameFromEmail = (email: string): string => {
  const local = (email.split("@")[0] || "").split("+")[0];
  const parts = local.split(/[._\-]+/).filter(Boolean);
  const first = parts[0] || "";
  if (!first || first.length < 3 || /\d/.test(first)) return "there";
  if (["info", "admin", "hello", "contact", "support", "team", "no-reply", "noreply"].includes(first.toLowerCase())) return "there";
  return first.charAt(0).toUpperCase() + first.slice(1).toLowerCase();
};

const resolveFirstName = (email: string, names?: RecipientNames): string => {
  const fn = (names?.first_name || "").trim();
  if (fn) return fn;
  const full = (names?.full_name || "").trim();
  if (full) return full.split(/\s+/)[0];
  return nameFromEmail(email);
};

const resolveLastName = (email: string, names?: RecipientNames): string => {
  const full = (names?.full_name || "").trim();
  if (full) {
    const parts = full.split(/\s+/);
    if (parts.length > 1) return parts[parts.length - 1];
  }
  return "";
};

const resolveFullName = (email: string, names?: RecipientNames): string => {
  const full = (names?.full_name || "").trim();
  if (full) return full;
  const fn = (names?.first_name || "").trim();
  if (fn) return fn;
  return nameFromEmail(email);
};

const SITE_NAME = "UISU Archive";
const SITE_URL = "https://uisu.space";

// Apply personalization tokens to ANY string (subject, content, rendered HTML).
const personalizeText = (text: string, email: string, names?: RecipientNames): string => {
  if (!text) return text;
  const firstName = resolveFirstName(email, names);
  const lastName = resolveLastName(email, names);
  const fullName = resolveFullName(email, names);
  const emailLocal = (email.split("@")[0] || "").toLowerCase();
  const emailDomain = (email.split("@")[1] || "").toLowerCase();
  const hasRealName = !!(names?.first_name || names?.full_name);
  const salutation = hasRealName ? `Dear ${firstName}` : "Hello there";
  const initial = firstName ? firstName.charAt(0).toUpperCase() + "." : "";
  const unsubUrl = `https://uisu.lovable.app/unsubscribe?email=${encodeURIComponent(email)}`;

  const now = new Date();
  const dateFmt = (opts: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat("en-US", { timeZone: "Africa/Lagos", ...opts }).format(now);
  const currentDate = dateFmt({ year: "numeric", month: "long", day: "numeric" });
  const currentTime = dateFmt({ hour: "2-digit", minute: "2-digit", hour12: true }) + " WAT";
  const currentYear = String(now.getUTCFullYear());
  const currentMonth = dateFmt({ month: "long" });
  const dayOfWeek = dateFmt({ weekday: "long" });

  return text
    // recipient
    .replace(/\{\{\s*first_name\s*\}\}/gi, firstName)
    .replace(/\{\{\s*firstname\s*\}\}/gi, firstName)
    .replace(/\{\{\s*last_name\s*\}\}/gi, lastName)
    .replace(/\{\{\s*lastname\s*\}\}/gi, lastName)
    .replace(/\{\{\s*name\s*\}\}/gi, fullName)
    .replace(/\{\{\s*full_name\s*\}\}/gi, fullName)
    .replace(/\{\{\s*initial\s*\}\}/gi, initial)
    .replace(/\{\{\s*salutation\s*\}\}/gi, salutation)
    .replace(/\{\{\s*email\s*\}\}/gi, email)
    .replace(/\{\{\s*email_local\s*\}\}/gi, emailLocal)
    .replace(/\{\{\s*email_domain\s*\}\}/gi, emailDomain)
    .replace(/\{\{\s*unsubscribe_url\s*\}\}/gi, unsubUrl)
    // template / clock
    .replace(/\{\{\s*current_date\s*\}\}/gi, currentDate)
    .replace(/\{\{\s*current_time\s*\}\}/gi, currentTime)
    .replace(/\{\{\s*current_year\s*\}\}/gi, currentYear)
    .replace(/\{\{\s*current_month\s*\}\}/gi, currentMonth)
    .replace(/\{\{\s*day_of_week\s*\}\}/gi, dayOfWeek)
    .replace(/\{\{\s*site_name\s*\}\}/gi, SITE_NAME)
    .replace(/\{\{\s*site_url\s*\}\}/gi, SITE_URL);
};

// Render a custom template shell by substituting tokens
const renderCustomTemplate = (shell: string, content: string, subject: string, email: string, names?: RecipientNames): string => {
  const unsubUrl = `https://uisu.lovable.app/unsubscribe?email=${encodeURIComponent(email)}`;
  const personalizedContent = personalizeText(content, email, names);
  const personalizedSubject = personalizeText(subject, email, names);
  const rendered = shell
    .replace(/\{\{\s*content\s*\}\}/g, personalizedContent)
    .replace(/\{\{\s*subject\s*\}\}/g, personalizedSubject)
    .replace(/\{\{\s*email\s*\}\}/g, email)
    .replace(/\{\{\s*unsubscribe_url\s*\}\}/g, unsubUrl);
  return personalizeText(rendered, email, names);
};

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
                        <p style="margin: 0 0 8px 0; font-size: 20px; font-style: italic; color: #C5A059; font-family: Georgia, serif;">Father of Intellectual Unionism</p>
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
                  <p style="margin: 0 0 4px 0; font-size: 18px; font-style: italic; color: #C5A059;">Father of Intellectual Unionism</p>
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
                  <p style="margin: 0 0 8px 0; font-size: 20px; font-style: italic; color: #C5A059;">Father of Intellectual Unionism</p>
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
                  <p style="margin: 0 0 4px 0; font-size: 16px; font-style: italic; color: #C5A059;">Father of Intellectual Unionism</p>
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

// Template: Longform Magazine (optimized for long-form content)
const generateLongformTemplate = (content: string, subject: string, email: string) => {
  const htmlContent = convertMarkdown(content);
  const readTime = Math.max(1, Math.ceil(content.split(/\s+/).length / 200));
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Charter', Georgia, serif; background-color: #FAFAF8;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #FAFAF8;">
        <tr>
          <td align="center" style="padding: 48px 20px;">
            <table role="presentation" width="100%" style="max-width: 720px;">
              
              <!-- Masthead -->
              <tr>
                <td style="padding-bottom: 40px; border-bottom: 1px solid #E2E8F0;">
                  <table role="presentation" width="100%">
                    <tr>
                      <td style="width: 56px;">
                        <img src="${logoUrl}" alt="UISU" width="48" height="48" style="display: block;" />
                      </td>
                      <td style="padding-left: 16px;">
                        <p style="margin: 0; font-size: 18px; font-weight: 600; color: #0F172A; font-family: Georgia, serif;">UISU Archive</p>
                        <p style="margin: 4px 0 0 0; font-size: 12px; color: #94A3B8;">The Longform Dispatch</p>
                      </td>
                      <td style="text-align: right;">
                        <span style="display: inline-block; background-color: #FEF9E7; color: #C5A059; padding: 6px 12px; font-size: 11px; font-weight: 600; border-radius: 4px;">
                          ${readTime} min read
                        </span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Hero Title -->
              <tr>
                <td style="padding: 56px 0 32px;">
                  <h1 style="margin: 0; font-size: 40px; font-weight: 700; color: #0F172A; line-height: 1.25; font-family: Georgia, serif; letter-spacing: -0.5px;">
                    ${subject}
                  </h1>
                  <p style="margin: 20px 0 0 0; font-size: 13px; color: #94A3B8; text-transform: uppercase; letter-spacing: 2px;">
                    Deep Dive Edition
                  </p>
                </td>
              </tr>
              
              <!-- Drop Cap Content -->
              <tr>
                <td style="padding-bottom: 48px;">
                  <div style="font-size: 19px; line-height: 1.9; color: #334155; font-family: 'Charter', Georgia, serif;">
                    ${htmlContent}
                  </div>
                </td>
              </tr>
              
              <!-- Pull Quote Divider -->
              <tr>
                <td style="padding: 32px 0; border-top: 1px solid #E2E8F0; border-bottom: 1px solid #E2E8F0;">
                  <table role="presentation" width="100%">
                    <tr>
                      <td style="width: 4px; background-color: #C5A059;"></td>
                      <td style="padding-left: 24px;">
                        <p style="margin: 0; font-size: 22px; font-style: italic; color: #64748B; font-family: Georgia, serif; line-height: 1.5;">
                          "Preserving our legacy, one story at a time."
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- CTA Section -->
              <tr>
                <td style="padding: 48px 0;">
                  <table role="presentation" width="100%" style="background-color: #0F172A; border-radius: 8px;">
                    <tr>
                      <td style="padding: 32px; text-align: center;">
                        <p style="margin: 0 0 16px 0; font-size: 16px; color: #E2E8F0;">Continue exploring the Archive</p>
                        <a href="https://uisu.lovable.app" style="display: inline-block; background-color: #C5A059; color: #0F172A; padding: 14px 32px; text-decoration: none; font-weight: 600; font-size: 13px; letter-spacing: 1px; border-radius: 4px;">
                          Visit UISU SPACE
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="text-align: center; padding-top: 24px; border-top: 1px solid #E2E8F0;">
                  <p style="margin: 0 0 8px 0; font-size: 18px; font-style: italic; color: #C5A059;">Father of Intellectual Unionism</p>
                  <p style="margin: 0; font-size: 11px; color: #94A3B8;">University of Ibadan Students' Union • Est. 1948</p>
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

// Template: Vintage Telegram
const generateTelegramTemplate = (content: string, subject: string, email: string) => {
  const htmlContent = convertMarkdown(content);
  const today = new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Courier New', Courier, monospace; background-color: #F5F0E1;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #F5F0E1;">
        <tr>
          <td align="center" style="padding: 40px 20px;">
            <table role="presentation" width="100%" style="max-width: 580px; background-color: #FFFEF5; border: 2px solid #1A1A1A; box-shadow: 4px 4px 0 #1A1A1A;">
              
              <!-- Header Strip -->
              <tr>
                <td style="background-color: #C5A059; padding: 12px 24px; text-align: center;">
                  <p style="margin: 0; font-size: 11px; color: #0F172A; text-transform: uppercase; letter-spacing: 4px; font-weight: 700;">
                    ★ OFFICIAL DISPATCH ★
                  </p>
                </td>
              </tr>
              
              <!-- Logo & Date -->
              <tr>
                <td style="padding: 24px 32px; border-bottom: 2px dashed #1A1A1A;">
                  <table role="presentation" width="100%">
                    <tr>
                      <td style="text-align: center;">
                        <img src="${logoUrl}" alt="UISU" width="64" height="64" style="display: block; margin: 0 auto 12px; filter: sepia(20%);" />
                        <p style="margin: 0; font-size: 10px; color: #64748B;">DATE: ${today}</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Subject Line -->
              <tr>
                <td style="padding: 24px 32px 16px;">
                  <p style="margin: 0 0 8px 0; font-size: 10px; color: #64748B; text-transform: uppercase; letter-spacing: 2px;">RE:</p>
                  <h1 style="margin: 0; font-size: 22px; font-weight: 700; color: #1A1A1A; text-transform: uppercase; letter-spacing: 1px; line-height: 1.4;">
                    ${subject}
                  </h1>
                </td>
              </tr>
              
              <!-- Message Body -->
              <tr>
                <td style="padding: 16px 32px 32px;">
                  <div style="font-size: 14px; line-height: 1.8; color: #374151; font-family: 'Courier New', monospace;">
                    ${htmlContent}
                  </div>
                </td>
              </tr>
              
              <!-- Signature -->
              <tr>
                <td style="padding: 24px 32px; border-top: 2px dashed #1A1A1A;">
                  <p style="margin: 0 0 8px 0; font-size: 12px; color: #1A1A1A;">TRANSMITTED BY:</p>
                  <p style="margin: 0 0 4px 0; font-size: 14px; font-weight: 700; color: #1A1A1A;">UISU ARCHIVE OFFICE</p>
                  <p style="margin: 0; font-size: 11px; color: #64748B;">University of Ibadan Students' Union</p>
                </td>
              </tr>
              
              <!-- CTA -->
              <tr>
                <td style="padding: 0 32px 32px; text-align: center;">
                  <a href="https://uisu.lovable.app" style="display: inline-block; background-color: #1A1A1A; color: #C5A059; padding: 14px 32px; text-decoration: none; font-weight: 700; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; border: 2px solid #1A1A1A;">
                    ▸ ACCESS ARCHIVE ◂
                  </a>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #1A1A1A; padding: 20px 32px; text-align: center;">
                  <p style="margin: 0 0 4px 0; font-size: 14px; font-style: italic; color: #C5A059; font-family: Georgia, serif;">Father of Intellectual Unionism</p>
                  <p style="margin: 0; font-size: 10px; color: #64748B; letter-spacing: 2px;">EST. 1948</p>
                </td>
              </tr>
              
              <!-- Unsubscribe Footer -->
              <tr>
                <td style="padding: 20px 32px; text-align: center;">
                  <p style="margin: 0; font-size: 10px; color: #94A3B8; font-family: 'Courier New', monospace;">
                    You're receiving this telegram because you subscribed.
                  </p>
                  <p style="margin: 8px 0 0 0; font-size: 10px;">
                    <a href="${getUnsubscribeUrl(email)}" style="color: #64748B; text-decoration: underline;">Unsubscribe</a>
                    <span style="color: #CBD5E1; margin: 0 8px;">|</span>
                    <a href="https://uisu.lovable.app/privacy-policy" style="color: #64748B; text-decoration: none;">Privacy</a>
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

// Template: Art Deco Elegance
const generateArtDecoTemplate = (content: string, subject: string, email: string) => {
  const htmlContent = convertMarkdown(content);
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: Georgia, 'Times New Roman', serif; background-color: #0A0A0A;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0A0A0A;">
        <tr>
          <td align="center" style="padding: 48px 20px;">
            <table role="presentation" width="100%" style="max-width: 620px; background-color: #0F0F0F; border: 1px solid #C5A059;">
              
              <!-- Art Deco Header -->
              <tr>
                <td style="padding: 40px 40px 32px; text-align: center; background: linear-gradient(180deg, #151515 0%, #0F0F0F 100%);">
                  <!-- Deco Lines -->
                  <div style="margin-bottom: 20px;">
                    <span style="display: inline-block; width: 60px; height: 2px; background-color: #C5A059; vertical-align: middle;"></span>
                    <span style="display: inline-block; width: 8px; height: 8px; background-color: #C5A059; margin: 0 12px; transform: rotate(45deg); vertical-align: middle;"></span>
                    <span style="display: inline-block; width: 60px; height: 2px; background-color: #C5A059; vertical-align: middle;"></span>
                  </div>
                  <img src="${logoUrl}" alt="UISU" width="72" height="72" style="display: block; margin: 0 auto 16px;" />
                  <p style="margin: 0; font-size: 10px; color: #C5A059; text-transform: uppercase; letter-spacing: 6px; font-weight: 400;">The Archive</p>
                </td>
              </tr>
              
              <!-- Gold Border -->
              <tr>
                <td style="padding: 0 40px;">
                  <div style="height: 1px; background: linear-gradient(to right, transparent 0%, #C5A059 20%, #C5A059 80%, transparent 100%);"></div>
                </td>
              </tr>
              
              <!-- Title Section -->
              <tr>
                <td style="padding: 40px 48px 24px; text-align: center;">
                  <h1 style="margin: 0; font-size: 32px; font-weight: 400; color: #FFFFFF; line-height: 1.3; font-family: Georgia, serif; letter-spacing: 1px;">
                    ${subject}
                  </h1>
                </td>
              </tr>
              
              <!-- Decorative Divider -->
              <tr>
                <td style="padding: 0 48px 32px; text-align: center;">
                  <span style="display: inline-block; font-size: 18px; color: #C5A059;">◆ ◇ ◆</span>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 0 48px 40px;">
                  <div style="font-size: 17px; line-height: 1.9; color: #D1D5DB; font-family: Georgia, serif; text-align: left;">
                    ${htmlContent}
                  </div>
                </td>
              </tr>
              
              <!-- CTA Button -->
              <tr>
                <td style="padding: 0 48px 48px; text-align: center;">
                  <a href="https://uisu.lovable.app" style="display: inline-block; border: 2px solid #C5A059; color: #C5A059; padding: 16px 40px; text-decoration: none; font-weight: 400; font-size: 12px; letter-spacing: 4px; text-transform: uppercase; transition: all 0.3s;">
                    Enter the Archive
                  </a>
                </td>
              </tr>
              
              <!-- Bottom Deco -->
              <tr>
                <td style="padding: 0 40px;">
                  <div style="height: 1px; background: linear-gradient(to right, transparent 0%, #C5A059 20%, #C5A059 80%, transparent 100%);"></div>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="padding: 32px 48px; text-align: center;">
                  <p style="margin: 0 0 8px 0; font-size: 18px; font-style: italic; color: #C5A059; font-family: Georgia, serif;">Father of Intellectual Unionism</p>
                  <p style="margin: 0 0 16px 0; font-size: 11px; color: #64748B; letter-spacing: 3px;">UNIVERSITY OF IBADAN • EST. 1948</p>
                  <!-- Bottom Deco Lines -->
                  <div style="margin-top: 16px;">
                    <span style="display: inline-block; width: 40px; height: 1px; background-color: #C5A059; vertical-align: middle;"></span>
                    <span style="display: inline-block; width: 6px; height: 6px; background-color: #C5A059; margin: 0 10px; transform: rotate(45deg); vertical-align: middle;"></span>
                    <span style="display: inline-block; width: 40px; height: 1px; background-color: #C5A059; vertical-align: middle;"></span>
                  </div>
                </td>
              </tr>
              
              <!-- Unsubscribe Footer (dark) -->
              <tr>
                <td style="padding: 24px 48px; text-align: center; border-top: 1px solid #1F1F1F;">
                  <p style="margin: 0; font-size: 10px; color: #4B5563;">
                    You're receiving this because you subscribed to the UISU Archive newsletter.
                  </p>
                  <p style="margin: 8px 0 0 0; font-size: 10px;">
                    <a href="${getUnsubscribeUrl(email)}" style="color: #6B7280; text-decoration: underline;">Unsubscribe</a>
                    <span style="color: #374151; margin: 0 8px;">|</span>
                    <a href="https://uisu.lovable.app/privacy-policy" style="color: #6B7280; text-decoration: none;">Privacy</a>
                    <span style="color: #374151; margin: 0 8px;">|</span>
                    <a href="https://uisu.lovable.app/terms-of-service" style="color: #6B7280; text-decoration: none;">Terms</a>
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

// Template: Blueprint (blue header with illustration style, inspired by mfms)
const generateBlueprintTemplate = (content: string, subject: string, email: string) => {
  const htmlContent = convertMarkdown(content);
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #EEF2F7;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #EEF2F7;">
        <tr>
          <td align="center" style="padding: 48px 20px;">
            <table role="presentation" width="100%" style="max-width: 600px; background-color: #FFFFFF; border-radius: 0;">
              
              <!-- Blue Header -->
              <tr>
                <td style="background-color: #003366; padding: 48px 40px; text-align: center;">
                   <img src="${logoUrl}" alt="UISU" width="56" height="56" style="display: block; margin: 0 auto 16px; border-radius: 50%; background: rgba(255,255,255,0.2); padding: 8px;" />
                  <h1 style="margin: 0; font-size: 28px; font-weight: 800; color: #FFFFFF; line-height: 1.2; font-family: Georgia, serif;">
                    ${subject}
                  </h1>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px;">
                  <div style="font-size: 15px; line-height: 1.8; color: #374151;">
                    ${htmlContent}
                  </div>
                </td>
              </tr>
              
              <!-- CTA -->
              <tr>
                <td style="padding: 0 40px 40px; text-align: center;">
                   <a href="https://uisu.lovable.app" style="display: inline-block; background-color: #C5A059; color: #FFFFFF; padding: 14px 40px; text-decoration: none; font-weight: 600; font-size: 14px; border-radius: 24px;">
                     Visit UISU Archive
                   </a>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="padding: 24px 40px; border-top: 1px solid #E5E7EB; text-align: center;">
                  <p style="margin: 0 0 8px 0; font-size: 12px; color: #C5A059; font-style: italic; font-family: Georgia, serif;">Father of Intellectual Unionism</p>
                  <p style="margin: 0 0 16px 0; font-size: 10px; color: #9CA3AF;">University of Ibadan Students' Union • Est. 1948</p>
                  <p style="margin: 0; font-size: 10px; color: #9CA3AF;">
                    <a href="${getUnsubscribeUrl(email)}" style="color: #6B7280; text-decoration: underline;">Unsubscribe</a>
                    <span style="margin: 0 6px; color: #D1D5DB;">|</span>
                    <a href="https://uisu.lovable.app/privacy-policy" style="color: #6B7280; text-decoration: none;">Privacy</a>
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

// Template: Postbox (blue header with sections & bold CTA, inspired by mailbox design)
const generatePostboxTemplate = (content: string, subject: string, email: string) => {
  const htmlContent = convertMarkdown(content);
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #EEF2F7;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #EEF2F7;">
        <tr>
          <td align="center" style="padding: 48px 20px;">
            <table role="presentation" width="100%" style="max-width: 600px;">
              
              <!-- Blue Header with rounded top -->
              <tr>
                <td style="background-color: #003366; border-radius: 16px 16px 0 0; padding: 48px 40px; text-align: center;">
                  <img src="${logoUrl}" alt="UISU" width="52" height="52" style="display: block; margin: 0 auto 16px;" />
                  <h1 style="margin: 0 0 8px 0; font-size: 32px; font-weight: 800; color: #FFFFFF; line-height: 1.2; font-family: Georgia, serif;">
                    ${subject}
                  </h1>
                  <p style="margin: 0; font-size: 13px; color: rgba(255,255,255,0.75);">A dispatch from the Union Archive</p>
                </td>
              </tr>
              
              <!-- Content body -->
              <tr>
                <td style="background-color: #FFFFFF; padding: 40px;">
                  <div style="font-size: 15px; line-height: 1.85; color: #1F2937;">
                    ${htmlContent}
                  </div>
                </td>
              </tr>
              
              <!-- Full-width CTA band -->
              <tr>
                <td style="background-color: #C5A059; padding: 20px 40px; text-align: center;">
                   <a href="https://uisu.lovable.app" style="display: inline-block; color: #FFFFFF; padding: 14px 48px; text-decoration: none; font-weight: 700; font-size: 15px; letter-spacing: 0.5px;">
                     Explore the Archive →
                   </a>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #FFFFFF; border-radius: 0 0 16px 16px; padding: 28px 40px; text-align: center; border-top: 1px solid #E5E7EB;">
                  <p style="margin: 0 0 8px 0; font-size: 14px; font-style: italic; color: #C5A059; font-family: Georgia, serif;">Father of Intellectual Unionism</p>
                  <p style="margin: 0 0 16px 0; font-size: 10px; color: #9CA3AF;">University of Ibadan Students' Union • Est. 1948</p>
                  <p style="margin: 0; font-size: 10px; color: #9CA3AF;">
                    <a href="${getUnsubscribeUrl(email)}" style="color: #6B7280; text-decoration: underline;">Unsubscribe</a>
                    <span style="margin: 0 6px; color: #D1D5DB;">|</span>
                    <a href="https://uisu.lovable.app/privacy-policy" style="color: #6B7280; text-decoration: none;">Privacy</a>
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

// Template: Friendly (casual tone, blue footer band with social-style layout)
const generateFriendlyTemplate = (content: string, subject: string, email: string) => {
  const htmlContent = convertMarkdown(content);
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #F9FAFB;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #F9FAFB;">
        <tr>
          <td align="center" style="padding: 48px 20px;">
            <table role="presentation" width="100%" style="max-width: 600px;">
              
              <!-- Logo bar -->
              <tr>
                <td style="padding: 16px 0;">
                  <img src="${logoUrl}" alt="UISU" width="40" height="40" style="display: inline-block;" />
                  <span style="font-size: 16px; font-weight: 700; color: #003366; vertical-align: middle; margin-left: 8px; font-family: Georgia, serif;">UISU SPACE</span>
                </td>
              </tr>
              
              <!-- Content card -->
              <tr>
                <td style="background-color: #FFFFFF; border-radius: 8px; padding: 40px; box-shadow: 0 1px 3px rgba(0,0,0,0.08);">
                  <h1 style="margin: 0 0 20px 0; font-size: 26px; font-weight: 700; color: #111827; line-height: 1.3; font-family: Georgia, serif;">
                    ${subject}
                  </h1>
                  <div style="font-size: 15px; line-height: 1.85; color: #4B5563;">
                    ${htmlContent}
                  </div>
                  <p style="margin: 32px 0 0 0; font-size: 14px; color: #6B7280; font-style: italic;">— The UISU Archive Team</p>
                </td>
              </tr>
              
              <!-- Blue footer band -->
              <tr>
                <td style="background-color: #003366; border-radius: 8px; margin-top: 16px; padding: 24px 40px; text-align: center;">
                  <p style="margin: 0 0 4px 0; font-size: 12px; font-weight: 600; color: #FFFFFF;">University of Ibadan Students' Union</p>
                  <p style="margin: 0; font-size: 10px; color: rgba(255,255,255,0.75);">Est. 1948 • Father of Intellectual Unionism</p>
                </td>
              </tr>
              
              <!-- Unsubscribe -->
              <tr>
                <td style="padding: 20px 0; text-align: center;">
                  <p style="margin: 0; font-size: 10px; color: #9CA3AF;">
                    <a href="${getUnsubscribeUrl(email)}" style="color: #6B7280; text-decoration: underline;">Unsubscribe</a>
                    <span style="margin: 0 6px; color: #D1D5DB;">|</span>
                    <a href="https://uisu.lovable.app/privacy-policy" style="color: #6B7280; text-decoration: none;">Privacy</a>
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

// Template: Corporate (formal, logo at top, structured sections, blue accent)
const generateCorporateTemplate = (content: string, subject: string, email: string) => {
  const htmlContent = convertMarkdown(content);
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: Georgia, 'Times New Roman', serif; background-color: #FFFFFF;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #FFFFFF;">
        <tr>
          <td align="center" style="padding: 32px 20px;">
            <table role="presentation" width="100%" style="max-width: 600px;">
              
              <!-- Top logo -->
              <tr>
                <td style="padding: 16px 0 24px; border-bottom: 2px solid #003366;">
                   <img src="${logoUrl}" alt="UISU" width="44" height="44" style="display: inline-block; vertical-align: middle;" />
                   <span style="font-size: 18px; font-weight: 700; color: #003366; vertical-align: middle; margin-left: 10px;">UISU SPACE</span>
                </td>
              </tr>
              
              <!-- Subject -->
              <tr>
                <td style="padding: 32px 0 24px;">
                  <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #111827; line-height: 1.3;">
                    ${subject}
                  </h1>
                  <div style="width: 48px; height: 3px; background-color: #C5A059; margin-top: 16px;"></div>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 0 0 32px;">
                  <div style="font-size: 15px; line-height: 1.85; color: #374151;">
                    ${htmlContent}
                  </div>
                </td>
              </tr>
              
              <!-- CTA -->
              <tr>
                <td style="padding: 0 0 40px; text-align: center;">
                   <a href="https://uisu.lovable.app" style="display: inline-block; background-color: #003366; color: #FFFFFF; padding: 14px 40px; text-decoration: none; font-weight: 600; font-size: 14px; font-family: -apple-system, sans-serif;">
                     Visit the Archive
                   </a>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="padding: 24px 0; border-top: 1px solid #E5E7EB; text-align: center;">
                  <p style="margin: 0 0 6px 0; font-size: 13px; font-style: italic; color: #C5A059;">Father of Intellectual Unionism</p>
                  <p style="margin: 0 0 16px 0; font-size: 10px; color: #9CA3AF; font-family: -apple-system, sans-serif;">University of Ibadan Students' Union • Est. 1948</p>
                  <p style="margin: 0; font-size: 10px; color: #9CA3AF; font-family: -apple-system, sans-serif;">
                    <a href="${getUnsubscribeUrl(email)}" style="color: #6B7280; text-decoration: underline;">Unsubscribe</a>
                    <span style="margin: 0 6px; color: #D1D5DB;">|</span>
                    <a href="https://uisu.lovable.app/privacy-policy" style="color: #6B7280; text-decoration: none;">Privacy</a>
                    <span style="margin: 0 6px; color: #D1D5DB;">|</span>
                    <a href="https://uisu.lovable.app/terms-of-service" style="color: #6B7280; text-decoration: none;">Terms</a>
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

// Helper to convert markdown to HTML (also handles pre-formatted HTML)
const convertMarkdown = (content: string) => {
  // If content already contains HTML tags, pass it through
  if (/<[a-z][\s\S]*>/i.test(content)) {
    return content;
  }
  return content
    .replace(/\n\n/g, '</p><p style="margin: 0 0 20px 0;">')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br>')
    .replace(/^/, '<p style="margin: 0 0 20px 0;">')
    .replace(/$/, '</p>');
};

// Main template generator (without tracking pixel - added separately per campaign)
const generateNewsletterHtml = (content: string, subject: string, template: string = 'classic', email: string = '', customShell?: string, names?: RecipientNames) => {
  // If a custom template shell is provided, render it directly (takes priority over named templates)
  if (customShell && customShell.trim().length > 0) {
    return renderCustomTemplate(customShell, content, subject, email, names);
  }
  const personalizedContent = personalizeText(content, email, names);
  const personalizedSubject = personalizeText(subject, email, names);
  let rendered: string;
  switch (template) {
    case 'minimal': rendered = generateMinimalTemplate(personalizedContent, personalizedSubject, email); break;
    case 'announcement': rendered = generateAnnouncementTemplate(personalizedContent, personalizedSubject, email); break;
    case 'newspaper': rendered = generateNewspaperTemplate(personalizedContent, personalizedSubject, email); break;
    case 'longform': rendered = generateLongformTemplate(personalizedContent, personalizedSubject, email); break;
    case 'telegram': rendered = generateTelegramTemplate(personalizedContent, personalizedSubject, email); break;
    case 'artdeco': rendered = generateArtDecoTemplate(personalizedContent, personalizedSubject, email); break;
    case 'blueprint': rendered = generateBlueprintTemplate(personalizedContent, personalizedSubject, email); break;
    case 'postbox': rendered = generatePostboxTemplate(personalizedContent, personalizedSubject, email); break;
    case 'friendly': rendered = generateFriendlyTemplate(personalizedContent, personalizedSubject, email); break;
    case 'corporate': rendered = generateCorporateTemplate(personalizedContent, personalizedSubject, email); break;
    case 'classic':
    default: rendered = generateClassicTemplate(personalizedContent, personalizedSubject, email); break;
  }
  // Catch any remaining tokens the template's static shell may contain
  return personalizeText(rendered, email, names);
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

    const plunkApiKey = Deno.env.get("PLUNK_API_KEY");
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const plunk = plunkApiKey;

    const { campaignId, subject, content, template = 'classic', testEmail, scheduledAt, customTemplateHtml, abEnabled, abVariantA, abVariantB, senderName, audienceId, audienceEmails, previewOnly, previewEmail, previewFirstName, previewFullName }: SendNewsletterRequest = await req.json();

    if (!subject || !content) {
      throw new Error("Subject and content are required");
    }

    const fromHeader = buildFromHeader(senderName);
    const resolvedSenderName = sanitizeSenderName(senderName);
    console.log(`[send-newsletter] from header: ${fromHeader}`);

    // ---- Preview-only mode: render HTML for a chosen recipient and return it ----
    if (previewOnly) {
      const pEmail = (previewEmail || "preview@example.com").trim().toLowerCase();
      let names: RecipientNames = { first_name: previewFirstName || null, full_name: previewFullName || null };
      // Auto-fetch stored names if not provided
      if (!names.first_name && !names.full_name) {
        if (audienceId) {
          const { data: m } = await supabase
            .from("newsletter_audience_members")
            .select("first_name, full_name")
            .eq("audience_id", audienceId)
            .eq("email", pEmail)
            .maybeSingle();
          if (m) names = { first_name: (m as any).first_name, full_name: (m as any).full_name };
        }
        if (!names.first_name && !names.full_name) {
          const { data: s } = await supabase
            .from("newsletter_subscribers")
            .select("first_name")
            .eq("email", pEmail)
            .maybeSingle();
          if (s) names.first_name = (s as any).first_name;
        }
      }
      const html = generateNewsletterHtml(content, subject, template, pEmail, customTemplateHtml, names);
      return new Response(
        JSON.stringify({
          success: true,
          previewOnly: true,
          html,
          from: fromHeader,
          resolvedFirstName: resolveFirstName(pEmail, names),
          resolvedFullName: resolveFullName(pEmail, names),
        }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // If test email is provided, send only to that email (no tracking for tests)
    if (testEmail) {
      const htmlContent = generateNewsletterHtml(content, subject, template, testEmail, customTemplateHtml);
      const personalizedTestSubject = personalizeText(subject, testEmail);

      await fetch('https://api.useplunk.com/v1/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${plunkApiKey}` },
        body: JSON.stringify({
          name: (fromHeader.match(/^(.*?)\s*</) || [])[1] || undefined,
          from: (fromHeader.match(/<(.+)>/) || [])[1] || fromHeader,
          to: testEmail,
          subject: `[TEST] ${personalizedTestSubject}`,
          body: htmlContent
        })
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
        const { data: newCampaign, error: campaignError } = await supabase
          .from("newsletter_campaigns")
          .insert({
            subject,
            content,
            template,
            status: 'scheduled',
            scheduled_at: scheduledAt,
            html_content: generateNewsletterHtml(content, subject, template, 'preview@example.com', customTemplateHtml),
            sender_name: resolvedSenderName,
            audience_id: audienceId || null,
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

    // ---- Resolve recipient list (audience targeting) ----
    const normalizeEmail = (e: string) => (e || "").trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    type Recipient = { email: string; first_name?: string | null; full_name?: string | null };
    let recipients: Recipient[] = [];
    let audienceLabel = "all active subscribers";

    if (Array.isArray(audienceEmails) && audienceEmails.length > 0) {
      const seen = new Set<string>();
      for (const raw of audienceEmails) {
        const e = normalizeEmail(raw);
        if (emailRegex.test(e) && !seen.has(e)) { seen.add(e); recipients.push({ email: e }); }
      }
      audienceLabel = `custom list (${recipients.length} recipients)`;
    } else if (audienceId) {
      const { data: audience, error: audErr } = await supabase
        .from("newsletter_audiences")
        .select("id, name, type")
        .eq("id", audienceId)
        .single();
      if (audErr || !audience) throw new Error("Selected audience not found");
      audienceLabel = audience.name;
      if (audience.type === "all") {
        const { data: subs } = await supabase
          .from("newsletter_subscribers")
          .select("email, first_name")
          .eq("is_active", true);
        recipients = (subs || [])
          .map((s: any) => ({ email: normalizeEmail(s.email), first_name: s.first_name }))
          .filter((r) => emailRegex.test(r.email));
      } else {
        const { data: members } = await supabase
          .from("newsletter_audience_members")
          .select("email, first_name, full_name")
          .eq("audience_id", audienceId);
        const seen = new Set<string>();
        for (const m of members || []) {
          const e = normalizeEmail((m as any).email);
          if (emailRegex.test(e) && !seen.has(e)) {
            seen.add(e);
            recipients.push({ email: e, first_name: (m as any).first_name, full_name: (m as any).full_name });
          }
        }
      }
    } else {
      const { data: subs, error: subError } = await supabase
        .from("newsletter_subscribers")
        .select("email, first_name")
        .eq("is_active", true);
      if (subError) throw new Error("Failed to fetch subscribers");
      recipients = (subs || [])
        .map((s: any) => ({ email: normalizeEmail(s.email), first_name: s.first_name }))
        .filter((r) => emailRegex.test(r.email));
    }

    if (recipients.length === 0) {
      return new Response(
        JSON.stringify({ success: false, message: `No recipients found for ${audienceLabel}` }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const subscribers = recipients;

    // Create campaign record
    let activeCampaignId: string = campaignId || '';
    if (!activeCampaignId) {
      const { data: newCampaign, error: insertError } = await supabase
        .from("newsletter_campaigns")
        .insert({
          subject,
          content,
          template: abEnabled ? null : template,
          status: 'sending',
          recipients_count: subscribers.length,
          html_content: generateNewsletterHtml(content, subject, template, 'preview@example.com', customTemplateHtml),
          ab_enabled: abEnabled || false,
          ab_variant_a_template: abEnabled ? abVariantA : null,
          ab_variant_b_template: abEnabled ? abVariantB : null,
          sender_name: resolvedSenderName,
          audience_id: audienceId || null,
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
    let variantASent = 0;
    let variantBSent = 0;
    const sendErrors: Array<{ email: string; error: string }> = [];

    for (let i = 0; i < subscribers.length; i++) {
      const subscriber = subscribers[i];
      try {
        // Determine template - for A/B testing, alternate between variants
        let emailTemplate = template;
        let variant: 'A' | 'B' | null = null;
        
        if (abEnabled && abVariantA && abVariantB) {
          // Randomly assign to A or B (50/50 split)
          variant = Math.random() < 0.5 ? 'A' : 'B';
          emailTemplate = variant === 'A' ? abVariantA : abVariantB;
        }

        // Generate email with template (A/B custom shells not supported — only the primary path carries customTemplateHtml)
        const names: RecipientNames = { first_name: subscriber.first_name, full_name: subscriber.full_name };
        const baseHtml = generateNewsletterHtml(content, subject, emailTemplate, subscriber.email, abEnabled ? undefined : customTemplateHtml, names);
        // Add tracking pixel and wrap links
        const trackedHtml = addTrackingToHtml(baseHtml, activeCampaignId, subscriber.email);
        const personalizedSubject = personalizeText(subject, subscriber.email, names);

        await fetch('https://api.useplunk.com/v1/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${plunkApiKey}` },
          body: JSON.stringify({
            name: (fromHeader.match(/^(.*?)\s*</) || [])[1] || undefined,
          from: (fromHeader.match(/<(.+)>/) || [])[1] || fromHeader,
            to: subscriber.email,
            subject: personalizedSubject,
            body: trackedHtml
          })
        });
        successCount++;
        
        // Track variant assignment
        if (variant === 'A') variantASent++;
        if (variant === 'B') variantBSent++;

        // Store variant info in email_tracking for analytics
        if (abEnabled && variant) {
          await supabase.from("email_tracking").insert({
            campaign_id: activeCampaignId,
            subscriber_email: subscriber.email,
            event_type: 'sent',
            ab_variant: variant,
          });
        }
      } catch (error: any) {
        console.error(`Failed to send to ${subscriber.email}:`, error);
        failCount++;
        if (sendErrors.length < 50) {
          sendErrors.push({ email: subscriber.email, error: String(error?.message || error).slice(0, 500) });
        }
      }
    }

    // Update campaign record with final stats
    const updateData: Record<string, unknown> = {
      status: 'sent',
      sent_at: new Date().toISOString(),
      recipients_count: subscribers.length,
      successful_count: successCount,
      failed_count: failCount,
    };
    
    if (abEnabled) {
      updateData.ab_variant_a_sent = variantASent;
      updateData.ab_variant_b_sent = variantBSent;
    }

    await supabase
      .from("newsletter_campaigns")
      .update(updateData)
      .eq("id", activeCampaignId);

    // Write a send-history / audit-log entry for this campaign
    const audienceMode = Array.isArray(audienceEmails) && audienceEmails.length > 0
      ? "adhoc"
      : audienceId ? "saved" : "all";
    await supabase.from("newsletter_send_log").insert({
      campaign_id: activeCampaignId,
      sender_name: resolvedSenderName,
      audience_id: audienceId || null,
      audience_label: audienceLabel,
      audience_mode: audienceMode,
      recipients_count: subscribers.length,
      success_count: successCount,
      failed_count: failCount,
      status: failCount === 0 ? "completed" : successCount === 0 ? "failed" : "partial",
      errors: sendErrors,
      meta: {
        template,
        ab_enabled: !!abEnabled,
        ab_variant_a_sent: variantASent,
        ab_variant_b_sent: variantBSent,
        from: fromHeader,
      },
    });


    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Newsletter sent to ${successCount} subscribers (${failCount} failed)`,
        recipientsCount: subscribers.length,
        successCount,
        failCount,
        campaignId: activeCampaignId,
        abTesting: abEnabled ? { variantASent, variantBSent } : undefined
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

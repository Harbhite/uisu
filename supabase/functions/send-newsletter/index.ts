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
  testEmail?: string; // For test sending to a specific email
}

const logoUrl = "https://uisu.lovable.app/uisu-logo.png";

const generateNewsletterHtml = (content: string, subject: string) => {
  // Convert markdown-style content to HTML
  const htmlContent = content
    .replace(/\n\n/g, '</p><p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.7; color: #1a1a1a;">')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br>');

  return `
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
            <table role="presentation" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
              
              <!-- Header -->
              <tr>
                <td style="padding: 32px 32px 24px; border-bottom: 2px solid #0a2e52;">
                  <table role="presentation" width="100%">
                    <tr>
                      <td>
                        <p style="margin: 0; font-size: 12px; color: #c9a227; text-transform: uppercase; letter-spacing: 2px; font-weight: 600;">UISU Archive Newsletter</p>
                      </td>
                      <td align="right">
                        <img src="${logoUrl}" alt="UISU" width="48" height="48" />
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Title -->
              <tr>
                <td style="padding: 32px 32px 0;">
                  <h1 style="margin: 0 0 24px 0; font-size: 28px; font-weight: 700; color: #0a2e52; line-height: 1.3;">
                    ${subject}
                  </h1>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 0 32px 32px;">
                  <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.7; color: #1a1a1a;">
                    ${htmlContent}
                  </p>
                </td>
              </tr>
              
              <!-- CTA -->
              <tr>
                <td style="padding: 0 32px 32px;">
                  <a href="https://uisu.lovable.app" style="display: inline-block; background-color: #0a2e52; color: #ffffff; padding: 14px 32px; text-decoration: none; font-weight: 600; font-size: 14px; letter-spacing: 1px; border-radius: 4px;">
                    Visit the Archive →
                  </a>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="padding: 24px 32px; background-color: #f8f6f1; border-radius: 0 0 8px 8px;">
                  <table role="presentation" width="100%">
                    <tr>
                      <td>
                        <p style="margin: 0 0 4px 0; font-size: 16px; font-style: italic; color: #c9a227;">First and Best</p>
                        <p style="margin: 0; font-size: 12px; color: #888;">UISU Archive • University of Ibadan Students' Union</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Unsubscribe -->
              <tr>
                <td style="padding: 16px 32px; text-align: center;">
                  <p style="margin: 0; font-size: 11px; color: #888;">
                    You're receiving this because you subscribed to UISU Archive newsletter.
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

    const { campaignId, subject, content, testEmail }: SendNewsletterRequest = await req.json();

    if (!subject || !content) {
      throw new Error("Subject and content are required");
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY not configured");
    }
    
    const resend = new Resend(resendApiKey);
    const htmlContent = generateNewsletterHtml(content, subject);

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
        })
        .eq("id", campaignId);
    } else {
      await supabase
        .from("newsletter_campaigns")
        .insert({
          subject,
          content,
          html_content: htmlContent,
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

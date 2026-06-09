import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Plunk from "npm:@plunk/node@3.0.3";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const PLUNK_API_KEY = Deno.env.get("PLUNK_API_KEY");
const plunk = new Plunk(PLUNK_API_KEY || '');
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SubmissionNotificationRequest {
  type: "internship_approved" | "internship_rejected" | "cv_approved" | "cv_rejected";
  email: string;
  userId?: string;
  recipientName?: string;
  itemTitle: string;
  companyName?: string; // For internships
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      type, 
      email, 
      userId,
      recipientName,
      itemTitle,
      companyName
    }: SubmissionNotificationRequest = await req.json();

    console.log(`Processing ${type} notification for ${email}`);

    // Check user's email preferences if userId is provided
    if (userId && SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      const { data: profile } = await supabase
        .from('profiles')
        .select('email_notifications')
        .eq('id', userId)
        .single();

      if (profile?.email_notifications) {
        const prefs = profile.email_notifications as { submission_approved?: boolean; submission_rejected?: boolean };
        const isApproval = type.includes('approved');
        const isRejection = type.includes('rejected');
        
        if (isApproval && prefs.submission_approved === false) {
          console.log('User has opted out of approval notifications');
          return new Response(JSON.stringify({ success: true, skipped: true, reason: 'User opted out' }), {
            status: 200,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          });
        }
        
        if (isRejection && prefs.submission_rejected === false) {
          console.log('User has opted out of rejection notifications');
          return new Response(JSON.stringify({ success: true, skipped: true, reason: 'User opted out' }), {
            status: 200,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          });
        }
      }
    }

    let subject: string;
    let body: string;
    const greeting = recipientName ? `Hello ${recipientName},` : 'Hello,';

    if (type === "internship_approved") {
      subject = "🎉 Your Internship Submission Has Been Approved!";
      html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f9fafb;">
          <div style="max-width: 560px; margin: 0 auto; padding: 40px 20px;">
            <div style="background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); overflow: hidden;">
              <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 32px; text-align: center;">
                <h1 style="color: #d4af37; margin: 0; font-size: 24px; font-weight: 600;">UISU Career Hub</h1>
              </div>
              <div style="padding: 32px;">
                <div style="text-align: center; margin-bottom: 24px;">
                  <span style="font-size: 48px;">🎉</span>
                </div>
                <h2 style="color: #1a1a2e; margin: 0 0 16px; font-size: 20px; text-align: center;">Submission Approved!</h2>
                <p style="color: #4a5568; line-height: 1.6; margin: 0 0 16px;">
                  ${greeting}
                </p>
                <p style="color: #4a5568; line-height: 1.6; margin: 0 0 16px;">
                  Great news! Your internship submission has been reviewed and approved. It's now visible to all students on the Career Hub.
                </p>
                <div style="background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 16px; margin: 24px 0;">
                  <p style="color: #1e40af; margin: 0 0 8px; font-weight: 600;">Internship Details:</p>
                  <p style="color: #1e40af; margin: 0; font-size: 16px;"><strong>${itemTitle}</strong></p>
                  ${companyName ? `<p style="color: #3b82f6; margin: 4px 0 0; font-size: 14px;">${companyName}</p>` : ''}
                </div>
                <p style="color: #4a5568; line-height: 1.6; margin: 16px 0 0;">
                  Thank you for contributing to the UISU community!
                </p>
              </div>
              <div style="background: #f9fafb; padding: 20px 32px; text-align: center; border-top: 1px solid #e5e7eb;">
                <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                  University of Ibadan Students' Union Career Hub
                </p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;
    } else if (type === "internship_rejected") {
      subject = "Update on Your Internship Submission";
      html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f9fafb;">
          <div style="max-width: 560px; margin: 0 auto; padding: 40px 20px;">
            <div style="background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); overflow: hidden;">
              <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 32px; text-align: center;">
                <h1 style="color: #d4af37; margin: 0; font-size: 24px; font-weight: 600;">UISU Career Hub</h1>
              </div>
              <div style="padding: 32px;">
                <h2 style="color: #1a1a2e; margin: 0 0 16px; font-size: 20px;">Submission Update</h2>
                <p style="color: #4a5568; line-height: 1.6; margin: 0 0 16px;">
                  ${greeting}
                </p>
                <p style="color: #4a5568; line-height: 1.6; margin: 0 0 16px;">
                  We've reviewed your internship submission but unfortunately, it doesn't meet our current guidelines.
                </p>
                <div style="background: #fef3f2; border-left: 4px solid #ef4444; padding: 16px; margin: 24px 0;">
                  <p style="color: #991b1b; margin: 0; font-size: 14px;">
                    <strong>Submission:</strong> ${itemTitle}${companyName ? ` at ${companyName}` : ''}
                  </p>
                </div>
                <p style="color: #4a5568; line-height: 1.6; margin: 16px 0 0;">
                  Please feel free to submit again with updated information. If you have questions, contact our support team.
                </p>
              </div>
              <div style="background: #f9fafb; padding: 20px 32px; text-align: center; border-top: 1px solid #e5e7eb;">
                <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                  University of Ibadan Students' Union Career Hub
                </p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;
    } else if (type === "cv_approved") {
      subject = "🎉 Your CV Template Has Been Approved!";
      html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f9fafb;">
          <div style="max-width: 560px; margin: 0 auto; padding: 40px 20px;">
            <div style="background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); overflow: hidden;">
              <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 32px; text-align: center;">
                <h1 style="color: #d4af37; margin: 0; font-size: 24px; font-weight: 600;">UISU Career Hub</h1>
              </div>
              <div style="padding: 32px;">
                <div style="text-align: center; margin-bottom: 24px;">
                  <span style="font-size: 48px;">📄</span>
                </div>
                <h2 style="color: #1a1a2e; margin: 0 0 16px; font-size: 20px; text-align: center;">CV Template Approved!</h2>
                <p style="color: #4a5568; line-height: 1.6; margin: 0 0 16px;">
                  ${greeting}
                </p>
                <p style="color: #4a5568; line-height: 1.6; margin: 0 0 16px;">
                  Your CV template has been approved and is now available for other students to download in the Career Hub.
                </p>
                <div style="background: #f0fdf4; border-left: 4px solid #22c55e; padding: 16px; margin: 24px 0;">
                  <p style="color: #166534; margin: 0; font-weight: 600;">Template Name:</p>
                  <p style="color: #166534; margin: 4px 0 0; font-size: 16px;">${itemTitle}</p>
                </div>
                <p style="color: #4a5568; line-height: 1.6; margin: 16px 0 0;">
                  Thank you for helping fellow students with their career journey!
                </p>
              </div>
              <div style="background: #f9fafb; padding: 20px 32px; text-align: center; border-top: 1px solid #e5e7eb;">
                <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                  University of Ibadan Students' Union Career Hub
                </p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;
    } else {
      // cv_rejected
      subject = "Update on Your CV Template Submission";
      html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f9fafb;">
          <div style="max-width: 560px; margin: 0 auto; padding: 40px 20px;">
            <div style="background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); overflow: hidden;">
              <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 32px; text-align: center;">
                <h1 style="color: #d4af37; margin: 0; font-size: 24px; font-weight: 600;">UISU Career Hub</h1>
              </div>
              <div style="padding: 32px;">
                <h2 style="color: #1a1a2e; margin: 0 0 16px; font-size: 20px;">Submission Update</h2>
                <p style="color: #4a5568; line-height: 1.6; margin: 0 0 16px;">
                  ${greeting}
                </p>
                <p style="color: #4a5568; line-height: 1.6; margin: 0 0 16px;">
                  We've reviewed your CV template submission but unfortunately, it doesn't meet our quality standards at this time.
                </p>
                <div style="background: #fef3f2; border-left: 4px solid #ef4444; padding: 16px; margin: 24px 0;">
                  <p style="color: #991b1b; margin: 0; font-size: 14px;">
                    <strong>Template:</strong> ${itemTitle}
                  </p>
                </div>
                <p style="color: #4a5568; line-height: 1.6; margin: 16px 0 0;">
                  Please review our template guidelines and feel free to submit again with improvements.
                </p>
              </div>
              <div style="background: #f9fafb; padding: 20px 32px; text-align: center; border-top: 1px solid #e5e7eb;">
                <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                  University of Ibadan Students' Union Career Hub
                </p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;
    }

    const plunk = new Plunk(PLUNK_API_KEY || '');
    const resData = await plunk.emails.send({
        name: 'UISU Career Hub',
        from: 'onboarding@resend.dev',
        to: email,
        subject: subject,
        body: html,
      });
    const res = { ok: true, json: async () => resData };

    const emailResponse = await res.json();

    if (!res.ok) {
      console.error("Plunk API error:", emailResponse);
      throw new Error(emailResponse.message || "Failed to send email");
    }

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error) {
    console.error("Error in send-submission-notification function:", error);
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);

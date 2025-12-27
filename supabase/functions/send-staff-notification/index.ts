import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface StaffNotificationRequest {
  type: "invite" | "role_change";
  email: string;
  recipientName?: string;
  role: "admin" | "moderator";
  previousRole?: string;
  invitedBy?: string;
  inviteLink?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      type, 
      email, 
      recipientName, 
      role, 
      previousRole, 
      invitedBy, 
      inviteLink 
    }: StaffNotificationRequest = await req.json();

    console.log(`Processing ${type} notification for ${email}`);

    let subject: string;
    let html: string;

    if (type === "invite") {
      subject = "You've been invited to join UISU Archive as Staff";
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
                <h1 style="color: #d4af37; margin: 0; font-size: 24px; font-weight: 600;">UISU Archive</h1>
              </div>
              <div style="padding: 32px;">
                <h2 style="color: #1a1a2e; margin: 0 0 16px; font-size: 20px;">You're Invited!</h2>
                <p style="color: #4a5568; line-height: 1.6; margin: 0 0 16px;">
                  ${invitedBy ? `<strong>${invitedBy}</strong> has invited you` : "You've been invited"} to join the UISU Archive team as a <strong style="color: #d4af37;">${role === 'admin' ? 'Administrator' : 'Moderator'}</strong>.
                </p>
                <p style="color: #4a5568; line-height: 1.6; margin: 0 0 24px;">
                  ${role === 'admin' 
                    ? "As an Administrator, you'll have full access to manage all content, staff, and settings." 
                    : "As a Moderator, you'll be able to manage events, announcements, documents, clubs, and past leaders."}
                </p>
                ${inviteLink ? `
                <div style="text-align: center; margin: 24px 0;">
                  <a href="${inviteLink}" style="display: inline-block; background: #3b82f6; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px;">
                    Accept Invitation
                  </a>
                </div>
                <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 16px 0 0;">
                  Or copy this link: <span style="color: #6b7280;">${inviteLink}</span>
                </p>
                ` : `
                <p style="color: #4a5568; line-height: 1.6; margin: 0;">
                  Please contact your administrator to complete the registration process.
                </p>
                `}
              </div>
              <div style="background: #f9fafb; padding: 20px 32px; text-align: center; border-top: 1px solid #e5e7eb;">
                <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                  University of Ibadan Students' Union Archive
                </p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;
    } else {
      // role_change notification
      const isPromotion = previousRole === 'moderator' && role === 'admin';
      subject = isPromotion 
        ? "Congratulations! You've been promoted to Administrator" 
        : "Your role has been updated on UISU Archive";
      
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
                <h1 style="color: #d4af37; margin: 0; font-size: 24px; font-weight: 600;">UISU Archive</h1>
              </div>
              <div style="padding: 32px;">
                <h2 style="color: #1a1a2e; margin: 0 0 16px; font-size: 20px;">
                  ${isPromotion ? '🎉 Congratulations!' : 'Role Update'}
                </h2>
                <p style="color: #4a5568; line-height: 1.6; margin: 0 0 16px;">
                  ${recipientName ? `Hello ${recipientName},` : 'Hello,'}
                </p>
                <p style="color: #4a5568; line-height: 1.6; margin: 0 0 16px;">
                  Your role on UISU Archive has been ${isPromotion ? 'upgraded' : 'updated'} from 
                  <strong>${previousRole === 'admin' ? 'Administrator' : 'Moderator'}</strong> to 
                  <strong style="color: #d4af37;">${role === 'admin' ? 'Administrator' : 'Moderator'}</strong>.
                </p>
                <p style="color: #4a5568; line-height: 1.6; margin: 0 0 24px;">
                  ${role === 'admin' 
                    ? "You now have full access to manage all content, staff, and system settings." 
                    : "You can now manage events, announcements, documents, clubs, and past leaders."}
                </p>
                <div style="text-align: center; margin: 24px 0;">
                  <a href="${Deno.env.get("SUPABASE_URL")?.replace('.supabase.co', '.lovable.app') || 'https://uisu-archive.lovable.app'}/admin" style="display: inline-block; background: #3b82f6; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px;">
                    Go to Dashboard
                  </a>
                </div>
              </div>
              <div style="background: #f9fafb; padding: 20px 32px; text-align: center; border-top: 1px solid #e5e7eb;">
                <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                  University of Ibadan Students' Union Archive
                </p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "UISU Archive <onboarding@resend.dev>",
        to: [email],
        subject: subject,
        html: html,
      }),
    });

    const emailResponse = await res.json();

    if (!res.ok) {
      console.error("Resend API error:", emailResponse);
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
  } catch (error: any) {
    console.error("Error in send-staff-notification function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);

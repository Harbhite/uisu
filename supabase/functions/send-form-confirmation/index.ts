import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { formTitle, respondentName, respondentEmail, confirmationMessage } = await req.json();

    const PLUNK_API_KEY = Deno.env.get('PLUNK_API_KEY');
    if (!PLUNK_API_KEY) {
      return new Response(JSON.stringify({ error: 'Missing PLUNK_API_KEY' }), { status: 500, headers: corsHeaders });
    }

    if (!respondentEmail) {
      return new Response(JSON.stringify({ message: 'No respondent email provided' }), { headers: corsHeaders });
    }

    const greeting = respondentName ? `Hi ${respondentName},` : 'Hi,';

    const emailHtml = `
      <div style="font-family: Georgia, serif; max-width: 520px; margin: 0 auto; padding: 32px 24px;">
        <div style="border-bottom: 2px solid #003366; padding-bottom: 16px; margin-bottom: 24px;">
          <h2 style="color: #003366; margin: 0; font-size: 20px; font-weight: 600;">Submission Received</h2>
        </div>
        <p style="color: #333; font-size: 15px; line-height: 1.6;">${greeting}</p>
        <p style="color: #333; font-size: 15px; line-height: 1.6;">Your response to <strong>${formTitle}</strong> has been submitted successfully.</p>
        <div style="background: #f8f7f4; border-left: 3px solid #003366; padding: 16px 20px; margin: 24px 0;">
          <p style="color: #555; font-size: 14px; margin: 0; line-height: 1.5;">${confirmationMessage}</p>
        </div>
        <p style="color: #999; font-size: 12px; margin-top: 32px; border-top: 1px solid #eee; padding-top: 16px;">
          UISU Archive Forms — University of Ibadan Students' Union
        </p>
      </div>
    `;

    const res = await fetch('https://api.useplunk.com/v1/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${PLUNK_API_KEY}` },
      body: JSON.stringify({
        name: 'UISU Forms',
        from: 'noreply@uisu.space',
        to: respondentEmail,
        subject: `Submission confirmed: ${formTitle}`,
        body: emailHtml,
      }),
    });

    const result = await res.json();
    if (!res.ok) {
      console.error("Plunk API error:", result);
      throw new Error(result.message || "Failed to send email");
    }
    return new Response(JSON.stringify(result), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500, headers: corsHeaders });
  }
});

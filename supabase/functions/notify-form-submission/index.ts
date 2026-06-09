import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Plunk from "npm:@plunk/node@3.0.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { formTitle, formId, respondentName, respondentEmail, notifyEmails } = await req.json();

    const PLUNK_API_KEY = Deno.env.get('PLUNK_API_KEY');
const plunk = new Plunk(PLUNK_API_KEY || '');
    if (!PLUNK_API_KEY) {
      return new Response(JSON.stringify({ error: 'Missing PLUNK_API_KEY' }), { status: 500, headers: corsHeaders });
    }

    if (!notifyEmails || notifyEmails.length === 0) {
      return new Response(JSON.stringify({ message: 'No notification emails configured' }), { headers: corsHeaders });
    }

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #003366;">New Form Submission</h2>
        <p>A new response was submitted to <strong>${formTitle}</strong>.</p>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          <tr><td style="padding: 8px; color: #666;">Form</td><td style="padding: 8px; font-weight: bold;">${formTitle}</td></tr>
          ${respondentName ? `<tr><td style="padding: 8px; color: #666;">Name</td><td style="padding: 8px;">${respondentName}</td></tr>` : ''}
          ${respondentEmail ? `<tr><td style="padding: 8px; color: #666;">Email</td><td style="padding: 8px;">${respondentEmail}</td></tr>` : ''}
        </table>
        <a href="https://uisu.lovable.app/forms/responses/${formId}" style="display: inline-block; padding: 10px 20px; background: #003366; color: white; text-decoration: none; border-radius: 6px;">View Responses</a>
        <p style="color: #999; font-size: 12px; margin-top: 24px;">UISU Archive Forms</p>
      </div>
    `;

    const plunk = new Plunk(PLUNK_API_KEY || '');
    const resData = await plunk.emails.send({
        name: 'UISU Forms',
        from: 'noreply@uisu.space',
        to: notifyEmails,
        subject: `New response: ${formTitle}`,
        body: emailHtml,
      });
    const res = { ok: true, json: async () => resData };

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

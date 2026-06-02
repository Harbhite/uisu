// Newsletter template AI assistant — generate or edit HTML shells from natural-language prompts.
// Uses Lovable AI → Gemini direct → Qwen failover (same pattern as study-buddy).
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LOVABLE_GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";
const GEMINI_GATEWAY = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";
const QWEN_GATEWAY = "https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions";

async function callWithFallback(body: Record<string, unknown>) {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
  const QWEN_API_KEY = Deno.env.get("QWEN_API_KEY");

  if (LOVABLE_API_KEY) {
    const r = await fetch(LOVABLE_GATEWAY, {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (r.ok) return { r, provider: "lovable" };
    if (r.status !== 429 && r.status !== 402) return { r, provider: "lovable" };
    await r.text();
  }
  if (GEMINI_API_KEY) {
    const r = await fetch(GEMINI_GATEWAY, {
      method: "POST",
      headers: { Authorization: `Bearer ${GEMINI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ ...body, model: "gemini-2.5-flash" }),
    });
    if (r.ok) return { r, provider: "gemini" };
    await r.text();
  }
  if (!QWEN_API_KEY) throw new Error("No AI providers available");
  const r = await fetch(QWEN_GATEWAY, {
    method: "POST",
    headers: { Authorization: `Bearer ${QWEN_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ ...body, model: "qwen-plus" }),
  });
  return { r, provider: "qwen" };
}

const SYSTEM_PROMPT = `You are an expert email-newsletter HTML designer for UISU SPACE (University of Ibadan student union).

Your job is to produce a COMPLETE, email-client-safe HTML shell suitable for direct use as a newsletter template.

STRICT REQUIREMENTS — your output MUST follow ALL of these:
1. Output ONLY the raw HTML — no markdown fences, no explanation, no comments before/after.
2. Start with <!DOCTYPE html> and end with </html>.
3. Use table-based layout (<table cellpadding cellspacing border>) for maximum email-client compatibility (Gmail, Outlook, Apple Mail).
4. Use inline styles only — no <style> tags, no external CSS, no <script>, no flexbox, no grid.
5. The shell MUST contain the literal token {{content}} where the dynamic body content will be injected.
6. The shell SHOULD also include these optional tokens where appropriate:
   - {{subject}} — newsletter subject line (use in <title> and the main heading area)
   - {{email}} — recipient's email address (use in footer "Sent to …")
   - {{unsubscribe_url}} — unsubscribe link (use in footer as href)
7. Use UISU brand colors: navy #003366 (primary), gold #C5A059 (accent), warm off-white #f5f3ee (background), dark text #1a1a1a.
8. Keep total width ≤ 600px (constrain the main container table).
9. Use web-safe fonts (Georgia, Arial, Helvetica) — no @font-face, no Google Fonts links.
10. Include responsive-friendly font sizes (≥14px body, ≥24px main heading).
11. Footer must include unsubscribe link.

If the user provides EXISTING HTML, treat it as the starting point and apply their edit instructions surgically. Preserve existing structure where possible.
If the user only gives a high-level prompt, design a fresh template from scratch matching their description.`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { prompt, existingHtml, mode } = await req.json();
    if (!prompt || typeof prompt !== "string") {
      return new Response(JSON.stringify({ error: "prompt is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userMessage = existingHtml
      ? `EDIT the following template per these instructions:\n\nINSTRUCTIONS: ${prompt}\n\nEXISTING HTML:\n${existingHtml}`
      : `CREATE a new newsletter template matching this brief: ${prompt}`;

    const { r, provider } = await callWithFallback({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ],
      stream: false,
    });

    if (!r.ok) {
      const t = await r.text();
      console.error(`${provider} error`, r.status, t);
      return new Response(JSON.stringify({ error: "AI generation failed" }), {
        status: r.status === 402 ? 402 : r.status === 429 ? 429 : 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await r.json();
    let html: string = data.choices?.[0]?.message?.content || "";

    // Strip markdown fences if model leaked any
    html = html.trim()
      .replace(/^```html\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();

    // Lightweight validation
    const issues: string[] = [];
    if (!html.includes("{{content}}")) issues.push("Missing required {{content}} token — content will not be injected.");
    if (!/^<!DOCTYPE/i.test(html)) issues.push("Missing <!DOCTYPE html> declaration.");
    if (!/<\/html>/i.test(html)) issues.push("Missing closing </html> tag.");
    if (/<script/i.test(html)) issues.push("Contains <script> tag — not allowed in email clients.");

    return new Response(JSON.stringify({ html, issues, provider, mode: mode || (existingHtml ? "edit" : "create") }), {
      headers: { ...corsHeaders, "Content-Type": "application/json", "X-AI-Provider": provider },
    });
  } catch (e) {
    console.error("newsletter-template-ai error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

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

const UISU_LOGO_URL = "https://uisu.lovable.app/newsletter-logo.png";

const SYSTEM_PROMPT = `You are an award-winning email-newsletter art director for UISU SPACE — the official student union of the University of Ibadan. Your work has the polish of The New York Times Morning Briefing, the editorial gravitas of Monocle, and the warmth of a campus weekly.

Your job: produce a COMPLETE, email-client-safe HTML shell that is genuinely beautiful, distinctive, and on-brand — not a generic boxed template.

=== CREATIVE BAR ===
- Push the design. Use editorial layouts: bold mastheads, rule lines, oversized serif drop-caps, gold dividers, two-tone navy/gold ribbons, numbered section markers, small-caps eyebrow labels, footer colophons.
- Vary structure between templates — don't default to the same centered card every time. Consider: full-bleed navy mastheads, asymmetric two-column intros, gold accent bars, deckle-edge dividers (using CSS borders + background), framed pull-quote zones, vintage gazette mastheads, modern minimalist briefings, etc.
- Treat each generation as a unique editorial product, not a wireframe.

=== MANDATORY UISU LOGO ===
Every template MUST include the UISU logo prominently in the masthead/header area using this exact URL:
  <img src="${UISU_LOGO_URL}" alt="UISU SPACE" width="120" style="display:block;border:0;outline:none;text-decoration:none;max-width:120px;height:auto;" />
The logo MUST appear inside the rendered HTML (typically header), not just referenced.

=== STRICT TECHNICAL REQUIREMENTS ===
1. Output ONLY raw HTML — no markdown fences, no prose before/after.
2. Start with <!DOCTYPE html>, end with </html>.
3. Table-based layout (<table cellpadding cellspacing border="0">) for max email-client compatibility (Gmail, Outlook, Apple Mail).
4. INLINE styles only — no <style> tags, no <script>, no flex, no grid, no @media.
5. MUST contain the literal token {{content}} where dynamic body content is injected.
6. SHOULD include where appropriate: {{subject}} (in <title> + headline), {{email}} (footer "Sent to …"), {{unsubscribe_url}} (footer href).
7. Brand colors: navy #003366 (primary), gold #C5A059 (accent), warm off-white #f5f3ee (background), ink #1a1a1a (body text).
8. Container width 600px max.
9. Web-safe fonts only: Georgia (serif, for headings/editorial), Arial / Helvetica (sans, for body). No webfont links.
10. Font sizes: body ≥14px, main heading ≥24px, eyebrow labels ~11px uppercase letter-spacing.
11. Footer MUST include the UISU wordmark/colophon, copyright, and a working unsubscribe link using {{unsubscribe_url}}.

If the user provides EXISTING HTML, treat it as the starting point and apply edits surgically while preserving the logo + required tokens. If no existing HTML, design a fresh, distinctive template matching the brief.`;

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
      model: "google/gemini-2.5-pro",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ],
      temperature: 0.95,
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

    // Auto-inject UISU logo if the model forgot it
    if (!html.includes("newsletter-logo.png") && !html.includes("uisu-logo")) {
      const logoTag = `<img src="${UISU_LOGO_URL}" alt="UISU SPACE" width="120" style="display:block;border:0;outline:none;text-decoration:none;max-width:120px;height:auto;margin:0 auto 16px;" />`;
      // Try to insert right after <body ...> opening tag
      html = html.replace(/<body([^>]*)>/i, (m) => `${m}\n${logoTag}\n`);
    }

    // Lightweight validation
    const issues: string[] = [];
    if (!html.includes("{{content}}")) issues.push("Missing required {{content}} token — content will not be injected.");
    if (!/^<!DOCTYPE/i.test(html)) issues.push("Missing <!DOCTYPE html> declaration.");
    if (!/<\/html>/i.test(html)) issues.push("Missing closing </html> tag.");
    if (/<script/i.test(html)) issues.push("Contains <script> tag — not allowed in email clients.");
    if (!html.includes("newsletter-logo.png") && !html.includes("uisu-logo")) issues.push("Missing UISU logo.");

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

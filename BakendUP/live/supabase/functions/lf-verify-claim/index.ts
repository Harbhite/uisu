// Generate verification questions + fraud risk for a claim on a found item.
// Input: { foundItemId, claimText }   OR { foundItemId, generateQuestionsOnly: true }
// Output: { questions: string[], fraud_score: 0-100, fraud_reasons: string }
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { foundItemId, claimText, generateQuestionsOnly } = await req.json();
    if (!foundItemId) return new Response(JSON.stringify({ error: "foundItemId required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: item, error } = await sb.from("lost_found_items").select("*").eq("id", foundItemId).single();
    if (error) throw error;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    const attrs = item.ai_attributes || {};
    const body = {
      model: "google/gemini-2.5-flash-lite",
      messages: [
        { role: "system", content: "You help verify ownership of found items on a university Lost & Found board, while protecting the finder from fraud." },
        { role: "user", content:
`FOUND ITEM (known to finder, hidden from claimant in the UI):
title: ${item.title}
category: ${item.category}
location: ${item.location || "?"}
description: ${item.description || "(none)"}
attributes: ${JSON.stringify(attrs)}

CLAIM TEXT FROM CLAIMANT:
${generateQuestionsOnly ? "(none yet — only generating questions)" : claimText || "(empty)"}

Tasks:
1) Generate exactly 2 verification questions ONLY the true owner could plausibly answer based on the description (e.g. distinguishing marks, contents, screen wallpaper, a sticker, engraving). Do NOT reveal the answers in the questions.
2) ${generateQuestionsOnly ? 'Return fraud_score=0 and fraud_reasons="".' : "Score the claim text 0-100 for fraud risk (high = vague, contradictory, doesn't match the description). Give brief reasons."}` }
      ],
      tools: [{
        type: "function",
        function: {
          name: "return_verification",
          parameters: {
            type: "object",
            properties: {
              questions: { type: "array", items: { type: "string" }, minItems: 2, maxItems: 2 },
              fraud_score: { type: "number" },
              fraud_reasons: { type: "string" },
            },
            required: ["questions","fraud_score","fraud_reasons"],
            additionalProperties: false,
          },
        },
      }],
      tool_choice: { type: "function", function: { name: "return_verification" } },
    };

    const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!r.ok) {
      const t = await r.text(); console.error("verify error", r.status, t);
      return new Response(JSON.stringify({ error: "AI failed" }), { status: r.status === 429 ? 429 : 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const data = await r.json();
    const args = data.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    return new Response(args || JSON.stringify({ questions: [], fraud_score: 0, fraud_reasons: "" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("lf-verify-claim", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

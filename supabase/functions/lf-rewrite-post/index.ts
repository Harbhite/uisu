// Auto-translate / rewrite L&F post into clear searchable English
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { itemId } = await req.json();
    if (!itemId) return new Response(JSON.stringify({ error: "itemId required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: item } = await sb.from("lost_found_items").select("title, description, category, location, item_type").eq("id", itemId).single();
    if (!item) return new Response(JSON.stringify({ error: "not found" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    const prompt = `Original ${item.item_type} post:
Title: ${item.title}
Category: ${item.category}
Location: ${item.location || "unspecified"}
Description: ${item.description || "(none)"}

Rewrite this into 1–2 clear, searchable English sentences. Preserve every concrete detail (color, brand, marks). Translate any non-English. Output only the rewritten description, no preface.`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [{ role: "user", content: prompt }],
      }),
    });
    if (!res.ok) return new Response(JSON.stringify({ error: "AI failed" }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    const data = await res.json();
    const rewritten = data.choices?.[0]?.message?.content?.trim() || "";
    if (rewritten) {
      await sb.from("lost_found_items").update({ ai_rewritten_description: rewritten }).eq("id", itemId);
    }
    return new Response(JSON.stringify({ rewritten }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "err" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});

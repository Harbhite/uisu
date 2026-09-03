// When a "found" item is posted, scan last 30 days of "lost" items and persist top matches.
// Input: { foundItemId }
// Output: { matches: [{ lostItem, confidence, reason }] }
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { foundItemId } = await req.json();
    if (!foundItemId) {
      return new Response(JSON.stringify({ error: "foundItemId required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const { data: found, error: fe } = await sb.from("lost_found_items").select("*").eq("id", foundItemId).single();
    if (fe) throw fe;
    if (found.item_type !== "found") {
      return new Response(JSON.stringify({ matches: [], skipped: "not a found item" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const since = new Date(Date.now() - 30*24*60*60*1000).toISOString();
    const { data: lostItems } = await sb
      .from("lost_found_items")
      .select("id, user_id, title, description, category, location, created_at")
      .eq("status", "active")
      .eq("item_type", "lost")
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(120);

    if (!lostItems?.length) {
      return new Response(JSON.stringify({ matches: [] }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const list = lostItems.map((it, i) => `[${i}] "${it.title}" | ${it.category} | ${it.location || "?"} | ${(it.description || "").slice(0,150)}`).join("\n");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    const body = {
      model: "google/gemini-2.5-flash-lite",
      messages: [
        { role: "system", content: "You match found-item reports to recent lost-item reports on a university Lost & Found board. Only return genuine matches." },
        { role: "user", content:
`FOUND ITEM:
title: ${found.title}
category: ${found.category}
location: ${found.location || "unknown"}
description: ${found.description || "(none)"}

RECENT LOST REPORTS (last 30 days):
${list}

Return up to 3 most likely matches, ranked.` }
      ],
      tools: [{
        type: "function",
        function: {
          name: "return_matches",
          parameters: {
            type: "object",
            properties: {
              matches: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    index: { type: "number" },
                    confidence: { type: "string", enum: ["high","medium","low"] },
                    reason: { type: "string" },
                  },
                  required: ["index","confidence","reason"],
                  additionalProperties: false,
                },
              },
            },
            required: ["matches"],
            additionalProperties: false,
          },
        },
      }],
      tool_choice: { type: "function", function: { name: "return_matches" } },
    };

    const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!r.ok) {
      const t = await r.text();
      console.error("process-found error", r.status, t);
      return new Response(JSON.stringify({ matches: [], error: "AI failed" }), { status: r.status === 429 ? 429 : 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const data = await r.json();
    const args = data.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    const parsed = args ? JSON.parse(args) : { matches: [] };

    const top = (parsed.matches || [])
      .filter((m: any) => m.index >= 0 && m.index < lostItems.length)
      .slice(0, 3);

    // Persist matches (only high/medium)
    const persisted = [];
    for (const m of top) {
      if (m.confidence === "low") continue;
      const lostItem = lostItems[m.index];
      const { error } = await sb.from("lost_found_matches").upsert({
        lost_item_id: lostItem.id,
        found_item_id: foundItemId,
        confidence: m.confidence,
        reason: m.reason,
      }, { onConflict: "lost_item_id,found_item_id" });
      if (!error) persisted.push({ lostItem, confidence: m.confidence, reason: m.reason });
    }

    return new Response(JSON.stringify({ matches: persisted }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("lf-process-found", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

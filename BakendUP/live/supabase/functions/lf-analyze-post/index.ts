// Analyze a Lost & Found post: generate ai_tags, ai_summary, ai_attributes, and detect duplicates.
// Input: { itemId } OR { title, description, category, item_type, location } (preview mode)
// Updates the row in DB when itemId is provided. Returns { tags, summary, attributes, duplicates }.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const payload = await req.json();
    const { itemId } = payload;
    let { title, description, category, item_type, location } = payload;

    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    if (itemId) {
      const { data, error } = await sb.from("lost_found_items").select("*").eq("id", itemId).single();
      if (error) throw error;
      title = data.title; description = data.description; category = data.category;
      item_type = data.item_type; location = data.location;
    }
    if (!title) {
      return new Response(JSON.stringify({ error: "title required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Fetch recent same-type items (last 30 days) to detect duplicates
    const since = new Date(Date.now() - 30*24*60*60*1000).toISOString();
    const { data: recent } = await sb
      .from("lost_found_items")
      .select("id, title, description, category, location, created_at")
      .eq("status", "active")
      .eq("item_type", item_type)
      .gte("created_at", since)
      .neq("id", itemId || "00000000-0000-0000-0000-000000000000")
      .order("created_at", { ascending: false })
      .limit(80);

    const candidates = (recent || []).map((r, i) => `[${i}] "${r.title}" | ${r.category} | ${r.location || "?"} | ${(r.description || "").slice(0,120)}`).join("\n");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    const body = {
      model: "google/gemini-2.5-flash-lite",
      messages: [
        { role: "system", content: "You normalise and tag university Lost & Found posts. Be terse, factual, and consistent." },
        { role: "user", content:
`POST:
type: ${item_type}
title: ${title}
category: ${category}
location: ${location || "unknown"}
description: ${description || "(none)"}

RECENT ${item_type?.toUpperCase()} POSTS (same type, last 30 days):
${candidates || "(none)"}

Tasks:
1) Produce 3-7 lowercase, hyphenless searchable tags (e.g. "iphone", "blue", "leather").
2) A 1-sentence clean rewrite/summary (clear, English, max 25 words).
3) Extract attributes: color, brand, condition, distinguishing_marks (use "" if unknown).
4) Identify likely DUPLICATES from the recent list (same physical item, possibly different witness). Return their indices with confidence.` }
      ],
      tools: [{
        type: "function",
        function: {
          name: "return_analysis",
          parameters: {
            type: "object",
            properties: {
              tags: { type: "array", items: { type: "string" } },
              summary: { type: "string" },
              attributes: {
                type: "object",
                properties: { color:{type:"string"}, brand:{type:"string"}, condition:{type:"string"}, distinguishing_marks:{type:"string"} },
                required: ["color","brand","condition","distinguishing_marks"],
                additionalProperties: false,
              },
              duplicates: {
                type: "array",
                items: {
                  type: "object",
                  properties: { index: { type: "number" }, confidence: { type: "string", enum: ["high","medium","low"] }, reason: { type: "string" } },
                  required: ["index","confidence","reason"],
                  additionalProperties: false,
                },
              },
            },
            required: ["tags","summary","attributes","duplicates"],
            additionalProperties: false,
          },
        },
      }],
      tool_choice: { type: "function", function: { name: "return_analysis" } },
    };

    const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!r.ok) {
      const t = await r.text();
      console.error("analyze error", r.status, t);
      const status = r.status === 429 ? 429 : r.status === 402 ? 402 : 500;
      return new Response(JSON.stringify({ error: "AI failed" }), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const data = await r.json();
    const args = data.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    const parsed = args ? JSON.parse(args) : { tags: [], summary: "", attributes: {}, duplicates: [] };

    const dupes = (parsed.duplicates || [])
      .filter((d: any) => d.index >= 0 && d.index < (recent?.length || 0))
      .map((d: any) => ({ item: recent![d.index], confidence: d.confidence, reason: d.reason }));

    if (itemId) {
      await sb.from("lost_found_items")
        .update({ ai_tags: parsed.tags, ai_summary: parsed.summary, ai_attributes: parsed.attributes })
        .eq("id", itemId);
    }

    return new Response(JSON.stringify({ ...parsed, duplicates: dupes }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("lf-analyze-post", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

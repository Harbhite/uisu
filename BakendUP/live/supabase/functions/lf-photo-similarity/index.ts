// Photo-to-photo similarity search using Gemini vision
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { imageUrl, itemType } = await req.json();
    if (!imageUrl) return new Response(JSON.stringify({ error: "imageUrl required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const oppositeType = itemType === "lost" ? "found" : "lost";
    const { data: items } = await sb
      .from("lost_found_items")
      .select("id, title, description, category, location, photos")
      .eq("status", "active")
      .eq("item_type", oppositeType)
      .not("photos", "is", null)
      .order("created_at", { ascending: false })
      .limit(30);

    const candidates = (items || []).filter((i: any) => Array.isArray(i.photos) && i.photos.length > 0).slice(0, 12);
    if (candidates.length === 0) return new Response(JSON.stringify({ matches: [] }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    const content: any[] = [
      { type: "text", text: `You will see a QUERY image first, then ${candidates.length} CANDIDATE images numbered 0-${candidates.length - 1}. Return only candidates that visually look like the same physical item or extremely similar (same color, shape, brand, identifying marks). Ignore loose category matches.` },
      { type: "text", text: "QUERY image:" },
      { type: "image_url", image_url: { url: imageUrl } },
    ];
    candidates.forEach((c: any, i: number) => {
      content.push({ type: "text", text: `Candidate [${i}] — ${c.title} (${c.category}${c.location ? `, ${c.location}` : ""})` });
      content.push({ type: "image_url", image_url: { url: c.photos[0] } });
    });

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "user", content }],
        tools: [{
          type: "function",
          function: {
            name: "return_visual_matches",
            parameters: {
              type: "object",
              properties: {
                matches: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      index: { type: "number" },
                      confidence: { type: "string", enum: ["high", "medium", "low"] },
                      reason: { type: "string" },
                    },
                    required: ["index", "confidence", "reason"],
                  },
                },
              },
              required: ["matches"],
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "return_visual_matches" } },
      }),
    });
    if (!res.ok) {
      const t = await res.text(); console.error("vision sim err", res.status, t);
      return new Response(JSON.stringify({ error: "AI failed", matches: [] }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const data = await res.json();
    const args = data.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    const parsed = args ? JSON.parse(args) : { matches: [] };
    const matches = (parsed.matches || [])
      .filter((m: any) => m.index >= 0 && m.index < candidates.length)
      .slice(0, 5)
      .map((m: any) => ({ item: candidates[m.index], confidence: m.confidence, reason: m.reason }));

    return new Response(JSON.stringify({ matches }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("lf-photo-similarity", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "err", matches: [] }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});

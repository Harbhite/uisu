// AI-generated daily digest of L&F items in last 24h
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: items } = await sb
      .from("lost_found_items")
      .select("title, category, location, item_type, created_at")
      .eq("status", "active")
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(80);

    if (!items || items.length === 0) {
      return new Response(JSON.stringify({ digest: "No new lost or found items in the last 24 hours.", count: 0 }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    const list = items.map((i: any) => `- [${i.item_type}] ${i.title} (${i.category}${i.location ? `, ${i.location}` : ""})`).join("\n");
    const prompt = `Write a 2–3 sentence morning digest of these lost & found posts from the last 24 hours on University of Ibadan campus. Group by category/count, mention notable locations. Friendly, factual tone, no emoji.\n\n${list}`;

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
    const digest = data.choices?.[0]?.message?.content?.trim() || "";
    return new Response(JSON.stringify({ digest, count: items.length }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "err" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});

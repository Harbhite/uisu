// Location heatmap reasoning — suggests likely route between lost/found locations
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { lostLocation, foundLocation, lostTime, foundTime, itemTitle } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    const prompt = `Item: "${itemTitle || "unknown"}"
Last seen: ${lostLocation || "unknown"} ${lostTime ? `at ${lostTime}` : ""}
Found at: ${foundLocation || "unknown"} ${foundTime ? `at ${foundTime}` : ""}

You are an expert on the University of Ibadan campus. Given the lost location and found location, suggest the most likely route the item travelled (mention plausible buildings/routes between them) and the most probable time window. Keep it under 60 words, plain prose, second person ("Likely dropped between...").`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: "You give concise, helpful route reasoning for lost items on the University of Ibadan campus." },
          { role: "user", content: prompt },
        ],
      }),
    });
    if (!res.ok) {
      return new Response(JSON.stringify({ error: "AI failed" }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const data = await res.json();
    const reasoning = data.choices?.[0]?.message?.content?.trim() || "";
    return new Response(JSON.stringify({ reasoning }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "err" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});

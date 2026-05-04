// Voice intake: structure a transcribed sentence into L&F form fields
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CATEGORIES = ["Electronics", "Books", "Clothing", "ID/Cards", "Keys", "Bags", "Accessories", "Other"];

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { transcript } = await req.json();
    if (!transcript?.trim()) return new Response(JSON.stringify({ error: "transcript required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: "You extract structured lost/found item data from a spoken sentence on a University of Ibadan campus board." },
          { role: "user", content: `Transcript: "${transcript}"\n\nExtract structured fields.` },
        ],
        tools: [{
          type: "function",
          function: {
            name: "structure_post",
            parameters: {
              type: "object",
              properties: {
                item_type: { type: "string", enum: ["lost", "found"] },
                title: { type: "string" },
                description: { type: "string" },
                category: { type: "string", enum: CATEGORIES },
                location: { type: "string" },
              },
              required: ["item_type", "title", "description", "category", "location"],
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "structure_post" } },
      }),
    });
    if (!res.ok) return new Response(JSON.stringify({ error: "AI failed" }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    const data = await res.json();
    const args = data.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    const parsed = args ? JSON.parse(args) : null;
    return new Response(JSON.stringify({ fields: parsed }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "err" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});

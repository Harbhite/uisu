// Lost & Found: Extract attributes from an item photo (Gemini vision).
// Input: { imageUrl: string } OR { imageBase64: string, mimeType?: string }
// Output: { title, description, category, attributes: { color, brand, condition, distinguishing_marks }, tags: string[] }
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const CATEGORIES = ['Electronics','Books','Clothing','ID/Cards','Keys','Bags','Accessories','Other'];

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { imageUrl, imageBase64, mimeType } = await req.json();
    if (!imageUrl && !imageBase64) {
      return new Response(JSON.stringify({ error: "imageUrl or imageBase64 required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    const imageContent = imageUrl
      ? { type: "image_url", image_url: { url: imageUrl } }
      : { type: "image_url", image_url: { url: `data:${mimeType || 'image/jpeg'};base64,${imageBase64}` } };

    const body = {
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: "You analyze photos of items reported as lost or found on a university Lost & Found board. Return concise, accurate, factual descriptions." },
        { role: "user", content: [
          { type: "text", text: `Analyze this item. Suggest a short title (max 8 words), a 1-2 sentence description, the best category from: ${CATEGORIES.join(", ")}, and visual attributes (color, brand if visible, condition, distinguishing marks). Also produce 3-6 lowercase searchable tags.` },
          imageContent,
        ]},
      ],
      tools: [{
        type: "function",
        function: {
          name: "return_item_analysis",
          description: "Structured analysis of a lost/found item from its photo",
          parameters: {
            type: "object",
            properties: {
              title: { type: "string" },
              description: { type: "string" },
              category: { type: "string", enum: CATEGORIES },
              attributes: {
                type: "object",
                properties: {
                  color: { type: "string" },
                  brand: { type: "string" },
                  condition: { type: "string" },
                  distinguishing_marks: { type: "string" },
                },
                required: ["color","brand","condition","distinguishing_marks"],
                additionalProperties: false,
              },
              tags: { type: "array", items: { type: "string" } },
            },
            required: ["title","description","category","attributes","tags"],
            additionalProperties: false,
          },
        },
      }],
      tool_choice: { type: "function", function: { name: "return_item_analysis" } },
    };

    const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!r.ok) {
      const t = await r.text();
      console.error("vision error", r.status, t);
      const status = r.status === 429 ? 429 : r.status === 402 ? 402 : 500;
      return new Response(JSON.stringify({ error: status === 429 ? "AI busy, try again" : status === 402 ? "AI credits exhausted" : "AI failed" }), {
        status, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const data = await r.json();
    const args = data.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    if (!args) throw new Error("No tool result");
    return new Response(args, { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("lf-vision-extract", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

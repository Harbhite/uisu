import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { description } = await req.json();
    if (!description?.trim()) {
      return new Response(JSON.stringify({ error: "Description is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch all active found items
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const sb = createClient(supabaseUrl, supabaseKey);

    const { data: foundItems, error: dbError } = await sb
      .from("lost_found_items")
      .select("id, title, description, category, location, photos, contact_info, created_at")
      .eq("status", "active")
      .eq("item_type", "found")
      .order("created_at", { ascending: false })
      .limit(200);

    if (dbError) throw dbError;
    if (!foundItems?.length) {
      return new Response(JSON.stringify({ matches: [], message: "No found items currently posted." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const itemsSummary = foundItems.map((item, i) => 
      `[${i}] Title: "${item.title}" | Category: ${item.category} | Location: ${item.location || "N/A"} | Description: ${item.description || "N/A"}`
    ).join("\n");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const QWEN_API_KEY = Deno.env.get("QWEN_API_KEY");

    const systemPrompt = `You are an AI that matches lost item descriptions to found items. Given a user's description of their lost item and a list of found items, identify the most relevant matches.

Rules:
- Return indices of matching items ranked by relevance (best match first)
- Consider: item type/category, color, brand, size, location proximity, description similarity
- Only return genuinely plausible matches — don't force matches
- Return at most 10 matches
- For each match, provide a brief reason why it might match`;

    const userPrompt = `My lost item description: "${description}"

Found items on the board:
${itemsSummary}

Identify which found items could be my lost item.`;

    const requestBody = {
      model: "google/gemini-2.5-flash-lite",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      tools: [{
        type: "function",
        function: {
          name: "return_matches",
          description: "Return matched found items",
          parameters: {
            type: "object",
            properties: {
              matches: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    index: { type: "number", description: "Index of the found item in the list" },
                    confidence: { type: "string", enum: ["high", "medium", "low"] },
                    reason: { type: "string", description: "Brief reason for the match" },
                  },
                  required: ["index", "confidence", "reason"],
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

    let response: Response;
    let provider = "lovable";

    if (LOVABLE_API_KEY) {
      response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok && (response.status === 429 || response.status === 402) && QWEN_API_KEY) {
        await response.text();
        provider = "qwen";
        response = await fetch("https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions", {
          method: "POST",
          headers: { Authorization: `Bearer ${QWEN_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({ ...requestBody, model: "qwen-plus" }),
        });
      }
    } else if (QWEN_API_KEY) {
      provider = "qwen";
      response = await fetch("https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${QWEN_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ ...requestBody, model: "qwen-plus" }),
      });
    } else {
      throw new Error("No AI API key available");
    }

    if (!response.ok) {
      const t = await response.text();
      console.error(`${provider} error:`, response.status, t);
      const status = response.status === 429 ? 429 : response.status === 402 ? 402 : 500;
      return new Response(JSON.stringify({ error: "AI processing failed" }), {
        status, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    let matchResult: { matches: { index: number; confidence: string; reason: string }[] };
    if (toolCall?.function?.arguments) {
      matchResult = JSON.parse(toolCall.function.arguments);
    } else {
      const content = data.choices?.[0]?.message?.content || "";
      const jsonMatch = content.match(/\{[\s\S]*"matches"[\s\S]*\}/);
      if (jsonMatch) {
        matchResult = JSON.parse(jsonMatch[0]);
      } else {
        matchResult = { matches: [] };
      }
    }

    // Map indices back to actual items
    const matchedItems = matchResult.matches
      .filter(m => m.index >= 0 && m.index < foundItems.length)
      .map(m => ({
        item: foundItems[m.index],
        confidence: m.confidence,
        reason: m.reason,
      }));

    return new Response(JSON.stringify({ matches: matchedItems }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("lost-found-match error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

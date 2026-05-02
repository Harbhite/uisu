import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const LOVABLE_GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";
const QWEN_GATEWAY = "https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions";

async function callWithFallback(body: unknown) {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  const QWEN_API_KEY = Deno.env.get("QWEN_API_KEY");

  if (LOVABLE_API_KEY) {
    const response = await fetch(LOVABLE_GATEWAY, {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (response.ok) return { response, provider: "lovable" };
    if (response.status !== 429 && response.status !== 402) return { response, provider: "lovable" };
    await response.text(); // consume error
  }

  if (QWEN_API_KEY) {
    const qwenBody = { ...(body as Record<string, unknown>), model: "qwen-plus" };
    const response = await fetch(QWEN_GATEWAY, {
      method: "POST",
      headers: { Authorization: `Bearer ${QWEN_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify(qwenBody),
    });
    return { response, provider: "qwen" };
  }

  throw new Error("No AI API keys available");
}

async function extractToolResult(response: Response) {
  const data = await response.json();
  const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
  if (toolCall?.function?.arguments) {
    return JSON.parse(toolCall.function.arguments);
  }
  const content = data.choices?.[0]?.message?.content || "{}";
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  return jsonMatch ? JSON.parse(jsonMatch[0]) : {};
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const action = body.action || "match-lost-to-found";
    const payload = body.payload || body;

    if (action === "match-lost-to-found") {
      const { description } = payload;
      if (!description?.trim()) throw new Error("Description is required");

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
        return new Response(JSON.stringify({ matches: [], message: "No found items currently posted." }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      const itemsSummary = foundItems.map((item, i) =>
        `[${i}] Title: "${item.title}" | Category: ${item.category} | Location: ${item.location || "N/A"} | Description: ${item.description || "N/A"}`
      ).join("\n");

      const systemPrompt = `You are an AI that matches lost item descriptions to found items. Given a user's description of their lost item and a list of found items, identify the most relevant matches.
Rules:
- Return indices of matching items ranked by relevance (best match first)
- Consider: item type/category, color, brand, size, location proximity, description similarity
- Only return genuinely plausible matches — don't force matches
- Return at most 10 matches
- For each match, provide a brief reason why it might match`;

      const requestBody = {
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `My lost item description: "${description}"\n\nFound items on the board:\n${itemsSummary}\n\nIdentify which found items could be my lost item.` }
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
                      index: { type: "number" },
                      confidence: { type: "string", enum: ["high", "medium", "low"] },
                      reason: { type: "string" }
                    },
                    required: ["index", "confidence", "reason"],
                  }
                }
              },
              required: ["matches"]
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "return_matches" } }
      };

      const { response } = await callWithFallback(requestBody);
      const matchResult = await extractToolResult(response);
      const matchedItems = (matchResult.matches || [])
        .filter((m: { index: number }) => m.index >= 0 && m.index < foundItems.length)
        .map((m: { index: number, confidence: string, reason: string }) => ({ item: foundItems[m.index], confidence: m.confidence, reason: m.reason }));

      return new Response(JSON.stringify({ matches: matchedItems }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "match-found-to-lost") {
      const { description, category } = payload;
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const sb = createClient(supabaseUrl, supabaseKey);

      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const { data: lostItems, error: dbError } = await sb
        .from("lost_found_items")
        .select("id, title, description, category, location, photos, contact_info, created_at, user_id")
        .eq("status", "active")
        .eq("item_type", "lost")
        .gte("created_at", thirtyDaysAgo)
        .order("created_at", { ascending: false })
        .limit(100);

      if (dbError) throw dbError;
      if (!lostItems?.length) return new Response(JSON.stringify({ matches: [] }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

      const itemsSummary = lostItems.map((item, i) =>
        `[${i}] Title: "${item.title}" | Category: ${item.category} | Location: ${item.location || "N/A"} | Description: ${item.description || "N/A"}`
      ).join("\n");

      const systemPrompt = "You are an AI that scans newly found items against reported lost items. Return top 3 likely matches.";
      const requestBody = {
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `I found this item: Category: ${category}, Description: "${description}"\n\nRecent lost items:\n${itemsSummary}` }
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
                      confidence: { type: "string", enum: ["high", "medium", "low"] },
                      reason: { type: "string" }
                    },
                    required: ["index", "confidence", "reason"]
                  }
                }
              },
              required: ["matches"]
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "return_matches" } }
      };

      const { response } = await callWithFallback(requestBody);
      const matchResult = await extractToolResult(response);
      const matchedItems = (matchResult.matches || [])
        .filter((m: { index: number }) => m.index >= 0 && m.index < lostItems.length)
        .slice(0, 3)
        .map((m: { index: number, confidence: string, reason: string }) => ({ item: lostItems[m.index], confidence: m.confidence, reason: m.reason }));

      return new Response(JSON.stringify({ matches: matchedItems }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "analyze-image") {
      const { imageData } = payload;
      const requestBody = {
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: "You analyze photos of lost & found items. Extract attributes to auto-fill a form." },
          { role: "user", content: [
            { type: "text", text: "Provide a title, a detailed description, and choose the most appropriate category from: Electronics, Books, Clothing, ID/Cards, Keys, Bags, Accessories, Other." },
            { type: "image_url", image_url: { url: imageData } }
          ]}
        ],
        tools: [{
          type: "function",
          function: {
            name: "return_analysis",
            parameters: {
              type: "object",
              properties: {
                title: { type: "string" },
                description: { type: "string" },
                category: { type: "string", enum: ["Electronics", "Books", "Clothing", "ID/Cards", "Keys", "Bags", "Accessories", "Other"] }
              },
              required: ["title", "description", "category"]
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "return_analysis" } }
      };

      const { response } = await callWithFallback(requestBody);
      const result = await extractToolResult(response);
      return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "enhance-text") {
      const { text } = payload;
      const requestBody = {
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: "You rewrite terse or mixed-language lost & found posts into clear, searchable English. Output a clean title, description, and category." },
          { role: "user", content: `Original text: "${text}"\n\nEnhance this.` }
        ],
        tools: [{
          type: "function",
          function: {
            name: "return_enhanced",
            parameters: {
              type: "object",
              properties: {
                title: { type: "string" },
                description: { type: "string" },
                category: { type: "string", enum: ["Electronics", "Books", "Clothing", "ID/Cards", "Keys", "Bags", "Accessories", "Other"] }
              },
              required: ["title", "description", "category"]
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "return_enhanced" } }
      };

      const { response } = await callWithFallback(requestBody);
      const result = await extractToolResult(response);
      return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "generate-questions") {
      const { description } = payload;
      const requestBody = {
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: "Generate 2 specific owner-verification questions based on a found item's description. Ask for details only the true owner would know, based on what might be hidden or not fully specified." },
          { role: "user", content: `Item description: "${description}"\nGenerate questions.` }
        ],
        tools: [{
          type: "function",
          function: {
            name: "return_questions",
            parameters: {
              type: "object",
              properties: { questions: { type: "array", items: { type: "string" } } },
              required: ["questions"]
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "return_questions" } }
      };

      const { response } = await callWithFallback(requestBody);
      const result = await extractToolResult(response);
      return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "verify-claim") {
      const { originalDescription, claimDescription } = payload;
      const requestBody = {
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: "You review a claim description against the original found-item description. Check for vagueness or inconsistency, and determine if it's likely a legitimate claim or suspicious." },
          { role: "user", content: `Original Item: "${originalDescription}"\nClaimant's Description: "${claimDescription}"` }
        ],
        tools: [{
          type: "function",
          function: {
            name: "return_verification",
            parameters: {
              type: "object",
              properties: {
                isSuspicious: { type: "boolean" },
                reasoning: { type: "string" },
                confidenceScore: { type: "number" }
              },
              required: ["isSuspicious", "reasoning", "confidenceScore"]
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "return_verification" } }
      };

      const { response } = await callWithFallback(requestBody);
      const result = await extractToolResult(response);
      return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "daily-digest") {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const sb = createClient(supabaseUrl, supabaseKey);

      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { data: items, error: dbError } = await sb
        .from("lost_found_items")
        .select("title, item_type, category, location")
        .gte("created_at", yesterday);

      if (dbError) throw dbError;
      if (!items?.length) return new Response(JSON.stringify({ summary: "No items reported in the last 24 hours." }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

      const itemsList = items.map(i => `- [${i.item_type.toUpperCase()}] ${i.title} (${i.category}) near ${i.location || 'unknown'}`).join("\n");
      const requestBody = {
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: "You generate a concise morning bulletin summarising lost/found activity from the last 24 hours." },
          { role: "user", content: `Items from past 24 hours:\n${itemsList}\n\nGenerate a brief, engaging summary (e.g., "3 phones, 2 ID cards, and 1 set of keys reported...").` }
        ]
      };

      const { response } = await callWithFallback(requestBody);
      const data = await response.json();
      const summary = data.choices?.[0]?.message?.content || "Daily digest generated.";
      return new Response(JSON.stringify({ summary }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "suggest-route") {
      const { location, description } = payload;
      const requestBody = {
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: "You cross-reference reported locations to suggest likely routes or drop zones for an item." },
          { role: "user", content: `Item: ${description}\nLocation lost: ${location}\nSuggest a likely route it might have been taken or dropped.` }
        ]
      };
      const { response } = await callWithFallback(requestBody);
      const data = await response.json();
      const suggestion = data.choices?.[0]?.message?.content || "Route analysis complete.";
      return new Response(JSON.stringify({ suggestion }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("Error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

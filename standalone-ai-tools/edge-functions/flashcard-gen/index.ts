import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const LOVABLE_GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";
const QWEN_GATEWAY = "https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions";
const QWEN_MODEL = "qwen-plus";

async function callWithFallback(body: Record<string, unknown>) {
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
    console.log(`Lovable AI returned ${response.status}, falling back to Qwen...`);
    await response.text();
  }

  if (!QWEN_API_KEY) throw new Error("Both Lovable AI and Qwen API keys are unavailable");

  const qwenBody = { ...body, model: QWEN_MODEL };
  const response = await fetch(QWEN_GATEWAY, {
    method: "POST",
    headers: { Authorization: `Bearer ${QWEN_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify(qwenBody),
  });

  return { response, provider: "qwen" };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { topic, material, count } = await req.json();
    const cardCount = count || 20;

    const systemPrompt = `You are an expert flashcard generator for university students across ALL fields of knowledge — Law, Medicine, Engineering, Arts, Sciences, Social Sciences, etc.

Create exactly ${cardCount} high-quality flashcards from the provided topic/material.

Rules:
- Mix question types: definitions, applications, analysis, comparisons, and scenario-based
- Each flashcard must have a clear FRONT (question) and BACK (answer)
- Assign difficulty: Easy, Medium, or Hard
- Cover the most exam-worthy and important content
- Be concise but thorough on the back side
- Use precise academic language appropriate to the field`;

    const userContent = topic
      ? `Topic/Concept: ${topic}${material ? `\n\nAdditional Material:\n${material}` : ""}`
      : material || "No material provided";

    const requestBody = {
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "generate_flashcards",
            description: "Return flashcards as structured data",
            parameters: {
              type: "object",
              properties: {
                flashcards: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      front: { type: "string", description: "The question or prompt" },
                      back: { type: "string", description: "The answer or explanation" },
                      difficulty: { type: "string", enum: ["Easy", "Medium", "Hard"] },
                    },
                    required: ["front", "back", "difficulty"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["flashcards"],
              additionalProperties: false,
            },
          },
        },
      ],
      tool_choice: { type: "function", function: { name: "generate_flashcards" } },
    };

    const { response, provider } = await callWithFallback(requestBody);

    if (!response.ok) {
      const t = await response.text();
      console.error(`${provider} AI error:`, response.status, t);
      return new Response(JSON.stringify({ error: "AI processing failed" }), {
        status: response.status === 429 ? 429 : response.status === 402 ? 402 : 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    let flashcards;
    if (toolCall?.function?.arguments) {
      const parsed = JSON.parse(toolCall.function.arguments);
      flashcards = parsed;
    } else {
      // Fallback: parse content directly (Qwen may return content instead of tool_calls)
      const content = data.choices?.[0]?.message?.content || "";
      const jsonMatch = content.match(/\{[\s\S]*"flashcards"[\s\S]*\}/);
      if (jsonMatch) {
        flashcards = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No flashcards generated");
      }
    }

    return new Response(JSON.stringify(flashcards), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("flashcard-gen error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

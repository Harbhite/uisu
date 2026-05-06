import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const LOVABLE_GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";
const GEMINI_GATEWAY = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";
const QWEN_GATEWAY = "https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions";
const GEMINI_MODEL = "gemini-2.5-flash";
const QWEN_MODEL = "qwen-plus";
const MAX_INPUT_CHARS = 800_000;
const TRUNCATION_NOTICE = "\n\n[... Remaining material omitted to fit AI processing limits.]";

// Tries: Lovable AI -> Gemini direct -> Qwen
async function callWithFallback(body: Record<string, unknown>) {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
  const QWEN_API_KEY = Deno.env.get("QWEN_API_KEY");

  if (LOVABLE_API_KEY) {
    const response = await fetch(LOVABLE_GATEWAY, {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (response.ok) return { response, provider: "lovable" };
    if (response.status !== 429 && response.status !== 402) return { response, provider: "lovable" };
    console.log(`Lovable AI returned ${response.status}, falling back to Gemini direct...`);
    await response.text();
  }

  if (GEMINI_API_KEY) {
    const geminiBody = { ...body, model: GEMINI_MODEL };
    const response = await fetch(GEMINI_GATEWAY, {
      method: "POST",
      headers: { Authorization: `Bearer ${GEMINI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify(geminiBody),
    });
    if (response.ok) return { response, provider: "gemini" };
    console.log(`Gemini direct returned ${response.status}, falling back to Qwen...`);
    await response.text();
  }

  if (!QWEN_API_KEY) throw new Error("All AI providers (Lovable, Gemini, Qwen) are unavailable");

  const qwenBody = { ...body, model: QWEN_MODEL };
  const response = await fetch(QWEN_GATEWAY, {
    method: "POST",
    headers: { Authorization: `Bearer ${QWEN_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify(qwenBody),
  });

  return { response, provider: "qwen" };
}

function truncateContent(content: string) {
  if (content.length <= MAX_INPUT_CHARS) {
    return { content, truncated: false };
  }

  return {
    content: `${content.slice(0, MAX_INPUT_CHARS)}${TRUNCATION_NOTICE}`,
    truncated: true,
  };
}

function buildErrorMessage(status: number, detail = "") {
  const normalized = detail.toLowerCase();

  if (status === 429 || normalized.includes("rate limit")) {
    return "Rate limit reached. Please wait a moment and try again.";
  }

  if (status === 402 || normalized.includes("payment required") || normalized.includes("credits")) {
    return "AI credits exhausted. Please try again later.";
  }

  if (normalized.includes("maximum context length") || normalized.includes("context length")) {
    return "This material is too large for one AI pass. Please split it into smaller sections or upload the most relevant pages.";
  }

  if (normalized.includes("no material")) {
    return "No study material provided.";
  }

  return "AI processing failed. Please try again.";
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { topic, material, count, depth } = await req.json();
    const cardCount = Math.min(Math.max(count || 20, 5), 100);

    const userContent = topic
      ? `Topic/Concept: ${topic}${material ? `\n\nAdditional Material:\n${material}` : ""}`
      : material || "";

    if (!userContent.trim()) {
      return new Response(JSON.stringify({ error: "No study material provided" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { content: boundedUserContent, truncated } = truncateContent(userContent);

    const depthInstruction: Record<string, string> = {
      beginner: "\nTARGET AUDIENCE: Beginner-level student. Use simple language. Keep questions and answers straightforward with clear explanations.",
      intermediate: "\nTARGET AUDIENCE: Intermediate-level student. Use standard academic language. Balance depth with clarity.",
      advanced: "\nTARGET AUDIENCE: Advanced student or researcher. Use precise technical language. Include nuanced distinctions and edge cases.",
    };

    const depthLine = depth && depthInstruction[depth] ? depthInstruction[depth] : "";

    const systemPrompt = `You are an expert flashcard generator for university students across ALL fields of knowledge — Law, Medicine, Engineering, Arts, Sciences, Social Sciences, etc.

Create exactly ${cardCount} high-quality flashcards from the provided topic/material.

Rules:
- Mix question types: definitions, applications, analysis, comparisons, and scenario-based
- Each flashcard must have a clear FRONT (question) and BACK (answer)
- Assign difficulty: Easy, Medium, or Hard
- Cover the most exam-worthy and important content
- Be concise but thorough on the back side
- Use precise academic language appropriate to the field${depthLine}`;

    const requestBody = {
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: boundedUserContent },
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
      return new Response(JSON.stringify({ error: buildErrorMessage(response.status, t) }), {
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
      const content = data.choices?.[0]?.message?.content || "";
      const jsonMatch = content.match(/\{[\s\S]*"flashcards"[\s\S]*\}/);
      if (jsonMatch) {
        flashcards = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No flashcards generated");
      }
    }

    return new Response(JSON.stringify({ ...flashcards, truncated }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("flashcard-gen error:", e);
    return new Response(JSON.stringify({ error: buildErrorMessage(500, e instanceof Error ? e.message : "Unknown error") }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
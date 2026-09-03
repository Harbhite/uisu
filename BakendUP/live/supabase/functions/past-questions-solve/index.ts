import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const LOVABLE_GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";
const QWEN_GATEWAY = "https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions";
const QWEN_MODEL = "qwen-plus";
const MAX_INPUT_CHARS = 800_000;

function truncate(text: string): string {
  if (!text || text.length <= MAX_INPUT_CHARS) return text || "";
  return text.slice(0, MAX_INPUT_CHARS) + "\n\n[... Content truncated due to length.]";
}

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
    const { courseCode, courseTitle, questionText: rawQuestion } = await req.json();

    const questionText = truncate(rawQuestion);

    if (!questionText || questionText.length < 10) {
      return new Response(JSON.stringify({ error: "Question text is required (min 10 chars)" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemPrompt = `You are an expert academic tutor at a Nigerian university. You provide detailed, well-structured solutions to exam questions.

Guidelines:
- Provide clear, step-by-step solutions
- Use proper academic language
- Include relevant formulas, theories, or citations where applicable
- If the question has multiple parts, address each part separately
- If it's a multiple choice question, explain why each option is correct/incorrect
- Keep explanations thorough but concise
- Format with clear headings and bullet points where helpful`;

    const userPrompt = `Course: ${courseCode}${courseTitle ? ` — ${courseTitle}` : ''}

Question:
${questionText}

Please provide a detailed solution.`;

    const requestBody = {
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    };

    const { response, provider } = await callWithFallback(requestBody);

    if (!response.ok) {
      const errText = await response.text();
      console.error(`${provider} AI error:`, response.status, errText);

      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please try again later." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const solution = data.choices?.[0]?.message?.content || "Unable to generate solution.";

    return new Response(JSON.stringify({ solution }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("past-questions-solve error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

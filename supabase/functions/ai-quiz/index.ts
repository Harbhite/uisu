import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const { material, rigidity, fileContent, fileName, count } = await req.json();
    const questionCount = Math.min(Math.max(count || 25, 5), 40);

    if (!material && !fileContent) {
      return new Response(JSON.stringify({ error: "No study material provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const rigidityPrompt: Record<string, string> = {
      Standard: "Focus on foundational concepts and direct facts. Questions should test basic understanding and recall.",
      Strict: "Focus on application of concepts, critical thinking, and nuanced relationships between ideas.",
      Rigid: "Focus on advanced synthesis, edge cases, historical context, and highly complex logical deductions. Questions should challenge even top students.",
    };

    const systemPrompt = `You are an elite professor at a prestigious university. Based on the provided study materials, generate an official examination batch of exactly ${questionCount} multiple-choice questions.

LEVEL OF RIGIDITY: ${rigidity || "Strict"}
INSTRUCTION: ${rigidityPrompt[rigidity || "Strict"]}

You MUST return a valid JSON array of exactly ${questionCount} objects. Each object MUST have:
- "question": string (the question text)
- "options": array of exactly 4 strings
- "correctIndex": number (0-3, index of correct option)
- "explanation": string (detailed explanation of the correct answer)

Ensure intellectual depth, variety across the material, and strict adherence to the provided content. Do NOT include any text outside the JSON array.`;

    let userContent = "";
    if (material) userContent += `STUDY MATERIAL:\n${material}\n\n`;
    if (fileContent) userContent += `UPLOADED DOCUMENT CONTENT (${fileName || "document"}):\n${fileContent}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userContent },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_quiz",
              description: `Generate ${questionCount} multiple-choice quiz questions from study material`,
              parameters: {
                type: "object",
                properties: {
                  questions: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        question: { type: "string" },
                        options: { type: "array", items: { type: "string" } },
                        correctIndex: { type: "integer" },
                        explanation: { type: "string" },
                      },
                      required: ["question", "options", "correctIndex", "explanation"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["questions"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "generate_quiz" } },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      return new Response(JSON.stringify({ error: "AI processing failed. Please try again." }), {
        status: response.status === 429 ? 429 : response.status === 402 ? 402 : 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();

    // Extract from tool call
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    let questions;

    if (toolCall?.function?.arguments) {
      const parsed = JSON.parse(toolCall.function.arguments);
      questions = parsed.questions;
    } else {
      // Fallback: try parsing content directly
      const content = data.choices?.[0]?.message?.content || "";
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        questions = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Could not extract quiz questions from AI response");
      }
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error("No valid questions generated");
    }

    return new Response(JSON.stringify({ questions: questions.slice(0, questionCount) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-quiz error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const LOVABLE_GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";
const QWEN_GATEWAY = "https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions";
const QWEN_MODEL = "qwen-plus";
const MAX_INPUT_CHARS = 800_000;
const TRUNCATION_NOTICE = "\n\n[... Remaining material omitted to fit AI processing limits.]";

async function callWithFallback(body: Record<string, unknown>, isStream: boolean) {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  const QWEN_API_KEY = Deno.env.get("QWEN_API_KEY");

  if (LOVABLE_API_KEY) {
    const response = await fetch(LOVABLE_GATEWAY, {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (response.ok) return { response, provider: "lovable" };

    if (response.status !== 429 && response.status !== 402) {
      return { response, provider: "lovable" };
    }
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

function truncateContent(content: string) {
  if (content.length <= MAX_INPUT_CHARS) {
    return { content, truncated: false };
  }

  return {
    content: `${content.slice(0, MAX_INPUT_CHARS)}${TRUNCATION_NOTICE}`,
    truncated: true,
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { mode, topic, material, generateImage } = await req.json();

    const modePrompts: Record<string, string> = {
      explainer: `You are StudyBuddy Explainer — an elite academic tutor at the University of Ibadan. Break down the concept or material provided into clear, digestible parts using:
- Real-world analogies and metaphors
- Step-by-step logical breakdowns
- Mermaid diagrams for flowcharts, processes, and relationships (use \`\`\`mermaid code blocks with valid Mermaid syntax like "graph TD", "flowchart LR", "sequenceDiagram", "classDiagram", "stateDiagram-v2", "erDiagram", "mindmap", "timeline", etc.)
- Mathematical notation when solving maths/engineering problems (use LaTeX-style notation)
- Tables for comparisons (use markdown tables)
- Clear section headers with markdown

IMPORTANT: When illustrating processes, hierarchies, relationships, or flows, ALWAYS include a Mermaid diagram in a \`\`\`mermaid code block. For example:
\`\`\`mermaid
graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Do Something]
    B -->|No| D[Do Something Else]
\`\`\`

You handle ALL fields: Law, Medicine, Engineering, Arts, Sciences, Social Sciences, etc.
Be thorough, creative, and intellectually rigorous. Use markdown formatting extensively.`,

      planner: `You are StudyBuddy Planner — a strategic academic advisor. Create a detailed 7-day study schedule for the topic/material provided. Include:
- Day-by-day breakdown with specific time blocks
- Key topics to cover each day
- Review sessions and practice problems
- Tips for retention and active recall
- A motivational note for each day
- A Mermaid timeline or gantt chart showing the study plan visually (use \`\`\`mermaid code block)

Format as a clean markdown table or structured plan. Be practical and realistic.`,

      synthesizer: `You are StudyBuddy Synthesizer — an expert summarizer. Create a hierarchical brief of the provided material:
- **Executive Summary** (2-3 sentences)
- **Key Concepts** (bulleted, with brief explanations)
- **Critical Details** (numbered, prioritized)
- **Connections & Relationships** (how concepts link — include a Mermaid mindmap or graph diagram in a \`\`\`mermaid code block showing relationships)
- **Quick-Reference Glossary** (key terms defined)

Be concise but comprehensive. Use markdown formatting and Mermaid diagrams where they add clarity.`,

      examiner: `You are StudyBuddy Examiner — a flashcard generator. Create 15 high-quality flashcards from the material:
- Mix of definition, application, and analysis questions
- Each flashcard should have a FRONT (question) and BACK (answer)
- Include difficulty ratings (Easy/Medium/Hard)
- Cover the most exam-worthy content

Format each as:
### Flashcard [number] — [Difficulty]
**Q:** [question]
**A:** [answer]

---`,

      debater: `You are StudyBuddy Debater — a Socratic debate partner for University of Ibadan students. Given a topic, present a structured academic debate:
- **Proposition** (Arguments FOR) — at least 4 strong points with evidence
- **Opposition** (Arguments AGAINST) — at least 4 strong counterpoints with evidence  
- **Key Rebuttals** — how each side responds to the other
- **Nuances & Gray Areas** — complexities that resist simple answers
- **Your Verdict** — a balanced, scholarly conclusion weighing both sides

Be intellectually rigorous. Use real-world examples, case law, scientific evidence, or historical precedents where applicable. Challenge assumptions. This is for sharpening critical thinking across ALL fields.

Use markdown formatting extensively.`
    };

    const systemPrompt = modePrompts[mode] || modePrompts.explainer;

    if (generateImage) {
      const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
      if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured for image generation");

      const imageResponse = await fetch(LOVABLE_GATEWAY, {
        method: "POST",
        headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-image",
          messages: [
            { role: "user", content: `Create a clear, educational diagram or illustration for the following academic concept. Make it clean, labeled, and suitable for studying: ${topic || material?.substring(0, 500)}` }
          ],
          modalities: ["image", "text"],
        }),
      });

      if (!imageResponse.ok) {
        const errText = await imageResponse.text();
        console.error("Image generation error:", imageResponse.status, errText);
        return new Response(JSON.stringify({ error: "Image generation failed", details: errText }), {
          status: imageResponse.status === 429 ? 429 : imageResponse.status === 402 ? 402 : 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const imageData = await imageResponse.json();
      return new Response(JSON.stringify(imageData), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const rawUserContent = topic
      ? `Topic/Concept: ${topic}${material ? `\n\nAdditional Material:\n${material}` : ""}`
      : material || "No material provided";

    const { content: userContent } = truncateContent(rawUserContent);

    const requestBody = {
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent },
      ],
      stream: true,
    };

    const { response, provider } = await callWithFallback(requestBody, true);

    if (!response.ok) {
      const t = await response.text();
      console.error(`${provider} AI error:`, response.status, t);
      return new Response(JSON.stringify({ error: "AI processing failed. Please try again later." }), {
        status: response.status === 429 ? 429 : response.status === 402 ? 402 : 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream", "X-AI-Provider": provider },
    });
  } catch (e) {
    console.error("study-buddy error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
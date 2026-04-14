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

const depthInstructions: Record<string, string> = {
  beginner: "\n\nTARGET AUDIENCE: Beginner-level student. Use simple, accessible language. Explain every concept from scratch with plenty of real-world analogies and examples. Avoid jargon or define it immediately when used.",
  intermediate: "\n\nTARGET AUDIENCE: Intermediate-level student with foundational knowledge. Use standard academic language. Balance depth with clarity.",
  advanced: "\n\nTARGET AUDIENCE: Advanced student or researcher. Use precise academic/technical language freely. Go deep into nuances, edge cases, exceptions, and cross-disciplinary connections.",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { mode, topic, material: rawMaterial, pointCount, depth, imageData } = await req.json();

    const MAX_CHARS = 800_000;
    const material = rawMaterial && rawMaterial.length > MAX_CHARS
      ? rawMaterial.slice(0, MAX_CHARS) + "\n\n[... Content truncated due to length.]"
      : rawMaterial;

    const depthSuffix = depthInstructions[depth] || depthInstructions.intermediate;

    const imageNote = "\nIMPORTANT: If an image is provided (diagram, handwritten notes, textbook page), analyze it thoroughly and incorporate all visible information into your response.";

    const modePrompts: Record<string, string> = {
      keypoints: `You are an elite academic assistant at the University of Ibadan. Extract and present the KEY POINTS from the provided material/topic. Format your response as:

## Key Points

For each key point:
### Point [number]: [Concise Title]
**Core Idea:** [1-2 sentence explanation]
**Why It Matters:** [Brief significance]
**Example/Application:** [Concrete example if applicable]

---

Extract 8-15 key points depending on material complexity. Prioritize the most exam-worthy and conceptually important points. Use markdown formatting extensively. Be thorough but concise.${imageNote}${depthSuffix}`,

      summary: `You are an elite academic assistant at the University of Ibadan. Create a COMPREHENSIVE SUMMARY BRIEF of the provided material/topic. Structure your response as:

## Summary Brief

### Executive Overview
[2-3 sentence high-level summary]

### Core Concepts
[Numbered list of main concepts with brief explanations]

### Detailed Breakdown
[Section-by-section breakdown of the material, maintaining logical flow]

### Key Relationships
[How the concepts connect to each other]

### Critical Takeaways
[5-7 bullet points of the most important things to remember]

### Exam Focus Areas
[What's most likely to be tested and why]

Use markdown formatting extensively. Be comprehensive yet readable.${imageNote}${depthSuffix}`,

      outline: `You are an elite academic assistant at the University of Ibadan. Create a STRUCTURED STUDY OUTLINE from the provided material/topic. Format as:

## Study Outline

### I. Introduction & Context
   A. [Sub-topic]
      1. [Detail]
      2. [Detail]
   B. [Sub-topic]

### II. [Major Section]
   A. [Sub-topic with key definitions]
   B. [Sub-topic with examples]
   
[Continue with Roman numerals for major sections, letters for sub-topics, numbers for details]

### Key Definitions
| Term | Definition |
|------|-----------|
| ... | ... |

### Quick Review Questions
1. [Self-test question]
2. [Self-test question]
...

Create a thorough, hierarchical outline that serves as a complete study roadmap. Use markdown tables where appropriate.${imageNote}${depthSuffix}`,

      concepts: `You are an elite academic assistant at the University of Ibadan. Create a CONCEPT MAP & GLOSSARY from the provided material/topic. Structure as:

## Concept Map & Glossary

### Central Theme
[1-2 sentences identifying the overarching theme]

### Concept Hierarchy
For each major concept:

#### [Concept Name]
- **Definition:** [Clear, concise definition]
- **Category:** [Classification/type]
- **Related To:** [List connected concepts]
- **Key Properties:** [Important characteristics]
- **Common Misconceptions:** [What students often get wrong]

### Relationships Table
| Concept A | Relationship | Concept B |
|-----------|-------------|-----------|
| ... | causes/enables/requires/contradicts | ... |

### Glossary
| Term | Definition | Example |
|------|-----------|---------|
| ... | ... | ... |

### Memory Aids
[Mnemonics, acronyms, or memory tricks for key terms]

Be comprehensive. Cover all significant terms and their interconnections.${imageNote}${depthSuffix}`,
    };

    // Dynamic quickpoints prompt with user-selected count
    if (mode === 'quickpoints') {
      const count = Math.min(Math.max(Number(pointCount) || 25, 5), 150);
      modePrompts.quickpoints = `You are an elite academic assistant at the University of Ibadan. Generate exactly ${count} KEY POINTS from the provided material/topic. Each key point must be:

- **Brief** (1-2 sentences maximum)
- **Concise** (no fluff, straight to the point)
- **Self-contained** (understandable without additional context)

Format your response as a numbered list:

1. **[Concise Title]:** [Brief 1-2 sentence explanation]
2. **[Concise Title]:** [Brief 1-2 sentence explanation]
...continue to exactly ${count} points.

Prioritize the most exam-worthy and conceptually important points. Cover breadth over depth. Do NOT include sub-points, examples, or elaborations — keep each point atomic and scannable. Use markdown bold for titles only.${imageNote}${depthSuffix}`;
    }

    const systemPrompt = modePrompts[mode] || modePrompts.keypoints;

    // Build user message - support multimodal vision input
    const textContent = topic
      ? `Topic/Concept: ${topic}${material ? `\n\nAdditional Material:\n${material}` : ""}`
      : material || "No material provided";

    let userMessage: string | Array<{type: string; text?: string; image_url?: {url: string}}>;

    if (imageData && typeof imageData === 'string' && imageData.startsWith('data:image/')) {
      userMessage = [
        { type: "text", text: textContent },
        { type: "image_url", image_url: { url: imageData } },
      ];
    } else {
      userMessage = textContent;
    }

    const requestBody = {
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      stream: true,
    };

    const { response, provider } = await callWithFallback(requestBody);

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
    console.error("study-aide error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

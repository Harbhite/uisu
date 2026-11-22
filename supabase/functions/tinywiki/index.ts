import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const LOVABLE_GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";
const GEMINI_GATEWAY = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";
const QWEN_GATEWAY = "https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions";
const GEMINI_MODEL = "gemini-2.5-flash";
const QWEN_MODEL = "qwen-plus";
const MAX_INPUT_CHARS = 800_000;
const MAX_CHAT_TURNS = 10;

// Tries: Lovable AI -> Gemini direct -> Qwen (same fallback chain as flashcard-gen)
async function callWithFallback(body: Record<string, unknown>) {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
  const QWEN_API_KEY = Deno.env.get("QWEN_API_KEY");

  if (LOVABLE_API_KEY) {
    const r = await fetch(LOVABLE_GATEWAY, {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ ...body, model: "google/gemini-2.5-flash" }),
    });
    if (r.ok || (r.status !== 429 && r.status !== 402)) return { response: r, provider: "lovable" };
    await r.text();
  }
  if (GEMINI_API_KEY) {
    const r = await fetch(GEMINI_GATEWAY, {
      method: "POST",
      headers: { Authorization: `Bearer ${GEMINI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ ...body, model: GEMINI_MODEL }),
    });
    if (r.ok) return { response: r, provider: "gemini" };
    await r.text();
  }
  if (!QWEN_API_KEY) throw new Error("All AI providers are unavailable");
  const r = await fetch(QWEN_GATEWAY, {
    method: "POST",
    headers: { Authorization: `Bearer ${QWEN_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ ...body, model: QWEN_MODEL }),
  });
  return { response: r, provider: "qwen" };
}

function errorMessage(status: number, detail = "") {
  const d = detail.toLowerCase();
  if (status === 429 || d.includes("rate limit")) return "Rate limit reached. Please wait a moment and try again.";
  if (status === 402 || d.includes("credits")) return "AI credits exhausted. Please try again later.";
  if (d.includes("context length")) return "This material is too large for one pass. Try a shorter section.";
  return "AI processing failed. Please try again.";
}

const json = (obj: unknown) =>
  new Response(JSON.stringify(obj), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

const wikiTool = {
  type: "function",
  function: {
    name: "build_wiki",
    description: "Return a structured wiki article",
    parameters: {
      type: "object",
      properties: {
        title: { type: "string" },
        summary: { type: "string", description: "150-200 word plain-language summary. No analogies." },
        readingTimeMinutes: { type: "number" },
        difficulty: { type: "string", enum: ["Beginner", "Intermediate", "Advanced"] },
        cognitiveLevel: { type: "string", enum: ["Basic", "Standard", "Advanced"] },
        sections: {
          type: "array",
          items: {
            type: "object",
            properties: {
              heading: { type: "string" },
              content: { type: "string", description: "Detailed Markdown, 4-6 paragraphs, **bold** key terms." },
              keyPoints: { type: "array", items: { type: "string" } },
              citations: { type: "array", items: { type: "string" } },
              criticalPerspectives: { type: "array", items: { type: "string" } },
            },
            required: ["heading", "content", "keyPoints", "citations"],
          },
        },
        relatedTopics: { type: "array", items: { type: "string" } },
        glossary: {
          type: "array",
          items: {
            type: "object",
            properties: { term: { type: "string" }, definition: { type: "string" } },
            required: ["term", "definition"],
          },
        },
      },
      required: ["title", "summary", "readingTimeMinutes", "difficulty", "cognitiveLevel", "sections", "relatedTopics", "glossary"],
    },
  },
};

const LEVEL_NOTE: Record<string, string> = {
  Basic: "Write for a complete beginner.",
  Standard: "Write for a general university audience.",
  Advanced: "Write for an advanced student; be precise and technical.",
};

async function generate(topic: string, material: string, level: string) {
  const source = [topic && `Topic/URL: ${topic}`, material && `Source material:\n${material}`].filter(Boolean).join("\n\n");
  if (!source.trim()) return json({ error: "Enter a topic or upload some material." });
  const truncated = source.length > MAX_INPUT_CHARS;

  const system = `You are an expert writer known for extreme clarity and exhaustive detail. Build a Wikipedia-style wiki entry.
Rules: exhaustive coverage; NO analogies or metaphors; plain simple words; short direct sentences; clean Markdown with **bold** core terms; a glossary of every bolded core term; assess difficulty; ${LEVEL_NOTE[level] ?? LEVEL_NOTE.Standard}; for each section give 2-3 critical perspectives/counter-arguments where applicable (else empty array). If given a YouTube URL, summarise it into a structured guide. Where Nigerian or legal context applies, keep it accurate.`;

  const { response, provider } = await callWithFallback({
    messages: [
      { role: "system", content: system },
      { role: "user", content: source.slice(0, MAX_INPUT_CHARS) },
    ],
    tools: [wikiTool],
    tool_choice: { type: "function", function: { name: "build_wiki" } },
    temperature: 0.2,
  });

  if (!response.ok) {
    const t = await response.text();
    console.error(provider, response.status, t);
    return json({ error: errorMessage(response.status, t) });
  }
  const data = await response.json();
  const args = data.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
  let wiki;
  if (args) wiki = JSON.parse(args);
  else {
    const c = data.choices?.[0]?.message?.content || "";
    const m = c.match(/\{[\s\S]*\}/);
    if (!m) throw new Error("No wiki generated");
    wiki = JSON.parse(m[0]);
  }
  return json({ wiki, truncated });
}

async function chat(messages: { role: string; content: string }[], wiki: any) {
  const context = `Title: ${wiki.title}\nSummary: ${wiki.summary}\n` +
    (wiki.sections ?? []).map((s: any) => `## ${s.heading}\n${String(s.content).slice(0, 600)}...`).join("\n\n");
  const system = `You are a helpful study assistant inside UISU TinyWiki. Answer from the wiki below. If a question goes beyond it, you may answer but say so. Be clear and concise.\n\nWiki:\n---\n${context}\n---`;
  const recent = (messages ?? []).slice(-MAX_CHAT_TURNS).map((m) => ({
    role: m.role === "user" ? "user" : "assistant",
    content: String(m.content).slice(0, 4000),
  }));
  const { response } = await callWithFallback({ messages: [{ role: "system", content: system }, ...recent], temperature: 0.7 });
  if (!response.ok) return json({ error: errorMessage(response.status, await response.text()) });
  const data = await response.json();
  return json({ text: data.choices?.[0]?.message?.content ?? "I could not generate a response." });
}

async function eli5(term: string, context: string) {
  const { response } = await callWithFallback({
    messages: [{
      role: "user",
      content: `Explain "${term}" in the simplest possible terms, as if to a 5-year-old. One or two sentences max.\n\nContext: ${String(context).slice(0, 1500)}`,
    }],
    temperature: 0.5,
  });
  if (!response.ok) return json({ error: errorMessage(response.status, await response.text()) });
  const data = await response.json();
  return json({ text: data.choices?.[0]?.message?.content ?? "Could not generate an explanation." });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const body = await req.json();
    switch (body.action) {
      case "generate": return await generate(body.topic ?? "", body.material ?? "", body.level ?? "Standard");
      case "chat": return await chat(body.messages, body.wiki);
      case "eli5": return await eli5(body.term ?? "", body.context ?? "");
      default: return json({ error: "Unknown action" });
    }
  } catch (e) {
    console.error("tinywiki error:", e);
    return json({ error: errorMessage(500, e instanceof Error ? e.message : "") });
  }
});

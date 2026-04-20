// deno-lint-ignore-file no-explicit-any
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { essay, criteria, title } = await req.json();
    if (typeof essay !== 'string' || essay.trim().length < 50) {
      return new Response(JSON.stringify({ error: 'Essay text is too short (min 50 chars).' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const selectedCriteria: string[] = Array.isArray(criteria) && criteria.length > 0
      ? criteria
      : ['grammar', 'structure', 'argument', 'citations'];

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: 'AI not configured' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const truncated = essay.substring(0, 40000);
    const system = `You are an expert academic writing coach. Analyze the student essay against the selected criteria and return STRICT JSON with this shape:
{
  "overall_score": 0-100,
  "summary": "2-3 sentence overall assessment",
  "criteria_feedback": [
    { "name": "Grammar", "score": 0-100, "feedback": "...", "excerpts": [{"quote": "...", "suggestion": "..."}] }
  ],
  "strengths": ["..."],
  "improvements": ["..."]
}
Only include criteria_feedback entries for the criteria the user selected. Keep excerpts short (<30 words) and literal quotes. No markdown, pure JSON only.`;

    const user = `TITLE: ${title || 'Untitled'}\nSELECTED CRITERIA: ${selectedCriteria.join(', ')}\n\nESSAY:\n${truncated}`;

    const aiRes = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${LOVABLE_API_KEY}` },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
        response_format: { type: 'json_object' },
      }),
    });

    if (aiRes.status === 429) {
      return new Response(JSON.stringify({ error: 'Rate limit reached. Try again shortly.' }), {
        status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (aiRes.status === 402) {
      return new Response(JSON.stringify({ error: 'AI credits exhausted.' }), {
        status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (!aiRes.ok) {
      const msg = await aiRes.text();
      return new Response(JSON.stringify({ error: `AI error: ${msg.substring(0, 200)}` }), {
        status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await aiRes.json();
    let raw = data?.choices?.[0]?.message?.content ?? '{}';
    raw = raw.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
    let parsed: any = {};
    try { parsed = JSON.parse(raw); } catch {
      return new Response(JSON.stringify({ error: 'AI returned invalid JSON' }), {
        status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ feedback: parsed }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message || 'Unexpected error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

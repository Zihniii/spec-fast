import { QUESTIONS } from '@/lib/questions';

/**
 * Validates that answers is an array of exactly 7 non-empty, non-whitespace strings.
 * Returns { valid: true, emptyIndices: [] } if all 7 answers are valid.
 * Returns { valid: false, emptyIndices: [indices...] } otherwise.
 */
export function validateAnswers(answers: unknown): { valid: boolean; emptyIndices: number[] } {
  if (!Array.isArray(answers) || answers.length !== 7) {
    return { valid: false, emptyIndices: [] };
  }

  const emptyIndices: number[] = [];

  for (let i = 0; i < 7; i++) {
    const answer = answers[i];
    if (typeof answer !== 'string' || answer.trim().length === 0) {
      emptyIndices.push(i);
    }
  }

  if (emptyIndices.length > 0) {
    return { valid: false, emptyIndices };
  }

  return { valid: true, emptyIndices: [] };
}

/**
 * Validates that data has a sections array with 3+ items,
 * each having non-empty heading and body strings.
 */
export function validateGenerateResponse(data: unknown): boolean {
  if (data === null || data === undefined || typeof data !== 'object') {
    return false;
  }

  const obj = data as Record<string, unknown>;

  if (!Array.isArray(obj.sections)) {
    return false;
  }

  if (obj.sections.length < 3) {
    return false;
  }

  for (const section of obj.sections) {
    if (section === null || section === undefined || typeof section !== 'object') {
      return false;
    }

    const s = section as Record<string, unknown>;

    if (typeof s.heading !== 'string' || s.heading.trim().length === 0) {
      return false;
    }

    if (typeof s.body !== 'string' || s.body.trim().length === 0) {
      return false;
    }
  }

  return true;
}

function buildPrompt(answers: string[]): string {
  const questionAnswerPairs = QUESTIONS.map(
    (q, i) => `Q${i + 1}: ${q.text}\nA${i + 1}: ${answers[i] || "Not answered"}`
  ).join('\n\n');

  return `You are a senior product strategist helping indie hackers and 
first-time founders turn startup ideas into actionable product specs.

The user answered 7 questions about their idea:

${questionAnswerPairs}

Generate a structured spec as a JSON object with a single key "sections" 
containing an array of objects. Each object must have:
- "heading": section title (string)
- "body": content in markdown (string)

Generate EXACTLY these 8 sections in this order:

1. "Product Overview"
   One paragraph. What it is, who it's for, what it does. 
   Specific and direct — no buzzwords.

2. "Problem Statement"  
   The specific frustration being solved. Written from the 
   user's perspective, not the founder's. 2-3 sentences max.

3. "Target User"
   A proto-persona. Give them a name. Describe their situation, 
   why they have this problem, what they currently do instead.
   End with: "[HYPOTHESIS — validate before building]"

4. "MVP Scope — What We're Building"
   Bullet list of the ONE core feature and its direct sub-components.
   Maximum 5 bullets. Be ruthlessly specific.

5. "MVP Scope — What We're NOT Building"
   Minimum 3 explicitly excluded features with a one-line reason 
   each. Format: "- [Feature]: [why it's cut from v1]"

6. "Success Metrics"
   Exactly 2 metrics:
   - Primary: a volume metric (e.g. specs generated)
   - Secondary: a retention signal (e.g. users who return)
   Include a 30-day target for each.

7. "Key Assumptions"
   Exactly 3 bullet points. The biggest unknowns that could 
   invalidate this product. Frame each as: 
   "We believe [X]. This is wrong if [Y]."

8. "Cursor-Ready Project Context"
   A single block of text the user pastes directly into Cursor, 
   Lovable, or v0 as their project system prompt. Must include:
   - What the product does
   - Who uses it
   - What v1 includes
   - What v1 explicitly does NOT include
   - Preferred stack if mentioned, otherwise suggest: 
     React + Tailwind frontend, AWS Lambda + API Gateway backend, 
     Anthropic Claude API for generation
   Keep this under 150 words. Make it paste-ready.

Rules:
- If an answer is vague, make a reasonable assumption and mark 
  it with [ASSUMPTION: your assumption here]
- Never use: "leverage", "scalable", "robust", "seamless", 
  "innovative", "cutting-edge", "synergy"
- Keep total output under 700 words across all sections
- The persona must feel like a real person, not a demographic
- The Cursor prompt must work as a standalone context block

IMPORTANT: Return ONLY valid JSON. No markdown fences, no text 
outside the JSON. Must be parseable by JSON.parse().

Format: {"sections":[{"heading":"...","body":"..."}]}`;
}

async function callGroqAPI(prompt: string, apiKey: string): Promise<{ data: unknown; error?: string; status?: number }> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 25000);

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'qwen/qwen3-32b',
        messages: [
          {
            role: 'system',
            content: 'You are a JSON-only response bot. You always respond with valid JSON and nothing else.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.5,
        max_tokens: 4096,
        response_format: { type: 'json_object' },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.status === 429) {
      return { data: null, error: 'rate_limit', status: 429 };
    }

    if (!response.ok) {
      return { data: null, error: 'api_error', status: response.status };
    }

    const result = await response.json();
    const content = result?.choices?.[0]?.message?.content;

    if (typeof content !== 'string') {
      return { data: null, error: 'malformed' };
    }

    try {
      const parsed = JSON.parse(content);
      return { data: parsed };
    } catch {
      return { data: null, error: 'malformed' };
    }
  } catch (err: unknown) {
    clearTimeout(timeoutId);

    if (err instanceof Error && err.name === 'AbortError') {
      return { data: null, error: 'timeout' };
    }

    return { data: null, error: 'network' };
  }
}

/**
 * Strips LLM meta-instructions and bracket artifacts from text.
 * Preserves markdown links [text](url), checkboxes [x]/[ ], and short refs like [v1].
 */
function stripLLMArtifacts(text: string): string {
  return text
    .replace(/\[([^\]]*)\](?!\()/g, (_match, inner: string) => {
      // Keep markdown checkboxes
      if (inner === '' || inner === 'x' || inner === ' ') return _match;
      // Keep short single-word references (3 chars or less)
      if (/^[a-z0-9]{1,3}$/i.test(inner.trim())) return _match;
      // Strip everything else
      return '';
    })
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export async function POST(request: Request): Promise<Response> {
  // Validate API key
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: 'Service configuration error' },
      { status: 500 }
    );
  }

  // Parse and validate request body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: 'Exactly 7 non-empty answers required' },
      { status: 400 }
    );
  }

  const { answers } = body as { answers?: unknown };
  const validation = validateAnswers(answers);

  if (!validation.valid) {
    return Response.json(
      { error: 'Exactly 7 non-empty answers required' },
      { status: 400 }
    );
  }

  const prompt = buildPrompt(answers as string[]);

  // First attempt
  let result = await callGroqAPI(prompt, apiKey);

  if (result.error === 'rate_limit') {
    return Response.json(
      { error: 'Too many requests. Please wait a moment and try again.' },
      { status: 429 }
    );
  }

  if (result.error === 'timeout') {
    return Response.json(
      { error: 'Generation timed out. Please try again.' },
      { status: 504 }
    );
  }

  // Check if response is valid
  if (result.error === 'malformed' || !validateGenerateResponse(result.data)) {
    // Retry once on malformed response
    result = await callGroqAPI(prompt, apiKey);

    if (result.error === 'rate_limit') {
      return Response.json(
        { error: 'Too many requests. Please wait a moment and try again.' },
        { status: 429 }
      );
    }

    if (result.error === 'timeout') {
      return Response.json(
        { error: 'Generation timed out. Please try again.' },
        { status: 504 }
      );
    }

    if (result.error === 'malformed' || !validateGenerateResponse(result.data)) {
      return Response.json(
        { error: 'Failed to generate spec. Please try again.' },
        { status: 500 }
      );
    }
  }

  // Network/other errors
  if (result.error && result.error !== 'malformed') {
    return Response.json(
      { error: 'Failed to generate spec. Please try again.' },
      { status: 500 }
    );
  }

  const responseData = result.data as { sections: Array<{ heading: string; body: string }> };

  // Strip LLM meta-artifacts from section bodies before returning
  const cleanedSections = responseData.sections.map((section) => ({
    heading: section.heading,
    body: stripLLMArtifacts(section.body),
  }));

  return Response.json({ sections: cleanedSections });
}

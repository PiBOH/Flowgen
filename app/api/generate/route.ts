import { NextRequest, NextResponse } from 'next/server';
import { GenerateRequest, FlowchartModel } from '@/lib/types';

const SYSTEM_PROMPT = `You are an expert flowchart designer. The user will describe an algorithm or process.
Return ONLY a valid JSON object with no markdown, no explanation, and no code fences.

The JSON must follow this exact structure:
{
  "nodes": [
    {
      "id": "unique-string",
      "type": "start | end | declare | input | output | assign | if | while | for | comment",
      "position": { "x": number, "y": number },
      "data": {
        "label": "display text",
        "variable": "for input/assign/declare/for",
        "varType": "for declare (Integer, Real, String, Boolean)",
        "expression": "for assign/output/condition/declare",
        "condition": "for if/while/for",
        "start": "for for loop",
        "end": "for for loop",
        "direction": "inc or dec",
        "step": "for for loop",
        "comment": "for comment nodes"
      }
    }
  ],
  "edges": [
    {
      "id": "unique-string",
      "source": "source-node-id",
      "target": "target-node-id",
      "label": "optional edge label"
    }
  ]
}

Rules:
- Always include exactly one "start" node and at least one "end" node.
- Use descriptive ids like "start", "input-1", "if-1", "end".
- Position nodes in a top-to-bottom flow with y increasing downward and x centered around 250.
- For "if" nodes, create two outgoing edges: one labeled "True" and one labeled "False".
- For "while" and "for" nodes, create a loop back edge labeled "Loop" if appropriate.
- Keep labels short and clear.
- Ensure the JSON is valid and parseable.`;

const GEMINI_RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    nodes: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          type: { type: 'string' },
          position: {
            type: 'object',
            properties: {
              x: { type: 'number' },
              y: { type: 'number' },
            },
            required: ['x', 'y'],
          },
          data: { type: 'object' },
        },
        required: ['id', 'type', 'position', 'data'],
      },
    },
    edges: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          source: { type: 'string' },
          target: { type: 'string' },
          label: { type: 'string' },
        },
        required: ['id', 'source', 'target'],
      },
    },
  },
  required: ['nodes', 'edges'],
};

const GEMINI_FALLBACK_MODELS = ['gemini-1.5-flash', 'gemini-1.5-pro'];

interface ApiConfig {
  url: string;
  model: string;
  headers: Record<string, string>;
}

interface FetchError {
  ok: false;
  status: number;
  error: string;
  details: string;
  code: string;
}

interface FetchSuccess {
  ok: true;
  data: Record<string, unknown>;
}

type FetchResult = FetchSuccess | FetchError;

function getApiConfig(body: GenerateRequest, modelOverride?: string): ApiConfig {
  const provider = body.provider || 'gemini';

  switch (provider) {
    case 'openrouter': {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY?.trim() || ''}`,
      };
      const referer = process.env.NEXT_PUBLIC_APP_URL || 'https://flowgen.vercel.app';
      if (referer) headers['HTTP-Referer'] = referer;
      headers['X-Title'] = 'Flowgen';
      return {
        url: body.apiUrl || 'https://openrouter.ai/api/v1/chat/completions',
        model: modelOverride || body.model || 'meta-llama/llama-3.3-70b-instruct:free',
        headers,
      };
    }
    case 'gemini': {
      const geminiModel = modelOverride || body.model || 'gemini-1.5-flash';
      const geminiApiKey = process.env.GEMINI_API_KEY?.trim() || '';
      return {
        url: `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(geminiModel)}:generateContent?key=${encodeURIComponent(geminiApiKey)}`,
        model: geminiModel,
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': geminiApiKey,
        },
      };
    }
    case 'custom':
      return {
        url: body.apiUrl || '',
        model: modelOverride || body.model || 'default',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.CUSTOM_API_KEY?.trim() || ''}`,
        },
      };
    default:
      return {
        url: 'https://api.openai.com/v1/chat/completions',
        model: modelOverride || body.model || 'gpt-4o-mini',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENAI_API_KEY?.trim() || ''}`,
        },
      };
  }
}

function buildPayload(request: GenerateRequest, config: ApiConfig) {
  if (request.provider === 'gemini') {
    return {
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: [{ role: 'user', parts: [{ text: request.prompt }] }],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: 'application/json',
        responseSchema: GEMINI_RESPONSE_SCHEMA,
      },
    };
  }

  const payload: Record<string, unknown> = {
    model: config.model,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: request.prompt },
    ],
    temperature: 0.2,
  };

  if (request.jsonMode || request.provider === 'openai') {
    payload.response_format = { type: 'json_object' };
  }

  return payload;
}

async function fetchProvider(
  config: ApiConfig,
  payload: Record<string, unknown>,
  provider: string
): Promise<FetchResult> {
  const response = await fetch(config.url, {
    method: 'POST',
    headers: config.headers,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    const isPaymentRequired = response.status === 402;
    const isNotFound = response.status === 404;
    const isRateLimited = response.status === 429;
    let extraDetail = '';
    try {
      const parsed = JSON.parse(errorText);
      if (parsed.error?.message) extraDetail = ` — ${parsed.error.message}`;
      else if (parsed.error) extraDetail = ` — ${JSON.stringify(parsed.error)}`;
    } catch {
      // ignore non-JSON error bodies
    }

    let errorMessage: string;

    // eslint-disable-next-line no-console
    console.error(`AI provider error (${response.status} ${response.statusText}) for ${provider}: ${extraDetail || errorText.slice(0, 200)}`);
    if (isPaymentRequired) {
      errorMessage = 'OpenRouter requires a payment method or positive balance. Even free models need an active billing profile. Visit https://openrouter.ai/settings/billing to add credits or a payment method.';
    } else if (isNotFound && provider === 'gemini') {
      errorMessage = `Gemini model not found (404). Verify the model name "${config.model}" and that your API key has access to Gemini.${extraDetail}`;
    } else if (isRateLimited && provider === 'gemini') {
      errorMessage = `Gemini rate limit exceeded (429) for model "${config.model}".${extraDetail}`;
    } else {
      errorMessage = `AI provider error: ${response.status} ${response.statusText}${extraDetail}`;
    }

    const safeDetails = errorText.trimStart().startsWith('<')
      ? 'HTML error response from provider (truncated).'
      : errorText;

    return {
      ok: false,
      status: response.status,
      error: errorMessage,
      details: safeDetails,
      code: isPaymentRequired ? 'FG-008' : 'FG-003',
    };
  }

  const data = (await response.json()) as Record<string, unknown>;
  return { ok: true, data };
}

function parseFlowchart(data: Record<string, unknown>, provider: string) {
  if (provider === 'gemini' && data.error) {
    return {
      ok: false,
      error: `Gemini error: ${(data.error as { message?: string }).message || JSON.stringify(data.error)}`,
      code: 'FG-010',
    };
  }

  if (provider === 'gemini' && (data as { promptFeedback?: { blockReason?: string } }).promptFeedback?.blockReason) {
    return {
      ok: false,
      error: `Content blocked by Gemini: ${(data as { promptFeedback: { blockReason: string } }).promptFeedback.blockReason}`,
      code: 'FG-009',
    };
  }

  const content =
    provider === 'gemini'
      ? (data as { candidates?: { content?: { parts?: { text?: string }[] } }[] }).candidates?.[0]?.content?.parts?.[0]?.text
      : (data as { choices?: { message?: { content?: string } }[] }).choices?.[0]?.message?.content;

  if (!content) {
    return { ok: false, error: 'Empty response from AI provider', code: 'FG-004' };
  }

  let flowchart: FlowchartModel;
  try {
    flowchart = JSON.parse(content);
  } catch {
    return { ok: false, error: 'Failed to parse AI response as JSON', raw: content, code: 'FG-005' };
  }

  if (!Array.isArray(flowchart.nodes) || !Array.isArray(flowchart.edges)) {
    return { ok: false, error: 'Invalid flowchart structure', flowchart, code: 'FG-006' };
  }

  return { ok: true, flowchart };
}

export async function POST(req: NextRequest) {
  try {
    const request: GenerateRequest = await req.json();

    if (!request.prompt || typeof request.prompt !== 'string') {
      return NextResponse.json({ code: 'FG-001', error: 'Prompt is required' }, { status: 400 });
    }

    const provider = request.provider || 'gemini';
    const config = getApiConfig(request);

    if (provider === 'custom' && !config.url) {
      return NextResponse.json(
        { code: 'FG-002', error: 'Custom API URL is missing. Set a valid endpoint URL.' },
        { status: 400 }
      );
    }

    const isKeyMissing =
      provider === 'gemini'
        ? !process.env.GEMINI_API_KEY?.trim()
        : !config.headers.Authorization || config.headers.Authorization === 'Bearer ';

    if (isKeyMissing) {
      return NextResponse.json(
        {
          code: 'FG-002',
          error:
            'API key is missing. Set the appropriate environment variable in .env (or .env.local for local overrides).'
        },
        { status: 400 }
      );
    }

    const modelsToTry =
      provider === 'gemini'
        ? [config.model, ...GEMINI_FALLBACK_MODELS.filter((m) => m !== config.model)]
        : [config.model];

    let lastError: { error: string; details: string; code: string } | null = null;

    for (const model of modelsToTry) {
      const modelConfig = getApiConfig(request, model);
      const payload = buildPayload(request, modelConfig);
      const result = await fetchProvider(modelConfig, payload, provider);

      if (!result.ok) {
        lastError = { error: result.error, details: result.details, code: result.code };
        if (result.status === 429) {
          // eslint-disable-next-line no-console
          console.error(`Gemini model "${model}" rate limited; trying fallback...`);
          continue;
        }
        return NextResponse.json(
          { code: result.code, error: result.error, details: result.details },
          { status: 502 }
        );
      }

      const parsed = parseFlowchart(result.data, provider);
      if (!parsed.ok) {
        return NextResponse.json(parsed, { status: 502 });
      }

      return NextResponse.json({ flowchart: parsed.flowchart });
    }

    if (lastError) {
      const fallbackMessage = `All Gemini models were rate limited (tried: ${modelsToTry.join(', ')}). ${lastError.error}`;
      return NextResponse.json(
        { code: lastError.code, error: fallbackMessage, details: lastError.details },
        { status: 502 }
      );
    }

    return NextResponse.json({ code: 'FG-007', error: 'Unknown error' }, { status: 500 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ code: 'FG-007', error: message }, { status: 500 });
  }
}

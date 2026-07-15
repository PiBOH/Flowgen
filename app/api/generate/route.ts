import { NextRequest, NextResponse } from 'next/server';
import {
  GoogleGenerativeAI,
  GoogleGenerativeAIFetchError,
  SchemaType,
  type Schema,
} from '@google/generative-ai';
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

const GEMINI_RESPONSE_SCHEMA: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    nodes: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          id: { type: SchemaType.STRING },
          type: { type: SchemaType.STRING },
          position: {
            type: SchemaType.OBJECT,
            properties: {
              x: { type: SchemaType.NUMBER },
              y: { type: SchemaType.NUMBER },
            },
            required: ['x', 'y'],
          },
          data: { type: SchemaType.OBJECT, properties: {} },
        },
        required: ['id', 'type', 'position', 'data'],
      },
    },
    edges: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          id: { type: SchemaType.STRING },
          source: { type: SchemaType.STRING },
          target: { type: SchemaType.STRING },
          label: { type: SchemaType.STRING },
        },
        required: ['id', 'source', 'target'],
      },
    },
  },
  required: ['nodes', 'edges'],
};

const GEMINI_FALLBACK_MODELS = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'];

// ── Non-Gemini provider helpers (OpenAI, OpenRouter, Custom) ──

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
  const provider = body.provider || 'openai';

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
    let extraDetail = '';
    try {
      const parsed = JSON.parse(errorText);
      if (parsed.error?.message) extraDetail = ` — ${parsed.error.message}`;
      else if (parsed.error) extraDetail = ` — ${JSON.stringify(parsed.error)}`;
    } catch {
      // ignore non-JSON error bodies
    }

    // eslint-disable-next-line no-console
    console.error(
      `AI provider error (${response.status} ${response.statusText}) for ${provider}: ${extraDetail || errorText.slice(0, 200)}`
    );

    let errorMessage: string;
    if (isPaymentRequired) {
      errorMessage =
        'OpenRouter requires a payment method or positive balance. Even free models need an active billing profile. Visit https://openrouter.ai/settings/billing to add credits or a payment method.';
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

function parseNonGeminiFlowchart(data: Record<string, unknown>) {
  const content = (
    data as { choices?: { message?: { content?: string } }[] }
  ).choices?.[0]?.message?.content;

  if (!content) {
    return { ok: false as const, error: 'Empty response from AI provider', code: 'FG-004' };
  }

  let flowchart: FlowchartModel;
  try {
    flowchart = JSON.parse(content);
  } catch {
    return { ok: false as const, error: 'Failed to parse AI response as JSON', raw: content, code: 'FG-005' };
  }

  if (!Array.isArray(flowchart.nodes) || !Array.isArray(flowchart.edges)) {
    return { ok: false as const, error: 'Invalid flowchart structure', flowchart, code: 'FG-006' };
  }

  return { ok: true as const, flowchart };
}

// ── Gemini SDK helpers ──

type GeminiSdkResult =
  | { ok: true; flowchart: FlowchartModel }
  | { ok: false; error: string; details: string; code: string; status: number };

async function callGeminiSDK(model: string, prompt: string): Promise<GeminiSdkResult> {
  try {
    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) {
      return { ok: false, error: 'GEMINI_API_KEY not configured on the server.', details: '', code: 'FG-002', status: 400 };
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const geminiModel = genAI.getGenerativeModel({
      model,
      systemInstruction: SYSTEM_PROMPT,
    });

    const result = await geminiModel.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: 'application/json',
        responseSchema: GEMINI_RESPONSE_SCHEMA,
      },
    });

    const content = result.response.text();

    let flowchart: FlowchartModel;
    try {
      flowchart = JSON.parse(content);
    } catch {
      return {
        ok: false,
        error: 'Failed to parse AI response as JSON',
        details: content.slice(0, 500),
        code: 'FG-005',
        status: 502,
      };
    }

    if (!Array.isArray(flowchart.nodes) || !Array.isArray(flowchart.edges)) {
      return {
        ok: false,
        error: 'Invalid flowchart structure from AI',
        details: '',
        code: 'FG-006',
        status: 502,
      };
    }

    return { ok: true, flowchart };
  } catch (error: unknown) {
    let errorMessage = 'Unknown Gemini SDK error';
    let status = 502;

    if (error instanceof GoogleGenerativeAIFetchError) {
      errorMessage = error.message || 'Gemini API fetch error';
      status = error.status ?? 502;
      // eslint-disable-next-line no-console
      console.error(`Gemini SDK fetch error (status ${status}) for model "${model}":`, errorMessage);
    } else if (error instanceof Error) {
      errorMessage = error.message;
      // eslint-disable-next-line no-console
      console.error(`Gemini SDK error for model "${model}":`, errorMessage);
    }

    const isRateLimited =
      status === 429 ||
      errorMessage.includes('429') ||
      errorMessage.includes('RESOURCE_EXHAUSTED') ||
      errorMessage.toLowerCase().includes('rate limit');

    return {
      ok: false,
      error: isRateLimited
        ? `Gemini rate limit exceeded (429) for model "${model}".`
        : `Gemini error: ${errorMessage}`,
      details: errorMessage,
      code: isRateLimited ? 'FG-429' : 'FG-003',
      status: isRateLimited ? 429 : status,
    };
  }
}

// ── POST handler ──

export async function POST(req: NextRequest) {
  try {
    const request: GenerateRequest = await req.json();

    if (!request.prompt || typeof request.prompt !== 'string') {
      return NextResponse.json({ code: 'FG-001', error: 'Prompt is required' }, { status: 400 });
    }

    const provider = request.provider || 'gemini';

    // ── Gemini — use the official SDK ──
    if (provider === 'gemini') {
      const apiKey = process.env.GEMINI_API_KEY?.trim();
      if (!apiKey) {
        return NextResponse.json(
          {
            code: 'FG-002',
            error:
              'API key is missing. Set GEMINI_API_KEY in your .env file (or .env.local for local overrides).',
          },
          { status: 400 }
        );
      }

      const userModel = request.model || 'gemini-2.5-flash';
      const modelsToTry = [userModel, ...GEMINI_FALLBACK_MODELS.filter((m) => m !== userModel)];

      let lastError: { error: string; details: string; code: string } | null = null;
      let fallbackUsed = false;

      for (const model of modelsToTry) {
        // eslint-disable-next-line no-console
        console.log(`Gemini SDK: trying model "${model}"...`);
        const result = await callGeminiSDK(model, request.prompt);

        if (!result.ok) {
          lastError = { error: result.error, details: result.details, code: result.code };
          if (result.status === 429) {
            fallbackUsed = true;
            // eslint-disable-next-line no-console
            console.error(`Gemini model "${model}" rate limited; trying fallback...`);
            continue;
          }
          return NextResponse.json(
            { code: result.code, error: result.error, details: result.details },
            { status: 502 }
          );
        }

        const responsePayload: Record<string, unknown> = { flowchart: result.flowchart };
        if (fallbackUsed) {
          responsePayload.fallbackModel = model;
        }
        return NextResponse.json(responsePayload);
      }

      // All models were rate-limited
      if (lastError) {
        const fallbackMessage = `All Gemini models were rate limited (tried: ${modelsToTry.join(', ')}). ${lastError.error}`;
        return NextResponse.json(
          { code: lastError.code, error: fallbackMessage, details: lastError.details },
          { status: 502 }
        );
      }

      return NextResponse.json({ code: 'FG-007', error: 'Unknown error' }, { status: 500 });
    }

    // ── Non-Gemini providers (OpenAI, OpenRouter, Custom) ──
    const config = getApiConfig(request);

    if (provider === 'custom' && !config.url) {
      return NextResponse.json(
        { code: 'FG-002', error: 'Custom API URL is missing. Set a valid endpoint URL.' },
        { status: 400 }
      );
    }

    const isKeyMissing =
      !config.headers.Authorization || config.headers.Authorization === 'Bearer ';

    if (isKeyMissing) {
      const keyEnvName =
        provider === 'openai'
          ? 'OPENAI_API_KEY'
          : provider === 'openrouter'
            ? 'OPENROUTER_API_KEY'
            : 'CUSTOM_API_KEY';
      return NextResponse.json(
        {
          code: 'FG-002',
          error: `API key is missing. Set ${keyEnvName} in your .env file (or .env.local for local overrides).`,
        },
        { status: 400 }
      );
    }

    const payload = buildPayload(request, config);
    const result = await fetchProvider(config, payload, provider);

    if (!result.ok) {
      return NextResponse.json(
        { code: result.code, error: result.error, details: result.details },
        { status: 502 }
      );
    }

    const parsed = parseNonGeminiFlowchart(result.data);
    if (!parsed.ok) {
      return NextResponse.json(parsed, { status: 502 });
    }

    return NextResponse.json({ flowchart: parsed.flowchart });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ code: 'FG-007', error: message }, { status: 500 });
  }
}

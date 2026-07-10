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

function getApiConfig(body: GenerateRequest) {
  const provider = body.provider || 'openrouter';

  switch (provider) {
    case 'openrouter': {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${body.apiKey || process.env.OPENROUTER_API_KEY?.trim() || ''}`,
      };
      const referer = process.env.NEXT_PUBLIC_APP_URL || 'https://flowgen.vercel.app';
      if (referer) headers['HTTP-Referer'] = referer;
      headers['X-Title'] = 'Flowgen';
      return {
        url: body.apiUrl || 'https://openrouter.ai/api/v1/chat/completions',
        model: body.model || 'meta-llama/llama-3.3-70b-instruct:free',
        headers,
      };
    }
    case 'gemini': {
      const geminiModel = body.model || 'gemini-1.5-flash';
      return {
        url: `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(geminiModel)}:generateContent`,
        model: geminiModel,
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': body.apiKey || process.env.GEMINI_API_KEY?.trim() || '',
        },
      };
    }
    case 'custom':
      return {
        url: body.apiUrl || '',
        model: body.model || 'default',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${body.apiKey || ''}`,
        },
      };
    default:
      return {
        url: 'https://api.openai.com/v1/chat/completions',
        model: body.model || 'gpt-4o-mini',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${body.apiKey || process.env.OPENAI_API_KEY?.trim() || ''}`,
        },
      };
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: GenerateRequest = await req.json();
    const apiKey = body.apiKey?.trim();
    const request: GenerateRequest = { ...body, apiKey };

    if (!request.prompt || typeof request.prompt !== 'string') {
      return NextResponse.json({ code: 'FG-001', error: 'Prompt is required' }, { status: 400 });
    }

    const config = getApiConfig(request);

    const isKeyMissing =
      request.provider === 'gemini'
        ? !(request.apiKey || process.env.GEMINI_API_KEY?.trim())
        : !config.headers.Authorization || config.headers.Authorization === 'Bearer ';

    if (isKeyMissing) {
      return NextResponse.json(
        {
          code: 'FG-002',
          error:
            'API key is missing. Add it in the Settings panel or set the appropriate environment variable in .env (or .env.local for local overrides).'
        },
        { status: 400 }
      );
    }

    let payload: Record<string, unknown>;
    if (request.provider === 'gemini') {
      payload = {
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ role: 'user', parts: [{ text: request.prompt }] }],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: 'application/json',
          responseSchema: GEMINI_RESPONSE_SCHEMA,
        },
      };
    } else {
      payload = {
        model: config.model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: request.prompt },
        ],
        temperature: 0.2,
      };

      // response_format is OpenAI-specific; use it only when explicitly requested or for OpenAI
      if (request.jsonMode || request.provider === 'openai') {
        payload.response_format = { type: 'json_object' };
      }
    }

    const response = await fetch(config.url, {
      method: 'POST',
      headers: config.headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      const isPaymentRequired = response.status === 402;
      const errorMessage = isPaymentRequired
        ? 'OpenRouter requires a payment method or positive balance. Even free models need an active billing profile. Visit https://openrouter.ai/settings/billing to add credits or a payment method.'
        : `AI provider error: ${response.status} ${response.statusText}`;

      return NextResponse.json(
        { code: isPaymentRequired ? 'FG-008' : 'FG-003', error: errorMessage, details: errorText },
        { status: 502 }
      );
    }

    const data = await response.json();

    if (request.provider === 'gemini' && data.error) {
      return NextResponse.json(
        { code: 'FG-010', error: `Gemini error: ${data.error.message || JSON.stringify(data.error)}` },
        { status: 502 }
      );
    }

    if (request.provider === 'gemini' && data.promptFeedback?.blockReason) {
      return NextResponse.json(
        { code: 'FG-009', error: `Content blocked by Gemini: ${data.promptFeedback.blockReason}` },
        { status: 502 }
      );
    }

    const content =
      request.provider === 'gemini'
        ? data.candidates?.[0]?.content?.parts?.[0]?.text
        : data.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json({ code: 'FG-004', error: 'Empty response from AI provider' }, { status: 502 });
    }

    let flowchart: FlowchartModel;
    try {
      flowchart = JSON.parse(content);
    } catch (err) {
      return NextResponse.json(
        { code: 'FG-005', error: 'Failed to parse AI response as JSON', raw: content },
        { status: 502 }
      );
    }

    // Basic validation
    if (!Array.isArray(flowchart.nodes) || !Array.isArray(flowchart.edges)) {
      return NextResponse.json(
        { code: 'FG-006', error: 'Invalid flowchart structure', flowchart },
        { status: 502 }
      );
    }

    return NextResponse.json({ flowchart });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ code: 'FG-007', error: message }, { status: 500 });
  }
}

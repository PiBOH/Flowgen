import { NextResponse } from 'next/server';

interface GeminiModel {
  name: string;
  displayName: string;
  description?: string;
  supportedGenerationMethods?: string[];
}

interface ModelListResponse {
  models: GeminiModel[];
}

export async function GET() {
  try {
    const apiKey = process.env.GEMINI_API_KEY?.trim();

    if (!apiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY not configured on the server.' },
        { status: 400 }
      );
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`,
      { next: { revalidate: 300 } } // cache for 5 minutes
    );

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Failed to fetch models: ${response.status} ${response.statusText}`, details: errorText.slice(0, 500) },
        { status: 502 }
      );
    }

    const data = (await response.json()) as ModelListResponse;

    if (!Array.isArray(data.models)) {
      return NextResponse.json({ error: 'Unexpected response format from Gemini API' }, { status: 502 });
    }

    // Filter to show only Gemini models that support generateContent
    const geminiModels = data.models
      .filter(
        (m) =>
          m.name.startsWith('models/gemini-') &&
          m.supportedGenerationMethods?.includes('generateContent')
      )
      .map((m) => ({
        name: m.name.replace('models/', ''),
        displayName: m.displayName,
        description: m.description || '',
      }))
      .sort((a, b) => b.name.localeCompare(a.name)); // newest first

    return NextResponse.json({ models: geminiModels });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

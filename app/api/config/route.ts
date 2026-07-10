import { NextResponse } from 'next/server';

export interface ConfigResponse {
  hasOpenRouterKey: boolean;
  hasOpenAiKey: boolean;
  hasGeminiKey: boolean;
  hasCustomKey: boolean;
}

export async function GET() {
  return NextResponse.json({
    hasOpenRouterKey: Boolean(process.env.OPENROUTER_API_KEY?.trim()),
    hasOpenAiKey: Boolean(process.env.OPENAI_API_KEY?.trim()),
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY?.trim()),
    hasCustomKey: Boolean(process.env.CUSTOM_API_KEY?.trim()),
  });
}

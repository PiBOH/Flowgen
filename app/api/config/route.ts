import { NextResponse } from 'next/server';

export interface ConfigResponse {
  hasOpenRouterKey: boolean;
}

export async function GET() {
  const hasOpenRouterKey = Boolean(process.env.OPENROUTER_API_KEY);

  return NextResponse.json({ hasOpenRouterKey });
}

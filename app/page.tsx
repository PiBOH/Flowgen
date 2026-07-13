'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import dynamic from 'next/dynamic';
import PromptInput from '@/components/ui/PromptInput';
import ExportToolbar from '@/components/ui/ExportToolbar';
import LanguageSelector from '@/components/ui/LanguageSelector';
import SettingsPanel from '@/components/ui/SettingsPanel';
import AppInfo from '@/components/ui/AppInfo';
import { FlowchartModel, AiSettings } from '@/lib/types';
import { exampleFlowchart } from '@/lib/examples';

const FlowchartCanvas = dynamic(() => import('@/components/flowchart/FlowchartCanvas'), {
  ssr: false,
});

const defaultFlowchart: FlowchartModel = {
  nodes: [
    { id: 'start', type: 'start', position: { x: 250, y: 0 }, data: { label: 'Start' } },
    { id: 'input', type: 'input', position: { x: 250, y: 100 }, data: { label: 'Input n', variable: 'n' } },
    { id: 'if', type: 'if', position: { x: 250, y: 200 }, data: { label: 'n > 0?', condition: 'n > 0' } },
    { id: 'output-pos', type: 'output', position: { x: 100, y: 300 }, data: { label: 'Output Positive', expression: '"Positive"' } },
    { id: 'output-neg', type: 'output', position: { x: 400, y: 300 }, data: { label: 'Output Negative', expression: '"Negative"' } },
    { id: 'end', type: 'end', position: { x: 250, y: 400 }, data: { label: 'End' } },
  ],
  edges: [
    { id: 'e1', source: 'start', target: 'input' },
    { id: 'e2', source: 'input', target: 'if' },
    { id: 'e3', source: 'if', target: 'output-pos', label: 'True' },
    { id: 'e4', source: 'if', target: 'output-neg', label: 'False' },
    { id: 'e5', source: 'output-pos', target: 'end' },
    { id: 'e6', source: 'output-neg', target: 'end' },
  ],
};

const defaultSettings: AiSettings = {
  provider: 'gemini',
  model: 'gemini-1.5-flash',
  apiUrl: '',
};

export default function Home() {
  const { t } = useTranslation();
  const [flowchart, setFlowchart] = useState<FlowchartModel>(defaultFlowchart);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<AiSettings>(defaultSettings);
  const [hasServerKey, setHasServerKey] = useState<boolean | null>(null);
  const [prompt, setPrompt] = useState('');
  const [fallbackModel, setFallbackModel] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/config')
      .then((res) => res.json())
      .then((data) => {
        const keyMap: Record<AiSettings['provider'], boolean> = {
          openrouter: data.hasOpenRouterKey,
          openai: data.hasOpenAiKey,
          gemini: data.hasGeminiKey,
          custom: data.hasCustomKey,
        };
        setHasServerKey(keyMap[settings.provider]);
      })
      .catch(() => setHasServerKey(false));
  }, [settings.provider]);

  const showApiKeyWarning = hasServerKey === false;

  const handleLoadExample = () => {
    setPrompt(t('examplePrompt') as string);
    setFlowchart(exampleFlowchart);
    setError(null);
  };

  const handleGenerate = async (prompt: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          provider: settings.provider,
          model: settings.model || undefined,
          apiUrl: settings.apiUrl || undefined,
        }),
      });

      const textBody = await response.text();
      let data: Record<string, unknown>;
      try {
        data = JSON.parse(textBody);
      } catch {
        throw new Error(
          `Unexpected server response (HTTP ${response.status}): ${textBody.slice(0, 200)}...`
        );
      }

      if (!response.ok) {
        const errorTextValue =
          typeof data.error === 'string' ? data.error : data.error ? String(data.error) : '';
        const detail =
          data.details && typeof data.details === 'string' && !data.details.trimStart().startsWith('<')
            ? `\n\nDetails: ${data.details}`
            : '';
        throw new Error((errorTextValue || t('errorGenerating')) + detail);
      }

      const flowchartData = data.flowchart as FlowchartModel;
      if (!flowchartData || !Array.isArray(flowchartData.nodes) || !Array.isArray(flowchartData.edges)) {
        throw new Error(t('errorGenerating') as string);
      }
      setFlowchart(flowchartData);
      if (typeof data.fallbackModel === 'string') {
        setFallbackModel(data.fallbackModel);
      } else {
        setFallbackModel(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : (t('errorGenerating') as string));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex-1 flex flex-col">
      <header className="bg-white border-b border-gray-200 px-4 py-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('appName')}</h1>
            <p className="text-sm text-gray-600">{t('tagline')}</p>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSelector />
            <SettingsPanel value={settings} onChange={setSettings} />
            <AppInfo />
          </div>
        </div>
      </header>

      <section className="px-4 py-6 sm:px-6 lg:px-8 bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto">
          <PromptInput
            prompt={prompt}
            onPromptChange={setPrompt}
            onGenerate={handleGenerate}
            onLoadExample={handleLoadExample}
            loading={loading}
          />
        </div>
      </section>

      <section className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col gap-4 h-full">
          <ExportToolbar flowchart={flowchart} canvasRef={canvasRef} />

          {showApiKeyWarning && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
              {t('missingServerApiKey')}
            </div>
          )}

          {fallbackModel && (
            <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm">
              <div className="flex-1">
                {t('fallbackNotification', { model: fallbackModel })}
              </div>
              <button
                onClick={() => setFallbackModel(null)}
                className="flex-shrink-0 text-blue-400 hover:text-blue-600 transition-colors"
                aria-label="Dismiss"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm whitespace-pre-wrap">
              {error}
            </div>
          )}

          <div className="flex-1 min-h-[500px]" ref={canvasRef}>
            <FlowchartCanvas flowchart={flowchart} />
          </div>

          <p className="text-xs text-gray-500 text-center">{t('translationNotice')}</p>
        </div>
      </section>
    </main>
  );
}

'use client';

import { useState, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Settings, HelpCircle, RefreshCw } from 'lucide-react';
import { AiSettings } from '@/lib/types';
import { useOnClickOutside } from '@/hooks/useOnClickOutside';
import Tooltip from './Tooltip';

interface Preset {
  label: string;
  model: string;
  apiUrl: string;
}

const presets: Record<string, Preset> = {
  ollama: {
    label: 'Ollama (local)',
    model: 'llama3.1',
    apiUrl: 'http://localhost:11434/v1/chat/completions',
  },
  sambanova: {
    label: 'SambaNova Cloud (free tier)',
    model: 'Meta-Llama-3.3-70B-Instruct',
    apiUrl: 'https://api.sambanova.ai/v1/chat/completions',
  },
  github: {
    label: 'GitHub Models (free tier)',
    model: 'meta-llama-3.3-70b-instruct',
    apiUrl: 'https://models.inference.ai.azure.com/chat/completions',
  },
};

interface SettingsPanelProps {
  value: AiSettings;
  onChange: (settings: AiSettings) => void;
}

const defaultModels: Record<AiSettings['provider'], string> = {
  openai: 'gpt-4o-mini',
  openrouter: 'meta-llama/llama-3.3-70b-instruct:free',
  gemini: 'gemini-2.5-flash',
  custom: '',
};

const envKeyNames: Record<AiSettings['provider'], string> = {
  openai: 'OPENAI_API_KEY',
  openrouter: 'OPENROUTER_API_KEY',
  gemini: 'GEMINI_API_KEY',
  custom: 'CUSTOM_API_KEY',
};

const geminiModels = [
  { value: 'gemini-2.5-flash', label: 'gemini-2.5-flash' },
  { value: 'gemini-2.5-flash-lite', label: 'gemini-2.5-flash-lite' },
  { value: 'gemini-2.5-pro', label: 'gemini-2.5-pro' },
  { value: 'gemini-2.0-flash', label: 'gemini-2.0-flash' },
  { value: 'gemini-2.0-flash-001', label: 'gemini-2.0-flash-001' },
  { value: 'gemini-1.5-flash', label: 'gemini-1.5-flash' },
  { value: 'gemini-1.5-flash-001', label: 'gemini-1.5-flash-001' },
  { value: 'gemini-1.5-pro', label: 'gemini-1.5-pro' },
  { value: 'gemini-1.5-pro-001', label: 'gemini-1.5-pro-001' },
];

const geminiModelValues = new Set(geminiModels.map((m) => m.value));

interface LiveModel {
  name: string;
  displayName: string;
  description?: string;
}

export default function SettingsPanel({ value, onChange }: SettingsPanelProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [liveModels, setLiveModels] = useState<LiveModel[] | null>(null);
  const [refreshingModels, setRefreshingModels] = useState(false);
  const [modelsError, setModelsError] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(panelRef, () => setIsOpen(false));

  const handleChange = (field: keyof AiSettings, newValue: string) => {
    const next = { ...value, [field]: newValue };
    if (field === 'provider') {
      next.model = defaultModels[next.provider];
    }
    onChange(next);
  };

  const refreshModels = useCallback(async () => {
    setRefreshingModels(true);
    setModelsError(null);
    try {
      const res = await fetch('/api/models');
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch models');
      }
      if (Array.isArray(data.models) && data.models.length > 0) {
        setLiveModels(data.models);
      } else {
        setModelsError('No models returned from API');
      }
    } catch (err) {
      setModelsError(err instanceof Error ? err.message : 'Failed to refresh models');
    } finally {
      setRefreshingModels(false);
    }
  }, []);

  const availableGeminiModels = liveModels && liveModels.length > 0
    ? liveModels.map((m) => ({ value: m.name, label: m.displayName }))
    : geminiModels;
  const availableGeminiModelValues = new Set(availableGeminiModels.map((m) => m.value));

  return (
    <div ref={panelRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
        title={t('settings') as string}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-controls="settings-panel"
      >
        <Settings size={20} />
      </button>

      {isOpen && (
        <div id="settings-panel" className="absolute right-0 top-full mt-2 w-80 max-w-[calc(100vw-1rem)] bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">
            {t('aiSettings') as string}
          </h3>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {t('provider') as string}
              </label>
              <select
                value={value.provider}
                onChange={(e) => handleChange('provider', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="openai">OpenAI</option>
                <option value="openrouter">OpenRouter</option>
                <option value="gemini">Google Gemini</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            <div>
              <div className="flex items-center gap-1 mb-1">
                <label className="block text-xs font-medium text-gray-700">
                  {t('model') as string}
                </label>
                {value.provider === 'openrouter' && (
                  <Tooltip text={t('openRouterFreeTooltip') as string}>
                    <button
                      type="button"
                      className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-sm"
                    >
                      <HelpCircle size={14} />
                    </button>
                  </Tooltip>
                )}
              </div>
              {value.provider === 'gemini' ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <select
                      value={availableGeminiModelValues.has(value.model) ? value.model : 'custom'}
                      onChange={(e) =>
                        handleChange('model', e.target.value === 'custom' ? '' : e.target.value)
                      }
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      {availableGeminiModels.map((m) => (
                        <option key={m.value} value={m.value}>
                          {m.label}
                        </option>
                      ))}
                      <option value="custom">{t('otherModel') as string}</option>
                    </select>
                    <button
                      type="button"
                      onClick={refreshModels}
                      disabled={refreshingModels}
                      className="flex-shrink-0 p-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Refresh models from API"
                    >
                      <RefreshCw
                        size={16}
                        className={refreshingModels ? 'animate-spin' : ''}
                      />
                    </button>
                  </div>
                  {liveModels && (
                    <p className="text-[10px] text-green-600">
                      {liveModels.length} models loaded from API
                    </p>
                  )}
                  {modelsError && (
                    <p className="text-[10px] text-amber-600">{modelsError}</p>
                  )}
                  {!availableGeminiModelValues.has(value.model) && (
                    <input
                      type="text"
                      value={value.model}
                      onChange={(e) => handleChange('model', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder={t('geminiModelPlaceholder') as string}
                    />
                  )}
                </div>
              ) : (
                <input
                  type="text"
                  value={value.model}
                  onChange={(e) => handleChange('model', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder={t('modelPlaceholder') as string}
                />
              )}
            </div>

            {value.provider === 'custom' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    {t('presets') as string}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(presets).map(([key, preset]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() =>
                          onChange({
                            ...value,
                            provider: 'custom',
                            model: preset.model,
                            apiUrl: preset.apiUrl,
                          })
                        }
                        className="px-2 py-1 text-xs border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    {t('apiUrl') as string}
                  </label>
                  <input
                    type="text"
                    value={value.apiUrl}
                    onChange={(e) => handleChange('apiUrl', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="https://api.example.com/v1/chat/completions"
                  />
                </div>
              </div>
            )}

            <div className="p-2 bg-gray-50 border border-gray-200 rounded-md">
              <p className="text-xs text-gray-600">
                {value.provider === 'custom'
                  ? `Set your API key in the ${envKeyNames[value.provider]} environment variable.`
                  : `Set ${envKeyNames[value.provider]} in your .env file or Vercel Environment Variables.`}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

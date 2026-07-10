'use client';

import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Settings, HelpCircle } from 'lucide-react';
import { AiSettings } from '@/lib/types';
import { useOnClickOutside } from '@/hooks/useOnClickOutside';
import Tooltip from './Tooltip';

interface Preset {
  label: string;
  model: string;
  apiUrl: string;
  apiKeyHint: string;
}

const presets: Record<string, Preset> = {
  ollama: {
    label: 'Ollama (local)',
    model: 'llama3.1',
    apiUrl: 'http://localhost:11434/v1/chat/completions',
    apiKeyHint: 'Usually empty for local Ollama.',
  },
  sambanova: {
    label: 'SambaNova Cloud (free tier)',
    model: 'Meta-Llama-3.3-70B-Instruct',
    apiUrl: 'https://api.sambanova.ai/v1/chat/completions',
    apiKeyHint: 'Get your key from cloud.sambanova.ai.',
  },
  github: {
    label: 'GitHub Models (free tier)',
    model: 'meta-llama-3.3-70b-instruct',
    apiUrl: 'https://models.inference.ai.azure.com/chat/completions',
    apiKeyHint: 'Use a GitHub Personal Access Token.',
  },
};

interface SettingsPanelProps {
  value: AiSettings;
  onChange: (settings: AiSettings) => void;
}

const defaultModels: Record<AiSettings['provider'], string> = {
  openai: 'gpt-4o-mini',
  openrouter: 'meta-llama/llama-3.3-70b-instruct:free',
  gemini: 'gemini-1.5-flash',
  custom: '',
};

function findActivePreset(value: AiSettings): Preset | null {
  if (value.provider !== 'custom') return null;
  return (
    Object.values(presets).find(
      (preset) => preset.model === value.model && preset.apiUrl === value.apiUrl
    ) ?? null
  );
}

export default function SettingsPanel({ value, onChange }: SettingsPanelProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const activePreset = findActivePreset(value);

  useOnClickOutside(panelRef, () => setIsOpen(false));

  const handleChange = (field: keyof AiSettings, newValue: string) => {
    const next = { ...value, [field]: field === 'apiKey' ? newValue.trim() : newValue };
    if (field === 'provider') {
      next.model = defaultModels[next.provider];
    }
    onChange(next);
  };

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
              <input
                type="text"
                value={value.model}
                onChange={(e) => handleChange('model', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder={
                  value.provider === 'gemini'
                    ? (t('geminiModelPlaceholder') as string)
                    : (t('modelPlaceholder') as string)
                }
              />
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
                            apiKey: '',
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

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {t('apiKey') as string}
              </label>
              <input
                type="password"
                value={value.apiKey}
                onChange={(e) => handleChange('apiKey', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder={
                  value.provider === 'gemini'
                    ? (t('geminiApiKeyPlaceholder') as string)
                    : (t('apiKeyPlaceholder') as string)
                }
              />
              <p className="text-xs text-gray-500 mt-1">
                {value.provider === 'gemini'
                  ? (t('geminiApiKeyHint') as string)
                  : activePreset
                    ? activePreset.apiKeyHint
                    : (t('apiKeyHint') as string)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

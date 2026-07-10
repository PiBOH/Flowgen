'use client';

import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Settings } from 'lucide-react';
import { AiSettings } from '@/lib/types';
import { useOnClickOutside } from '@/hooks/useOnClickOutside';

interface SettingsPanelProps {
  value: AiSettings;
  onChange: (settings: AiSettings) => void;
}

const defaultModels: Record<AiSettings['provider'], string> = {
  openai: 'gpt-4o-mini',
  openrouter: 'meta-llama/llama-3.3-70b-instruct:free',
  custom: '',
};

export default function SettingsPanel({ value, onChange }: SettingsPanelProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(panelRef, () => setIsOpen(false));

  const handleChange = (field: keyof AiSettings, newValue: string) => {
    const next = { ...value, [field]: newValue };
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
        <div id="settings-panel" className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50">
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
                <option value="custom">Custom</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {t('model') as string}
              </label>
              <input
                type="text"
                value={value.model}
                onChange={(e) => handleChange('model', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder={t('modelPlaceholder') as string}
              />
            </div>

            {value.provider === 'custom' && (
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
                placeholder={t('apiKeyPlaceholder') as string}
              />
              <p className="text-xs text-gray-500 mt-1">{t('apiKeyHint') as string}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

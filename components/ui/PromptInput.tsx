'use client';

import { useTranslation } from 'react-i18next';
import { Sparkles, BookOpen } from 'lucide-react';

interface PromptInputProps {
  prompt: string;
  onPromptChange: (prompt: string) => void;
  onGenerate: (prompt: string) => void;
  onLoadExample: () => void;
  loading: boolean;
}

export default function PromptInput({
  prompt,
  onPromptChange,
  onGenerate,
  onLoadExample,
  loading,
}: PromptInputProps) {
  const { t } = useTranslation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    onGenerate(prompt.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-full">
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value)}
          placeholder={t('promptPlaceholder') as string}
          className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !prompt.trim()}
          className="px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-300 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <Sparkles size={18} />
          {loading ? t('generating') : t('generate')}
        </button>
      </div>
      <div className="flex justify-start">
        <button
          type="button"
          onClick={onLoadExample}
          disabled={loading}
          className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1 transition-colors"
        >
          <BookOpen size={16} />
          {t('loadExample') as string}
        </button>
      </div>
    </form>
  );
}

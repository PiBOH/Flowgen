'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Info } from 'lucide-react';
import { appInfo } from '@/lib/appInfo';
import { useOnClickOutside } from '@/hooks/useOnClickOutside';

export default function AppInfo() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(panelRef, () => setIsOpen(false));

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return (
    <div ref={panelRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
        title={t('info') as string}
        aria-label={t('info') as string}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-controls="app-info-panel"
      >
        <Info size={20} />
      </button>

      {isOpen && (
        <div
          id="app-info-panel"
          className="absolute left-0 right-0 sm:left-auto sm:right-0 top-full mt-2 w-full sm:w-64 max-w-[calc(100vw-1rem)] bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50"
        >
          <h3 className="text-sm font-semibold text-gray-900 mb-3">
            {t('info') as string}
          </h3>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-600">{t('version') as string}</dt>
              <dd className="font-medium text-gray-900">{appInfo.version}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">{t('author') as string}</dt>
              <dd className="font-medium text-gray-900">{appInfo.author}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">{t('license') as string}</dt>
              <dd className="font-medium text-gray-900">{appInfo.license}</dd>
            </div>
            <div className="pt-1">
              <dt className="text-gray-600 mb-1">{t('repository') as string}</dt>
              <dd className="break-all">
                <a
                  href={appInfo.repository}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-700 hover:underline"
                >
                  {appInfo.repository}
                </a>
              </dd>
            </div>
          </dl>
        </div>
      )}
    </div>
  );
}

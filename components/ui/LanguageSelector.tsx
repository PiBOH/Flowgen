'use client';

import { useTranslation } from 'react-i18next';

const languages = [
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'Français' },
  { code: 'es', label: 'Español' },
  { code: 'de', label: 'Deutsch' },
  { code: 'it', label: 'Italiano' },
];

export default function LanguageSelector() {
  const { i18n, t } = useTranslation();

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="language" className="text-sm font-medium text-gray-700">
        {t('language')}
      </label>
      <select
        id="language"
        value={i18n.language}
        onChange={(e) => i18n.changeLanguage(e.target.value)}
        className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.label}
          </option>
        ))}
      </select>
    </div>
  );
}

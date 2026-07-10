'use client';

import { useRef } from 'react';
import { initI18n } from './config';

export default function I18nProvider({ children }: { children: React.ReactNode }) {
  const initialized = useRef(false);

  if (!initialized.current) {
    initI18n();
    initialized.current = true;
  }

  return <>{children}</>;
}

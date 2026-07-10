'use client';

import { useEffect } from 'react';
import i18n from '../i18n/config';

export function useI18n() {
  useEffect(() => {
    // i18next is already initialized in config.ts
  }, []);

  return i18n;
}

export function changeLanguage(lng: string) {
  return i18n.changeLanguage(lng);
}

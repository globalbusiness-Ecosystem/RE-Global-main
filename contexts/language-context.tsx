'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { NavLanguage } from '@/lib/nav-i18n';
import { pickLanguage } from '@/lib/detect-language';

const NAV_LANG_KEY = 're_nav_language';

interface LanguageContextValue {
  language: NavLanguage;
  setLanguage: (lang: NavLanguage) => void;
  isRtl: boolean;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<NavLanguage>('en');

  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = localStorage.getItem(NAV_LANG_KEY);
    } catch {}
    const langs = typeof navigator !== 'undefined' ? (navigator.languages?.length ? navigator.languages : [navigator.language]) : [];
    setLanguageState(pickLanguage(stored, langs.filter(Boolean)));
  }, []);

  const setLanguage = (lang: NavLanguage) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(NAV_LANG_KEY, lang);
    } catch {}
  };

  const isRtl = language === 'ar' || language === 'ur';

  useEffect(() => {
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
  }, [isRtl]);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, isRtl }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used inside LanguageProvider');
  return ctx;
}

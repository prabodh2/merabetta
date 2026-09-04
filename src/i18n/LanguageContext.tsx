'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import translations, { Language, Translations } from './translations';

const LANG_STORAGE_KEY = 'merabetta_lang';

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextValue>({
  language: 'en',
  setLanguage: () => {},
  t: translations.en,
});

/** Detect the best initial language from the browser locale. */
function detectLanguage(): Language {
  if (typeof window === 'undefined') return 'en';

  // 1. Check persisted preference first
  const stored = localStorage.getItem(LANG_STORAGE_KEY) as Language | null;
  if (stored && ['en', 'mr', 'hi'].includes(stored)) return stored;

  // 2. Auto-detect from browser locale
  const locale = navigator.language || '';
  if (locale.startsWith('mr')) return 'mr';
  if (locale.startsWith('hi')) return 'hi';

  return 'en';
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  // Hydrate language from browser on client only (avoids SSR mismatch)
  useEffect(() => {
    setLanguageState(detectLanguage());
  }, []);

  // Update <html lang> attribute and localStorage on change
  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(LANG_STORAGE_KEY, lang);
    } catch {
      // Ignore quota errors
    }
    // Update the html lang attribute for accessibility & SEO
    document.documentElement.lang = lang === 'mr' ? 'mr' : lang === 'hi' ? 'hi' : 'en';
  }, []);

  const t = translations[language] as Translations;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

/** Primary hook to access translations and language state */
export function useLanguage(): LanguageContextValue {
  return useContext(LanguageContext);
}

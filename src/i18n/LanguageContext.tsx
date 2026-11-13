'use client';

import React, { createContext, useContext, useEffect, useCallback, useSyncExternalStore } from 'react';
import translations, { Language, Translations } from './translations';

const LANG_STORAGE_KEY = 'merabetta_lang';
const LANG_CHANGE_EVENT = 'merabetta-lang-change';

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

  try {
    // 1. Check persisted preference first
    const stored = localStorage.getItem(LANG_STORAGE_KEY) as Language | null;
    if (stored && ['en', 'mr', 'hi'].includes(stored)) return stored;
  } catch {
    // Ignore storage access errors
  }

  // 2. Auto-detect from browser locale
  const locale = navigator.language || '';
  if (locale.startsWith('mr')) return 'mr';
  if (locale.startsWith('hi')) return 'hi';

  return 'en';
}

function subscribeLanguage(callback: () => void) {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener(LANG_CHANGE_EVENT, callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener(LANG_CHANGE_EVENT, callback);
    window.removeEventListener('storage', callback);
  };
}

function getServerLanguageSnapshot(): Language {
  return 'en';
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const language = useSyncExternalStore(
    subscribeLanguage,
    detectLanguage,
    getServerLanguageSnapshot
  );

  // Sync <html lang> attribute whenever language changes
  useEffect(() => {
    document.documentElement.lang = language === 'mr' ? 'mr' : language === 'hi' ? 'hi' : 'en';
  }, [language]);

  // Update localStorage and notify subscribers on change
  const setLanguage = useCallback((lang: Language) => {
    try {
      localStorage.setItem(LANG_STORAGE_KEY, lang);
      window.dispatchEvent(new Event(LANG_CHANGE_EVENT));
    } catch {
      // Ignore quota errors
    }
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

/* eslint-disable react-refresh/only-export-components -- provider + its hooks live together on purpose */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import es from './es.json';
import en from './en.json';

const dictionaries = { es, en };
const DEFAULT_LANG = 'es';
const STORAGE_KEY = 'lang';

// localStorage can throw (private mode, blocked site data) or hold a stale value.
const readStoredLang = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored in dictionaries ? stored : DEFAULT_LANG;
  } catch {
    return DEFAULT_LANG;
  }
};

const LanguageContext = createContext({
  lang: DEFAULT_LANG,
  dict: dictionaries[DEFAULT_LANG],
  setLang: () => {}
});

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(readStoredLang);
  const dict = dictionaries[lang] ?? dictionaries[DEFAULT_LANG];

  useEffect(() => {
    // Keep <html lang> in sync so screen readers pronounce the content correctly.
    document.documentElement.lang = lang;
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // Storage unavailable: the choice just won't persist.
    }
  }, [lang]);

  const value = useMemo(() => ({ lang, dict, setLang }), [lang, dict]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => useContext(LanguageContext);

export const useT = () => {
  const { dict } = useLanguage();
  return useCallback(
    (key) => key.split('.').reduce((acc, part) => acc?.[part], dict) ?? key,
    [dict]
  );
};

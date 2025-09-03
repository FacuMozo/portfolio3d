import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import es from './es.json';
import en from './en.json';

const dictionaries = { es, en };

const LanguageContext = createContext({
  lang: 'es',
  dict: es,
  setLang: () => {}
});

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => localStorage.getItem('lang') || 'es');
  const [dict, setDict] = useState(dictionaries[lang]);

  useEffect(() => {
    setDict(dictionaries[lang] || es);
    localStorage.setItem('lang', lang);
  }, [lang]);

  const value = { lang, dict, setLang };
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => useContext(LanguageContext);

export const useT = () => {
  const { dict } = useLanguage();
  return useCallback((key) => {
    return key.split('.').reduce((acc, part) => acc && acc[part], dict) || key;
  }, [dict]);
};

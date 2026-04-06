import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import i18n from '../i18n';
import { defaultLanguages } from '../data/fallbackTranslations';

const LanguageContext = createContext(null);
const STORAGE_KEY = 'pharmacy_language';
const DEFAULT_LANGUAGE = 'fr';

const normalizeLanguage = (language) => {
  const shortCode = (language || DEFAULT_LANGUAGE).toLowerCase().slice(0, 2);
  return defaultLanguages.some((item) => item.code === shortCode) ? shortCode : DEFAULT_LANGUAGE;
};

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState(() => normalizeLanguage(localStorage.getItem(STORAGE_KEY) || i18n.language));

  useEffect(() => {
    const handleLanguageChanged = (language) => {
      setCurrentLanguage(normalizeLanguage(language));
    };

    i18n.on('languageChanged', handleLanguageChanged);
    return () => i18n.off('languageChanged', handleLanguageChanged);
  }, []);

  useEffect(() => {
    const normalizedLanguage = normalizeLanguage(currentLanguage);
    const isRTL = normalizedLanguage === 'ar';

    localStorage.setItem(STORAGE_KEY, normalizedLanguage);

    if (i18n.language !== normalizedLanguage) {
      i18n.changeLanguage(normalizedLanguage);
    }

    document.documentElement.lang = normalizedLanguage;
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.body.dir = isRTL ? 'rtl' : 'ltr';
  }, [currentLanguage]);

  const setLanguage = useCallback((language) => {
    setCurrentLanguage(normalizeLanguage(language));
  }, []);

  const t = useCallback((key, fallback = '') => {
    const translated = i18n.t(key);
    return translated === key ? fallback || key : translated;
  }, []);

  const isRTL = currentLanguage === 'ar';
  const translations = useMemo(() => i18n.getDataByLanguage(currentLanguage)?.translation || {}, [currentLanguage]);

  const value = useMemo(
    () => ({
      currentLanguage,
      setLanguage,
      languages: defaultLanguages,
      translations,
      t,
      isRTL,
    }),
    [currentLanguage, isRTL, setLanguage, t, translations],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }

  return context;
};

import { useLanguage } from '../context/LanguageContext';

export const useTranslation = () => {
  const { t, currentLanguage, setLanguage, languages, isRTL } = useLanguage();

  return {
    t,
    currentLanguage,
    setLanguage,
    languages,
    isRTL,
  };
};

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import fr from './locales/fr.json';
import en from './locales/en.json';
import ar from './locales/ar.json';
import { fallbackTranslations } from './data/fallbackTranslations';

const STORAGE_KEY = 'pharmacy_language';

const resources = {
  fr: { translation: { ...(fallbackTranslations.fr || {}), ...fr } },
  en: { translation: { ...(fallbackTranslations.en || {}), ...en } },
  ar: { translation: { ...(fallbackTranslations.ar || {}), ...ar } },
};

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources,
    lng: localStorage.getItem(STORAGE_KEY) || 'fr',
    fallbackLng: 'fr',
    interpolation: {
      escapeValue: false,
    },
    keySeparator: false,
    returnNull: false,
  });
}

export default i18n;

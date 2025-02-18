import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

import translationEN from './locales/en/translation.json';
import translationES from './locales/es/translation.json';
import translationSV from './locales/sv/translation.json';

const languageDetector = {
  type: 'languageDetector' as 'languageDetector',
  async: true,
  detect: (cb: (lang: string) => void) => {
    const locales = Localization.getLocales();
    const locale = locales[0]?.languageTag || 'en'; 
    console.log("idioma del dispositivo", locale);
    
    cb(locale);
  },
  init: () => {},
  cacheUserLanguage: () => {},
};

const resources = {
  en: { translation: translationEN },
  es: { translation: translationES },
  sv: { translation: translationSV }, 
};

i18n
  .use(initReactI18next)
  .use(languageDetector)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  });

export default i18n;

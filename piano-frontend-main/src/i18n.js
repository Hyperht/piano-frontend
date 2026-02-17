
import kk_loc from './locales/kk.js';
import en_loc from './locales/en.json';
import ar_loc from './locales/ar.json';

const initialLocale =
  localStorage.getItem('lang') ||
  (navigator && navigator.language && navigator.language.split('-')[0]) ||
  'en';

const i18n = createI18n({
  legacy: false,
  locale: initialLocale,
  fallbackLocale: 'en',
  warnHtmlInMessage: 'off',
  messages: {
    kk: kk_loc,
    en: en_loc,
    ar: ar_loc,
  },
});

export default i18n;
import { createI18n } from 'vue-i18n';

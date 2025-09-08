import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Dynamic translation loading - only EN, IT, ES
const loadTranslations = async () => {
  const translations = await Promise.all([
    import('./translations/en.json').then(module => ({ lang: 'en', data: module.default })),
    import('./translations/it.json').then(module => ({ lang: 'it', data: module.default })),
    import('./translations/es.json').then(module => ({ lang: 'es', data: module.default }))
  ]);

  const resources: any = {};
  translations.forEach(({ lang, data }) => {
    resources[lang] = { translation: data };
  });

  return resources;
};

// Initialize i18n
i18n
  .use(initReactI18next)
  .use(LanguageDetector)
  .init({
    resources: {
      // Fallback resources structure
      en: {
        translation: {
          "nav.professionals": "Professionals",
          "nav.projects": "Projects",
          "nav.companies": "Companies",
          "nav.messages": "Messages",
          "nav.profile": "Profile",
          "projects.title": "Projects",
          "projects.pageTitle": "Browse IT Projects",
          "projects.pageDescription": "Discover exciting IT projects and freelance opportunities.",
          "projects.postProject": "Post Project",
          "home.welcome": "Welcome to VibeSync",
          "home.subtitle": "Connect with top IT professionals and discover amazing projects",
          "language.select": "Select Language",
          "language.english": "English",
          "language.spanish": "Spanish",
          "language.italian": "Italian"
        }
      }
    },
    lng: 'en', // default language
    fallbackLng: 'en',
    debug: false,
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    }
  });

// Load and add translations dynamically
loadTranslations().then(resources => {
  Object.keys(resources).forEach(lang => {
    i18n.addResourceBundle(lang, 'translation', resources[lang].translation, true, true);
  });
});

export default i18n;
import en from '../locales/en.ts';
import ru from '../locales/ru.ts';
import fr from '../locales/fr.ts';
import { DEFAULT_UI_LANGUAGE } from '../core/constants';

const translations: Record<string, Record<string, string>> = {
  en,
  ru,
  fr,
};

export type TranslateFunction = (
  key: string,
  replacements?: Record<string, string | number>,
) => string;

export const getTranslationsForLang = (lang: string): Record<string, string> => {
  return translations[lang] || translations[DEFAULT_UI_LANGUAGE];
};

export const translate = (
  lang: string,
  key: string,
  replacements?: Record<string, string | number>,
): string => {
  const langTranslations = getTranslationsForLang(lang);
  let translation = langTranslations[key] || key;

  if (replacements) {
    Object.keys(replacements).forEach(placeholder => {
      translation = translation.replace(
        new RegExp(`{${placeholder}}`, 'g'),
        String(replacements[placeholder]),
      );
    });
  }
  return translation;
};

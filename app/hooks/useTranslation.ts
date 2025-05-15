import { useLanguage } from '../contexts/LanguageContext';
import enMessages from '../../messages/en.json';
import koMessages from '../../messages/ko.json';

const messages = {
  en: enMessages,
  ko: koMessages,
};

type TranslationParams = Record<string, string | number>;

type TranslationValue =
  | string
  | {
      [key: string]: TranslationValue;
    };

export function useTranslation() {
  const { language } = useLanguage();

  const t = (key: string, params?: TranslationParams) => {
    const keys = key.split('.');
    let value: TranslationValue = messages[language];

    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        return key;
      }
    }

    if (!value || typeof value !== 'string') return key;

    if (params) {
      return Object.entries(params).reduce((str, [key, val]) => {
        return str.replace(`{${key}}`, String(val));
      }, value);
    }

    return value;
  };

  return { t, language };
}

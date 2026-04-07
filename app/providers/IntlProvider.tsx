'use client';

import { NextIntlClientProvider } from 'next-intl';
import { useState, createContext, useContext, useCallback } from 'react';
import en from '@/messages/en.json';
import ko from '@/messages/ko.json';

const messagesMap = { en, ko } as const;
type Locale = keyof typeof messagesMap;

function getInitialLocale(): Locale {
  if (typeof window === 'undefined') return 'en';
  const stored = localStorage.getItem('locale') as Locale | null;
  return stored && stored in messagesMap ? stored : 'en';
}

const LocaleContext = createContext<{
  locale: Locale;
  setLocale: (locale: Locale) => void;
}>({ locale: 'en', setLocale: () => {} });

export function useLocaleSwitch() {
  return useContext(LocaleContext);
}

export default function IntlProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale);

  const setLocale = useCallback((newLocale: Locale) => {
    localStorage.setItem('locale', newLocale);
    setLocaleState(newLocale);
  }, []);

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      <NextIntlClientProvider locale={locale} messages={messagesMap[locale]}>
        {children}
      </NextIntlClientProvider>
    </LocaleContext.Provider>
  );
}

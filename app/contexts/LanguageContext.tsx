'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Language = 'en' | 'ko';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    // 브라우저의 언어 설정을 가져옵니다
    const browserLang = navigator.language.split('-')[0];
    // 저장된 언어 설정이 있으면 그것을 사용하고, 없으면 브라우저 언어를 사용합니다
    const savedLang = localStorage.getItem('language') as Language;
    const initialLang = savedLang || (browserLang === 'ko' ? 'ko' : 'en');
    setLanguage(initialLang);
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

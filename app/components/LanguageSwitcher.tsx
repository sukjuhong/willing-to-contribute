'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/routing';
import { useState, useRef, useEffect } from 'react';
import { FaGlobe } from 'react-icons/fa';
import { BsChevronDown } from 'react-icons/bs';

type Language = 'en' | 'ko';

interface LanguageOption {
  code: Language;
  name: string;
}

export default function LanguageSwitcher() {
  const locale = useLocale() as Language;
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const languages: LanguageOption[] = [
    { code: 'en', name: 'English' },
    { code: 'ko', name: '한국어' },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-1.5 text-sm rounded-md transition-colors text-gray-400 hover:text-gray-200 hover:bg-gray-800"
      >
        <FaGlobe className="w-4 h-4" />
        <span>{languages.find(lang => lang.code === locale)?.name}</span>
        <BsChevronDown
          className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-[#161b22] border border-gray-700 rounded-md py-1 z-10">
          {languages.map(lang => (
            <button
              key={lang.code}
              onClick={() => {
                router.replace(pathname, { locale: lang.code });
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2 text-sm ${
                locale === lang.code
                  ? 'bg-cyan-500/10 text-cyan-400'
                  : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              {lang.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

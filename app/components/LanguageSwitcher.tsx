'use client';

import { useLocaleSwitch } from '@/app/providers/IntlProvider';
import { FaGlobe } from 'react-icons/fa';
import { BsChevronDown } from 'react-icons/bs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type Language = 'en' | 'ko';

interface LanguageOption {
  code: Language;
  name: string;
}

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLocaleSwitch();

  const languages: LanguageOption[] = [
    { code: 'en', name: 'English' },
    { code: 'ko', name: '한국어' },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center space-x-2 px-3 py-1.5 text-sm rounded-md transition-colors text-muted-foreground hover:text-foreground hover:bg-accent">
        <FaGlobe className="w-4 h-4" />
        <span>{languages.find(lang => lang.code === locale)?.name}</span>
        <BsChevronDown className="w-3 h-3" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {languages.map(lang => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLocale(lang.code)}
            className={locale === lang.code ? 'bg-accent text-accent-foreground' : ''}
          >
            {lang.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

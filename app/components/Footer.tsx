'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
export default function Footer() {
  const t = useTranslations();

  return (
    <footer className="bg-background border-t border-border py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center space-y-4 sm:flex-row sm:justify-between sm:space-y-0">
          <p className="text-muted-foreground text-sm">
            {t('footer.copyright', { year: new Date().getFullYear() })}
          </p>
          <nav className="flex flex-col items-center space-y-2 sm:flex-row sm:space-y-0 sm:space-x-6">
            <Link
              href="/about"
              className="text-muted-foreground hover:text-primary transition-colors text-sm"
            >
              {t('footer.about')}
            </Link>
            <Link
              href="/privacy"
              className="text-muted-foreground hover:text-primary transition-colors text-sm"
            >
              {t('footer.privacy')}
            </Link>
            <Link
              href="/terms"
              className="text-muted-foreground hover:text-primary transition-colors text-sm"
            >
              {t('footer.terms')}
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}

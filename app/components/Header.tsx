import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { GithubAuthState } from '../types';
import { FaGithub, FaSignOutAlt, FaCode } from 'react-icons/fa';
import LanguageSwitcher from './LanguageSwitcher';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  authState: GithubAuthState;
  onAppLogin?: () => void;
  onLogout: () => void;
  showAppLogin?: boolean;
}

const Header: React.FC<HeaderProps> = ({
  authState,
  onAppLogin,
  onLogout,
  showAppLogin = false,
}) => {
  const repoUrl = 'https://github.com/sukjuhong/pickssue';
  const t = useTranslations();

  return (
    <header className="bg-card border-b border-border py-4 px-6">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Link
            href="/"
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
            aria-label={t('common.welcome')}
          >
            <Image
              src="/logo.png"
              alt="Pickssue logo"
              width={32}
              height={32}
              priority
              className="dark:invert"
            />
            <h1 className="text-2xl font-bold text-foreground font-mono">
              {t('common.welcome')}
            </h1>
          </Link>
          <span className="bg-primary/10 text-primary border border-primary/20 font-mono text-xs px-2 py-0.5 rounded">
            {t('common.beta')}
          </span>
          <Button
            asChild
            variant="outline"
            size="sm"
            className="flex items-center space-x-1"
          >
            <a
              href={repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t('common.viewOnGithub')}
              title={t('common.viewOnGithub')}
            >
              <FaCode className="text-lg" />
              <span className="hidden md:inline-block">Source</span>
            </a>
          </Button>
        </div>

        <div className="flex items-center space-x-4">
          <LanguageSwitcher />
          {authState.isLoggedIn ? (
            <div className="flex items-center space-x-4">
              {authState.user && (
                <div className="flex items-center space-x-2">
                  <div className="relative w-8 h-8 rounded-full overflow-hidden">
                    <Image
                      src={authState.user.avatarUrl}
                      alt={`${authState.user.login}'s avatar`}
                      width={32}
                      height={32}
                      className="rounded-full"
                      priority
                    />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground hidden md:inline-block">
                    {authState.user.login}
                  </span>
                </div>
              )}
              <Button
                onClick={onLogout}
                variant="outline"
                size="sm"
                className="flex items-center space-x-1"
                aria-label={t('common.logout')}
              >
                <FaSignOutAlt />
                <span className="hidden md:inline-block">{t('common.logout')}</span>
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              {showAppLogin && onAppLogin && (
                <Button onClick={onAppLogin} className="flex items-center space-x-2">
                  <FaGithub className="text-lg" />
                  <span>{t('common.loginWithGithub')}</span>
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

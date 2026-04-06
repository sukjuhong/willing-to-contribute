import React from 'react';
import Image from 'next/image';
import { GithubAuthState } from '../types';
import { FaGithub, FaSignOutAlt, FaCode } from 'react-icons/fa';
import LanguageSwitcher from './LanguageSwitcher';
import { useTranslations } from 'next-intl';

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
  const repoUrl = 'https://github.com/sukjuhong/contrifit';
  const t = useTranslations();

  return (
    <header className="bg-[#161b22] border-b border-gray-700 py-4 px-6">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <h1 className="text-2xl font-bold text-gray-100 font-[family-name:var(--font-mono)]">
            <span className="text-gray-500">&gt;_</span> {t('common.welcome')}
          </h1>
          <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono text-xs px-2 py-0.5 rounded">
            {t('common.beta')}
          </span>
          <a
            href={repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1 bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-600 rounded-md px-3 py-1.5 transition-colors text-sm"
            title={t('common.viewOnGithub')}
          >
            <FaCode className="text-lg" />
            <span className="hidden md:inline-block">Source</span>
          </a>
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
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-300 hidden md:inline-block">
                    {authState.user.login}
                  </span>
                </div>
              )}
              <button
                onClick={onLogout}
                className="flex items-center space-x-1 bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-600 rounded-md px-3 py-1.5 transition-colors text-sm"
              >
                <FaSignOutAlt />
                <span className="hidden md:inline-block">{t('common.logout')}</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              {showAppLogin && onAppLogin && (
                <button
                  onClick={onAppLogin}
                  className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-md transition-colors"
                >
                  <FaGithub className="text-lg" />
                  <span>{t('common.loginWithGithub')}</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

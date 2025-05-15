import React from 'react';
import Image from 'next/image';
import { GithubAuthState } from '../types';
import { FaGithub, FaSignOutAlt, FaCode } from 'react-icons/fa';
import LanguageSwitcher from './LanguageSwitcher';
import { useTranslation } from '../hooks/useTranslation';

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
  const repoUrl = 'https://github.com/sukjuhong/willing-to-contribute';
  const { t } = useTranslation();

  return (
    <header className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 px-6 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <h1 className="text-2xl font-bold">{t('common.welcome')}</h1>
          <span className="bg-white text-indigo-600 text-xs font-semibold px-2.5 py-0.5 rounded-full">
            BETA
          </span>
          <a
            href={repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1 bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-md transition-colors text-sm"
            title="View on GitHub"
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
                  <span className="text-sm font-medium hidden md:inline-block">
                    {authState.user.login}
                  </span>
                </div>
              )}
              <button
                onClick={onLogout}
                className="flex items-center space-x-1 bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-md transition-colors text-sm"
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
                  className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors"
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

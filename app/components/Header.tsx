import React from 'react';
import { GithubAuthState } from '../types';
import { FaGithub, FaSignOutAlt } from 'react-icons/fa';

interface HeaderProps {
  authState: GithubAuthState;
  onLogin: () => void;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ authState, onLogin, onLogout }) => {
  return (
    <header className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 px-6 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <h1 className="text-2xl font-bold">Willing to Contribute</h1>
          <span className="bg-white text-indigo-600 text-xs font-semibold px-2.5 py-0.5 rounded-full">
            BETA
          </span>
        </div>
        
        <div>
          {authState.isLoggedIn ? (
            <div className="flex items-center space-x-4">
              {authState.user && (
                <div className="flex items-center space-x-2">
                  <img 
                    src={authState.user.avatarUrl} 
                    alt={`${authState.user.login}'s avatar`} 
                    className="w-8 h-8 rounded-full"
                  />
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
                <span className="hidden md:inline-block">Logout</span>
              </button>
            </div>
          ) : (
            <button
              onClick={onLogin}
              className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-md transition-colors"
            >
              <FaGithub className="text-lg" />
              <span>Login with GitHub</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header; 
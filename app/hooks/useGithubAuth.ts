import { useState, useEffect, useCallback } from 'react';
import { Octokit } from '@octokit/rest';
import { GithubAuthState } from '../types';
import { saveAuthToken, loadAuthToken, clearAuthToken } from '../utils/localStorage';

// GitHub App configuration
const GITHUB_APP_CLIENT_ID = process.env.NEXT_PUBLIC_GITHUB_APP_CLIENT_ID || '';
const GITHUB_APP_REDIRECT_URI = process.env.NEXT_PUBLIC_GITHUB_APP_REDIRECT_URI || '';

const useGithubAuth = (): {
  authState: GithubAuthState;
  login: () => void;
  logout: () => void;
  handleCallback: (code: string, installationId?: string) => Promise<boolean>;
} => {
  const [authState, setAuthState] = useState<GithubAuthState>({
    isLoggedIn: false,
    isAppAuth: true,
  });

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const token = loadAuthToken();

      if (token) {
        try {
          const octokit = new Octokit({ auth: token });
          const { data } = await octokit.users.getAuthenticated();

          setAuthState({
            isLoggedIn: true,
            isAppAuth: true,
            token,
            user: {
              login: data.login,
              avatarUrl: data.avatar_url,
            },
          });
        } catch (error) {
          console.error('Error validating GitHub token:', error);
          clearAuthToken();
          setAuthState({ isLoggedIn: false, isAppAuth: true });
        }
      }
    };

    initializeAuth();
  }, []);

  // Handle GitHub redirect with code
  const handleCallback = useCallback(
    async (code: string, installationId?: string): Promise<boolean> => {
      try {
        // Exchange the code for a token using the GitHub App auth endpoint
        const response = await fetch('/api/github/app-auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code,
            installation_id: installationId,
          }),
        });

        const data = await response.json();

        if (!data.access_token) {
          throw new Error('Failed to get access token');
        }

        const token = data.access_token;
        saveAuthToken(token);

        // Get user info with token
        const octokit = new Octokit({ auth: token });
        const userResponse = await octokit.users.getAuthenticated();

        setAuthState({
          isLoggedIn: true,
          isAppAuth: true,
          token,
          user: {
            login: userResponse.data.login,
            avatarUrl: userResponse.data.avatar_url,
          },
          installationToken: data.installation_token,
        });

        return true;
      } catch (error) {
        console.error('Error handling GitHub App callback:', error);
        return false;
      }
    },
    [],
  );

  // Initiate login flow
  const login = useCallback(() => {
    // GitHub App OAuth login flow - redirect to GitHub authorization page
    const authUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_APP_CLIENT_ID}&redirect_uri=${GITHUB_APP_REDIRECT_URI}`;
    window.location.href = authUrl;
  }, []);

  // Logout
  const logout = useCallback(() => {
    clearAuthToken();
    setAuthState({ isLoggedIn: false, isAppAuth: true });
  }, []);

  return { authState, login, logout, handleCallback };
};

export default useGithubAuth;

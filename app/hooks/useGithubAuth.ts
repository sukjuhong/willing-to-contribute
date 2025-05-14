import { useState, useEffect, useCallback } from 'react';
import { Octokit } from '@octokit/rest';
import { GithubAuthState } from '../types';
import { saveAuthToken, loadAuthToken, clearAuthToken } from '../utils/localStorage';

// GitHub OAuth app configuration
const GITHUB_CLIENT_ID = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID || '';
const GITHUB_REDIRECT_URI = process.env.NEXT_PUBLIC_GITHUB_REDIRECT_URI || '';

const useGithubAuth = (): {
  authState: GithubAuthState;
  login: () => void;
  logout: () => void;
  handleCallback: (code: string) => Promise<boolean>;
} => {
  const [authState, setAuthState] = useState<GithubAuthState>({
    isLoggedIn: false,
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
            token,
            user: {
              login: data.login,
              avatarUrl: data.avatar_url,
            },
          });
        } catch (error) {
          console.error('Error validating GitHub token:', error);
          clearAuthToken();
          setAuthState({ isLoggedIn: false });
        }
      }
    };
    
    initializeAuth();
  }, []);

  // Handle GitHub redirect with code
  const handleCallback = useCallback(async (code: string): Promise<boolean> => {
    try {
      // In a real app, you would exchange the code for a token using your backend
      // We're simplifying here for the demo - in practice, NEVER handle this in front-end
      // Create a small backend API or serverless function to handle the exchange

      // This is pseudo-code for demo purposes
      const response = await fetch('/api/github/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
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
        token,
        user: {
          login: userResponse.data.login,
          avatarUrl: userResponse.data.avatar_url,
        },
      });
      
      return true;
    } catch (error) {
      console.error('Error handling GitHub callback:', error);
      return false;
    }
  }, []);

  // Initiate login flow
  const login = useCallback(() => {
    // GitHub OAuth login flow - redirect to GitHub authorization page
    const authUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${GITHUB_REDIRECT_URI}&scope=gist,user`;
    window.location.href = authUrl;
  }, []);

  // Logout
  const logout = useCallback(() => {
    clearAuthToken();
    setAuthState({ isLoggedIn: false });
  }, []);

  return { authState, login, logout, handleCallback };
};

export default useGithubAuth; 
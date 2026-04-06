import { useState, useEffect, useCallback, useMemo } from 'react';
import { createClient } from '@/app/lib/supabase/client';
import { GithubAuthState } from '../types';
import { clearAllUserData } from '../utils/localStorage';

const PROVIDER_TOKEN_KEY = 'contrifit-provider-token';

const useSupabaseAuth = (): {
  authState: GithubAuthState;
  login: () => void;
  logout: () => Promise<void>;
} => {
  const [authState, setAuthState] = useState<GithubAuthState>({ isLoggedIn: false });
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    const buildAuthState = (
      userId: string,
      userMeta: Record<string, unknown>,
      providerToken: string | null | undefined,
    ): GithubAuthState => {
      // Persist provider_token when available (only present on initial login)
      if (providerToken) {
        sessionStorage.setItem(PROVIDER_TOKEN_KEY, providerToken);
      }
      const storedToken =
        providerToken || sessionStorage.getItem(PROVIDER_TOKEN_KEY) || undefined;

      return {
        isLoggedIn: true,
        userId,
        user: {
          login: (userMeta?.user_name as string) ?? '',
          avatarUrl: (userMeta?.avatar_url as string) ?? '',
        },
        accessToken: storedToken,
      };
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setAuthState(
          buildAuthState(
            session.user.id,
            session.user.user_metadata,
            session.provider_token,
          ),
        );
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setAuthState(
          buildAuthState(
            session.user.id,
            session.user.user_metadata,
            session.provider_token,
          ),
        );
      } else {
        sessionStorage.removeItem(PROVIDER_TOKEN_KEY);
        setAuthState({ isLoggedIn: false });
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const login = useCallback(() => {
    supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        scopes: 'read:user,repo',
        redirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });
  }, [supabase]);

  const logout = useCallback(async () => {
    sessionStorage.removeItem(PROVIDER_TOKEN_KEY);
    clearAllUserData();
    await supabase.auth.signOut();
  }, [supabase]);

  return { authState, login, logout };
};

export default useSupabaseAuth;

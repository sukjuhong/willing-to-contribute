import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/app/lib/supabase/client';
import { GithubAuthState } from '../types';

const useSupabaseAuth = (): {
  authState: GithubAuthState;
  login: () => void;
  logout: () => Promise<void>;
} => {
  const [authState, setAuthState] = useState<GithubAuthState>({ isLoggedIn: false });
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setAuthState({
          isLoggedIn: true,
          userId: session.user.id,
          user: {
            login: session.user.user_metadata?.user_name ?? '',
            avatarUrl: session.user.user_metadata?.avatar_url ?? '',
          },
          accessToken: session.provider_token ?? undefined,
        });
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setAuthState({
          isLoggedIn: true,
          userId: session.user.id,
          user: {
            login: session.user.user_metadata?.user_name ?? '',
            avatarUrl: session.user.user_metadata?.avatar_url ?? '',
          },
          accessToken: session.provider_token ?? undefined,
        });
      } else {
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
    await supabase.auth.signOut();
  }, [supabase]);

  return { authState, login, logout };
};

export default useSupabaseAuth;

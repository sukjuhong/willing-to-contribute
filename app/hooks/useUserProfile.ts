'use client';

import { useState, useEffect, useCallback } from 'react';

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export interface UserProfileData {
  username: string;
  top_languages: string[] | null;
  starred_categories: string[] | null;
  contributed_repos: string[] | null;
  last_synced_at: string | null;
}

export default function useUserProfile(isLoggedIn: boolean) {
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const syncProfile = useCallback(async () => {
    setProfileLoading(true);
    setProfileError(null);
    try {
      const res = await fetch('/api/profile/analyze', { method: 'POST' });
      if (!res.ok) throw new Error('Profile analysis failed');
      const data: UserProfileData = await res.json();
      setProfile(data);
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : 'Failed to sync profile');
    } finally {
      setProfileLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isLoggedIn) {
      setProfile(null);
      return;
    }

    fetch('/api/profile/analyze')
      .then(res => (res.ok ? res.json() : null))
      .then((data: UserProfileData | null) => {
        if (!data) {
          syncProfile();
          return;
        }
        setProfile(data);
        if (data.last_synced_at) {
          const age = Date.now() - new Date(data.last_synced_at).getTime();
          if (age > ONE_WEEK_MS) {
            syncProfile();
          }
        }
      })
      .catch(() => setProfileError('Failed to load profile'));
  }, [isLoggedIn, syncProfile]);

  return { profile, profileLoading, profileError, syncProfile };
}

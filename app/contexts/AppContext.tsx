'use client';

import React, { createContext, useContext, useEffect } from 'react';
import useSupabaseAuth from '../hooks/useSupabaseAuth';
import useSettings from '../hooks/useSettings';
import useIssues from '../hooks/useIssues';
import useRecommendedIssues from '../hooks/useRecommendedIssues';
import useUserProfile from '../hooks/useUserProfile';
import { checkNotificationPermission } from '../utils/notifications';

interface AppContextType {
  // Auth
  authState: ReturnType<typeof useSupabaseAuth>['authState'];
  login: ReturnType<typeof useSupabaseAuth>['login'];
  logout: ReturnType<typeof useSupabaseAuth>['logout'];

  // Settings
  settings: ReturnType<typeof useSettings>['settings'];
  settingsLoading: boolean;
  settingsError: string | null;
  addRepository: (repoUrl: string) => Promise<boolean>;
  removeRepository: (repoId: string) => Promise<void>;
  updateNotificationFrequency: ReturnType<
    typeof useSettings
  >['updateNotificationFrequency'];
  toggleCustomLabel: ReturnType<typeof useSettings>['toggleCustomLabel'];
  updateLastCheckedAt: ReturnType<typeof useSettings>['updateLastCheckedAt'];
  toggleHideClosedIssues: ReturnType<typeof useSettings>['toggleHideClosedIssues'];

  // Issues
  issues: ReturnType<typeof useIssues>['issues'];
  issuesLoading: boolean;
  issuesError: string | null;
  fetchIssues: ReturnType<typeof useIssues>['fetchIssues'];

  // Recommended Issues
  recommendedIssues: ReturnType<typeof useRecommendedIssues>['recommendedIssues'];
  recommendedLoading: boolean;
  recommendedError: string | null;
  languageFilter: string;
  changeLanguageFilter: ReturnType<typeof useRecommendedIssues>['changeLanguageFilter'];
  fetchRecommendedIssues: ReturnType<
    typeof useRecommendedIssues
  >['fetchRecommendedIssues'];

  // User Profile
  profile: ReturnType<typeof useUserProfile>['profile'];
  profileLoading: boolean;
  profileError: string | null;
  syncProfile: ReturnType<typeof useUserProfile>['syncProfile'];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  // Auth state via Supabase
  const { authState, login, logout } = useSupabaseAuth();

  // Settings state
  const {
    settings,
    loading: settingsLoading,
    error: settingsError,
    addRepository,
    removeRepository,
    updateNotificationFrequency,
    toggleCustomLabel,
    updateLastCheckedAt,
    toggleHideClosedIssues,
  } = useSettings(authState.isLoggedIn, authState.userId);

  // Issues state
  const {
    issues,
    loading: issuesLoading,
    error: issuesError,
    fetchIssues,
  } = useIssues(settings);

  // Recommended issues state
  const {
    recommendedIssues,
    recommendedLoading,
    recommendedError,
    languageFilter,
    changeLanguageFilter,
    fetchRecommendedIssues,
  } = useRecommendedIssues();

  // User profile state
  const { profile, profileLoading, profileError, syncProfile } = useUserProfile(
    authState.isLoggedIn,
  );

  // Request notification permission on mount
  useEffect(() => {
    checkNotificationPermission();
  }, []);

  // Fetch issues on mount and when settings change
  useEffect(() => {
    if (!settingsLoading) {
      fetchIssues(false);
    }
  }, [fetchIssues, settingsLoading]);

  // Fetch recommended issues on mount only (changeLanguageFilter handles re-fetch on filter change)
  useEffect(() => {
    fetchRecommendedIssues();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Setup periodic checks for new issues
  useEffect(() => {
    if (settings.notificationFrequency === 'never') {
      return;
    }

    let interval: NodeJS.Timeout;

    // Set interval based on notification frequency
    switch (settings.notificationFrequency) {
      case 'hourly':
        interval = setInterval(() => fetchIssues(true), 60 * 60 * 1000);
        break;
      case '6hours':
        interval = setInterval(() => fetchIssues(true), 6 * 60 * 60 * 1000);
        break;
      case 'daily':
        interval = setInterval(() => fetchIssues(true), 24 * 60 * 60 * 1000);
        break;
      default:
        break;
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [settings.notificationFrequency, fetchIssues]);

  const value: AppContextType = {
    authState,
    login,
    logout,
    settings,
    settingsLoading,
    settingsError,
    addRepository,
    removeRepository,
    updateNotificationFrequency,
    toggleCustomLabel,
    updateLastCheckedAt,
    toggleHideClosedIssues,
    issues,
    issuesLoading,
    issuesError,
    fetchIssues,
    recommendedIssues,
    recommendedLoading,
    recommendedError,
    languageFilter,
    changeLanguageFilter,
    fetchRecommendedIssues,
    profile,
    profileLoading,
    profileError,
    syncProfile,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

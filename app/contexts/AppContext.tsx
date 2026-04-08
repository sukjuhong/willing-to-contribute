'use client';

import React, { createContext, useContext, useEffect, useCallback } from 'react';
import useSupabaseAuth from '../hooks/useSupabaseAuth';
import useSettings from '../hooks/useSettings';
import usePickedIssues from '../hooks/usePickedIssues';
import type { StateChange } from '../hooks/usePickedIssues';
import useRecommendedIssues from '../hooks/useRecommendedIssues';
import useUserProfile from '../hooks/useUserProfile';
import { checkNotificationPermission } from '../utils/notifications';
import { migrateLocalStorageKeys } from '../utils/localStorage';
import { Issue } from '../types';

interface AppContextType {
  // Auth
  authState: ReturnType<typeof useSupabaseAuth>['authState'];
  login: ReturnType<typeof useSupabaseAuth>['login'];
  logout: ReturnType<typeof useSupabaseAuth>['logout'];

  // Settings
  settings: ReturnType<typeof useSettings>['settings'];
  settingsLoading: boolean;
  settingsError: string | null;
  pickIssue: (issue: Issue) => Promise<boolean>;
  unpickIssue: (issueId: string) => Promise<void>;
  updateIssueTags: (issueId: string, tags: string[]) => Promise<void>;
  updateNotificationFrequency: ReturnType<
    typeof useSettings
  >['updateNotificationFrequency'];
  toggleHideClosedIssues: ReturnType<typeof useSettings>['toggleHideClosedIssues'];

  // Picked Issues
  pickedIssues: ReturnType<typeof usePickedIssues>['pickedIssues'];
  pickedIssuesLoading: boolean;
  pickedIssuesError: string | null;
  refreshPickedIssues: () => Promise<StateChange[]>;

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
    pickIssue,
    unpickIssue,
    updateIssueTags,
    updateNotificationFrequency,
    toggleHideClosedIssues,
    updateLastCheckedAt,
    saveUserSettings,
  } = useSettings(authState.isLoggedIn, authState.userId);

  // Picked issues state — uses saveUserSettings for persistence (localStorage + Supabase)
  const {
    pickedIssues,
    loading: pickedIssuesLoading,
    error: pickedIssuesError,
    refreshPickedIssues: _refreshPickedIssues,
  } = usePickedIssues(settings, saveUserSettings, authState.accessToken);

  // Wrap refreshPickedIssues to show aggregated notifications
  const refreshPickedIssues = useCallback(async () => {
    const changes = await _refreshPickedIssues();

    if (changes.length > 0) {
      const hasPermission = await checkNotificationPermission();
      if (hasPermission) {
        const stateChanges = changes.filter(c => c.field === 'state');
        const assigneeChanges = changes.filter(c => c.field === 'assignee');

        const lines: string[] = [];
        if (stateChanges.length > 0) {
          const closed = stateChanges.filter(c => c.to === 'closed').length;
          const opened = stateChanges.filter(c => c.to === 'open').length;
          if (closed > 0) lines.push(`${closed} issue(s) closed`);
          if (opened > 0) lines.push(`${opened} issue(s) reopened`);
        }
        if (assigneeChanges.length > 0) {
          lines.push(`${assigneeChanges.length} issue(s) assignee changed`);
        }

        try {
          new Notification('Pickssue: Issue Updates', {
            body: lines.join(', '),
            icon: '/favicon.ico',
          });
        } catch {
          // Notification not supported
        }
      }

      await updateLastCheckedAt(new Date());
    }

    return changes;
  }, [_refreshPickedIssues, updateLastCheckedAt]);

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

  // Migrate legacy localStorage keys and request notification permission on mount
  useEffect(() => {
    migrateLocalStorageKeys();
    checkNotificationPermission();
  }, []);

  // Fetch recommended issues on mount only
  useEffect(() => {
    fetchRecommendedIssues();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Setup periodic checks for picked issue state changes
  useEffect(() => {
    if (settings.notificationFrequency === 'never') return;
    if (settings.pickedIssues.length === 0) return;

    let interval: NodeJS.Timeout;

    switch (settings.notificationFrequency) {
      case 'hourly':
        interval = setInterval(() => refreshPickedIssues(), 60 * 60 * 1000);
        break;
      case '6hours':
        interval = setInterval(() => refreshPickedIssues(), 6 * 60 * 60 * 1000);
        break;
      case 'daily':
        interval = setInterval(() => refreshPickedIssues(), 24 * 60 * 60 * 1000);
        break;
      default:
        break;
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [settings.notificationFrequency, settings.pickedIssues.length, refreshPickedIssues]);

  const value: AppContextType = {
    authState,
    login,
    logout,
    settings,
    settingsLoading,
    settingsError,
    pickIssue,
    unpickIssue,
    updateIssueTags,
    updateNotificationFrequency,
    toggleHideClosedIssues,
    pickedIssues,
    pickedIssuesLoading,
    pickedIssuesError,
    refreshPickedIssues,
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

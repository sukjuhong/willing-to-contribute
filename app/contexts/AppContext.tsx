'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import useSupabaseAuth from '../hooks/useSupabaseAuth';
import useSettings from '../hooks/useSettings';
import useSavedIssues from '../hooks/useSavedIssues';
import type { StateChange } from '../hooks/useSavedIssues';
import useRecommendedIssues from '../hooks/useRecommendedIssues';
import useUserProfile from '../hooks/useUserProfile';
import { checkNotificationPermission } from '../utils/notifications';
import { migrateLocalStorageKeys } from '../utils/localStorage';
import { UserSettings, Issue } from '../types';

interface AppContextType {
  // Auth
  authState: ReturnType<typeof useSupabaseAuth>['authState'];
  login: ReturnType<typeof useSupabaseAuth>['login'];
  logout: ReturnType<typeof useSupabaseAuth>['logout'];

  // Settings
  settings: ReturnType<typeof useSettings>['settings'];
  settingsLoading: boolean;
  settingsError: string | null;
  saveIssue: (issue: Issue) => Promise<boolean>;
  unsaveIssue: (issueId: string) => Promise<void>;
  updateIssueTags: (issueId: string, tags: string[]) => Promise<void>;
  updateNotificationFrequency: ReturnType<
    typeof useSettings
  >['updateNotificationFrequency'];
  toggleHideClosedIssues: ReturnType<typeof useSettings>['toggleHideClosedIssues'];

  // Saved Issues
  savedIssues: ReturnType<typeof useSavedIssues>['savedIssues'];
  savedIssuesLoading: boolean;
  savedIssuesError: string | null;
  refreshSavedIssues: () => Promise<StateChange[]>;

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
    saveIssue,
    unsaveIssue,
    updateIssueTags,
    updateNotificationFrequency,
    toggleHideClosedIssues,
    updateLastCheckedAt,
  } = useSettings(authState.isLoggedIn, authState.userId);

  // Internal settings state setter for useSavedIssues to update saved issue states
  const [settingsOverride, setSettingsOverride] = useState<UserSettings | null>(null);
  const effectiveSettings = settingsOverride ?? settings;

  // Sync override when settings change from useSettings
  useEffect(() => {
    setSettingsOverride(null);
  }, [settings]);

  const handleSetSettings = useCallback(
    (fn: (prev: UserSettings) => UserSettings) => {
      setSettingsOverride(prev => fn(prev ?? settings));
    },
    [settings],
  );

  // Saved issues state
  const {
    savedIssues,
    loading: savedIssuesLoading,
    error: savedIssuesError,
    refreshSavedIssues: _refreshSavedIssues,
  } = useSavedIssues(effectiveSettings, handleSetSettings, authState.accessToken);

  // Wrap refreshSavedIssues to also show notifications
  const refreshSavedIssues = useCallback(async () => {
    const changes = await _refreshSavedIssues();

    if (changes.length > 0) {
      const hasPermission = await checkNotificationPermission();
      if (hasPermission) {
        for (const change of changes) {
          const repo = `${change.issue.repository.owner}/${change.issue.repository.name}`;
          let message: string;
          if (change.field === 'state') {
            message = `Issue #${change.issue.number} in ${repo} was ${change.to}`;
          } else {
            message = change.to
              ? `Issue #${change.issue.number} in ${repo} was assigned to @${change.to}`
              : `Issue #${change.issue.number} in ${repo} was unassigned`;
          }

          try {
            new Notification(`Pickssue: ${repo}#${change.issue.number}`, {
              body: message,
              icon: '/favicon.ico',
            });
          } catch {
            // Notification not supported
          }
        }
      }

      await updateLastCheckedAt(new Date());
    }

    return changes;
  }, [_refreshSavedIssues, updateLastCheckedAt]);

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

  // Setup periodic checks for saved issue state changes
  useEffect(() => {
    if (settings.notificationFrequency === 'never') return;
    if (settings.savedIssues.length === 0) return;

    let interval: NodeJS.Timeout;

    switch (settings.notificationFrequency) {
      case 'hourly':
        interval = setInterval(() => refreshSavedIssues(), 60 * 60 * 1000);
        break;
      case '6hours':
        interval = setInterval(() => refreshSavedIssues(), 6 * 60 * 60 * 1000);
        break;
      case 'daily':
        interval = setInterval(() => refreshSavedIssues(), 24 * 60 * 60 * 1000);
        break;
      default:
        break;
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [settings.notificationFrequency, settings.savedIssues.length, refreshSavedIssues]);

  const value: AppContextType = {
    authState,
    login,
    logout,
    settings: effectiveSettings,
    settingsLoading,
    settingsError,
    saveIssue,
    unsaveIssue,
    updateIssueTags,
    updateNotificationFrequency,
    toggleHideClosedIssues,
    savedIssues,
    savedIssuesLoading,
    savedIssuesError,
    refreshSavedIssues,
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

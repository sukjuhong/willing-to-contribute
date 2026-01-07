'use client';

import React, { createContext, useContext, useEffect } from 'react';
import useGithubAuth from '../hooks/useGithubAuth';
import useSettings from '../hooks/useSettings';
import useIssues from '../hooks/useIssues';
import { checkNotificationPermission } from '../utils/notifications';

interface AppContextType {
  // Auth
  authState: ReturnType<typeof useGithubAuth>['authState'];
  login: ReturnType<typeof useGithubAuth>['login'];
  logout: ReturnType<typeof useGithubAuth>['logout'];

  // Settings
  settings: ReturnType<typeof useSettings>['settings'];
  settingsLoading: boolean;
  settingsError: string | null;
  showSyncModal: boolean;
  setShowSyncModal: (show: boolean) => void;
  handleSync: ReturnType<typeof useSettings>['handleSync'];
  addRepository: (repoUrl: string) => Promise<boolean>;
  removeRepository: (repoId: string) => Promise<void>;
  updateNotificationFrequency: ReturnType<
    typeof useSettings
  >['updateNotificationFrequency'];
  toggleCustomLabel: ReturnType<typeof useSettings>['toggleCustomLabel'];
  updateLastCheckedAt: ReturnType<typeof useSettings>['updateLastCheckedAt'];
  toggleHideClosedIssues: ReturnType<typeof useSettings>['toggleHideClosedIssues'];
  gistSettings: ReturnType<typeof useSettings>['gistSettings'];

  // Issues
  issues: ReturnType<typeof useIssues>['issues'];
  issuesLoading: boolean;
  issuesError: string | null;
  fetchIssues: ReturnType<typeof useIssues>['fetchIssues'];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  // GitHub authentication state
  const { authState, login, logout, handleCallback } = useGithubAuth();

  // Settings state
  const {
    settings,
    loading: settingsLoading,
    error: settingsError,
    showSyncModal,
    setShowSyncModal,
    handleSync,
    addRepository,
    removeRepository,
    updateNotificationFrequency,
    toggleCustomLabel,
    updateLastCheckedAt,
    toggleHideClosedIssues,
    gistSettings,
  } = useSettings(authState.isLoggedIn);

  // Issues state
  const {
    issues,
    loading: issuesLoading,
    error: issuesError,
    fetchIssues,
  } = useIssues(settings);

  // Handle OAuth callback
  useEffect(() => {
    const url = new URL(window.location.href);
    const code = url.searchParams.get('code');
    const installationId = url.searchParams.get('installation_id');

    if (code) {
      // Remove code from URL
      url.searchParams.delete('code');
      if (installationId) {
        url.searchParams.delete('installation_id');
        window.history.replaceState({}, document.title, url.toString());
      } else {
        window.history.replaceState({}, document.title, url.toString());
      }

      handleCallback(code, installationId ?? undefined);
    }
  }, [handleCallback]);

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
    showSyncModal,
    setShowSyncModal,
    handleSync,
    addRepository,
    removeRepository,
    updateNotificationFrequency,
    toggleCustomLabel,
    updateLastCheckedAt,
    toggleHideClosedIssues,
    gistSettings,
    issues,
    issuesLoading,
    issuesError,
    fetchIssues,
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

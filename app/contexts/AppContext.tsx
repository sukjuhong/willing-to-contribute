'use client';

import React, { createContext, useContext, useEffect, useCallback, useMemo } from 'react';
import useSupabaseAuth from '../hooks/useSupabaseAuth';
import useSettings from '../hooks/useSettings';
import usePickedIssues from '../hooks/usePickedIssues';
import type { StateChange } from '../hooks/usePickedIssues';
import useUserProfile from '../hooks/useUserProfile';
import { checkNotificationPermission } from '../utils/notifications';
import { migrateLocalStorageKeys } from '../utils/localStorage';
import { Issue } from '../types';

// ----- Auth -----
type AuthValue = {
  authState: ReturnType<typeof useSupabaseAuth>['authState'];
  login: ReturnType<typeof useSupabaseAuth>['login'];
  logout: ReturnType<typeof useSupabaseAuth>['logout'];
};
const AuthContext = createContext<AuthValue | undefined>(undefined);

// ----- Settings -----
type SettingsValue = {
  settings: ReturnType<typeof useSettings>['settings'];
  settingsLoading: boolean;
  settingsError: string | null;
  updateNotificationFrequency: ReturnType<
    typeof useSettings
  >['updateNotificationFrequency'];
  toggleHideClosedIssues: ReturnType<typeof useSettings>['toggleHideClosedIssues'];
  updateLastCheckedAt: ReturnType<typeof useSettings>['updateLastCheckedAt'];
};
const SettingsContext = createContext<SettingsValue | undefined>(undefined);

// ----- Picked Issues -----
type PickedValue = {
  pickedIssues: ReturnType<typeof usePickedIssues>['pickedIssues'];
  pickedIssuesLoading: boolean;
  pickedIssuesError: string | null;
  pickIssue: (issue: Issue) => Promise<boolean>;
  unpickIssue: (issueId: string) => Promise<void>;
  updateIssueTags: (issueId: string, tags: string[]) => Promise<void>;
  refreshPickedIssues: () => Promise<StateChange[]>;
};
const PickedContext = createContext<PickedValue | undefined>(undefined);

// ----- Profile -----
type ProfileValue = {
  profile: ReturnType<typeof useUserProfile>['profile'];
  profileLoading: boolean;
  profileError: string | null;
  syncProfile: ReturnType<typeof useUserProfile>['syncProfile'];
  updatePrivacySettings: ReturnType<typeof useUserProfile>['updatePrivacySettings'];
};
const ProfileContext = createContext<ProfileValue | undefined>(undefined);

function AuthProvider({ children }: { children: React.ReactNode }) {
  const { authState, login, logout } = useSupabaseAuth();
  const value = useMemo(() => ({ authState, login, logout }), [authState, login, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function SettingsProvider({ children }: { children: React.ReactNode }) {
  const { authState } = useAuth();
  const {
    settings,
    loading: settingsLoading,
    error: settingsError,
    updateNotificationFrequency,
    toggleHideClosedIssues,
    updateLastCheckedAt,
  } = useSettings(authState.isLoggedIn, authState.userId);
  const value = useMemo(
    () => ({
      settings,
      settingsLoading,
      settingsError,
      updateNotificationFrequency,
      toggleHideClosedIssues,
      updateLastCheckedAt,
    }),
    [
      settings,
      settingsLoading,
      settingsError,
      updateNotificationFrequency,
      toggleHideClosedIssues,
      updateLastCheckedAt,
    ],
  );
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

function PickedIssuesProvider({ children }: { children: React.ReactNode }) {
  const { authState } = useAuth();
  const { updateLastCheckedAt } = useAppSettings();
  const {
    pickedIssues,
    loading: pickedIssuesLoading,
    error: pickedIssuesError,
    pickIssue,
    unpickIssue,
    updateIssueTags,
    refreshPickedIssues: _refreshPickedIssues,
  } = usePickedIssues(authState.isLoggedIn, authState.userId, authState.accessToken);

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

  const value = useMemo(
    () => ({
      pickedIssues,
      pickedIssuesLoading,
      pickedIssuesError,
      pickIssue,
      unpickIssue,
      updateIssueTags,
      refreshPickedIssues,
    }),
    [
      pickedIssues,
      pickedIssuesLoading,
      pickedIssuesError,
      pickIssue,
      unpickIssue,
      updateIssueTags,
      refreshPickedIssues,
    ],
  );
  return <PickedContext.Provider value={value}>{children}</PickedContext.Provider>;
}

function ProfileProvider({ children }: { children: React.ReactNode }) {
  const { authState } = useAuth();
  const { profile, profileLoading, profileError, syncProfile, updatePrivacySettings } =
    useUserProfile(authState.isLoggedIn);
  const value = useMemo(
    () => ({ profile, profileLoading, profileError, syncProfile, updatePrivacySettings }),
    [profile, profileLoading, profileError, syncProfile, updatePrivacySettings],
  );
  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

function NotificationOrchestrator({ children }: { children: React.ReactNode }) {
  const { settings } = useAppSettings();
  const { pickedIssues, refreshPickedIssues } = usePicked();

  useEffect(() => {
    migrateLocalStorageKeys();
    checkNotificationPermission();
  }, []);

  useEffect(() => {
    if (settings.notificationFrequency === 'never') return;
    if (pickedIssues.length === 0) return;

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
  }, [settings.notificationFrequency, pickedIssues.length, refreshPickedIssues]);

  return <>{children}</>;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <SettingsProvider>
        <PickedIssuesProvider>
          <ProfileProvider>
            <NotificationOrchestrator>{children}</NotificationOrchestrator>
          </ProfileProvider>
        </PickedIssuesProvider>
      </SettingsProvider>
    </AuthProvider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AppProvider');
  }
  return context;
}

export function useAppSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useAppSettings must be used within an AppProvider');
  }
  return context;
}

export function usePicked() {
  const context = useContext(PickedContext);
  if (context === undefined) {
    throw new Error('usePicked must be used within an AppProvider');
  }
  return context;
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within an AppProvider');
  }
  return context;
}

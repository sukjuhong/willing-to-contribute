import { useState, useEffect, useCallback, useRef } from 'react';
import { UserSettings, Issue, SavedIssue } from '../types';
import { saveSettings, loadSettings, defaultSettings } from '../utils/localStorage';
import {
  loadUserSettings as loadFromSupabase,
  saveUserSettings as saveToSupabase,
} from '../lib/supabase/settings';

// Custom hook for managing user settings
const useSettings = (isLoggedIn: boolean, userId?: string) => {
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  // Load settings on mount and when auth state changes
  useEffect(() => {
    const loadUserSettings = async () => {
      setLoading(true);
      try {
        if (isLoggedIn) {
          if (userId) {
            const dbSettings = await loadFromSupabase(userId);
            if (dbSettings) {
              setSettings(dbSettings);
              saveSettings(dbSettings);
            } else {
              setSettings(loadSettings());
            }
          } else {
            setSettings(loadSettings());
          }
        } else {
          setSettings(defaultSettings);
        }
      } catch (err) {
        console.error('Error loading settings:', err);
        setError('Failed to load settings');
        setSettings(defaultSettings);
      } finally {
        setLoading(false);
      }
    };

    loadUserSettings();
  }, [isLoggedIn, userId]);

  const saveUserSettings = useCallback(
    async (newSettings: UserSettings) => {
      try {
        saveSettings(newSettings);
        setSettings(newSettings);

        if (isLoggedIn && userId) {
          if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
          saveTimerRef.current = setTimeout(() => {
            saveToSupabase(userId, newSettings).catch(err =>
              console.error('Error saving settings to Supabase:', err),
            );
          }, 500);
        }

        return true;
      } catch (err) {
        console.error('Error saving settings:', err);
        setError('Failed to save settings');
        return false;
      }
    },
    [isLoggedIn, userId],
  );

  // Save (pick) an issue
  const saveIssue = useCallback(
    async (issue: Issue): Promise<boolean> => {
      try {
        const alreadySaved = settings.savedIssues.some(s => s.id === issue.id);
        if (alreadySaved) return false;

        const now = new Date().toISOString();
        const saved: SavedIssue = {
          id: issue.id,
          number: issue.number,
          title: issue.title,
          url: issue.url,
          state: issue.state,
          repository: {
            owner: issue.repository.owner,
            name: issue.repository.name,
          },
          labels: issue.labels,
          savedAt: now,
          userTags: [],
          lastKnownState: issue.state,
          lastCheckedAt: now,
          assignee: undefined,
        };

        const newSettings = {
          ...settings,
          savedIssues: [...settings.savedIssues, saved],
        };

        await saveUserSettings(newSettings);
        return true;
      } catch (err) {
        console.error('Error saving issue:', err);
        setError('Failed to save issue');
        return false;
      }
    },
    [settings, saveUserSettings],
  );

  // Unsave (unpick) an issue
  const unsaveIssue = useCallback(
    async (issueId: string): Promise<void> => {
      const newSettings = {
        ...settings,
        savedIssues: settings.savedIssues.filter(s => s.id !== issueId),
      };

      await saveUserSettings(newSettings);
    },
    [settings, saveUserSettings],
  );

  // Update user tags on a saved issue
  const updateIssueTags = useCallback(
    async (issueId: string, tags: string[]): Promise<void> => {
      const newSettings = {
        ...settings,
        savedIssues: settings.savedIssues.map(s =>
          s.id === issueId ? { ...s, userTags: tags } : s,
        ),
      };

      await saveUserSettings(newSettings);
    },
    [settings, saveUserSettings],
  );

  // Update notification frequency
  const updateNotificationFrequency = useCallback(
    async (frequency: 'hourly' | '6hours' | 'daily' | 'never'): Promise<boolean> => {
      try {
        const newSettings = {
          ...settings,
          notificationFrequency: frequency,
        };

        await saveUserSettings(newSettings);
        return true;
      } catch (err) {
        console.error('Error updating notification frequency:', err);
        setError('Failed to update notification frequency');
        return false;
      }
    },
    [settings, saveUserSettings],
  );

  // Toggle hide closed issues
  const toggleHideClosedIssues = useCallback(
    async (hide: boolean): Promise<boolean> => {
      try {
        const newSettings = {
          ...settings,
          hideClosedIssues: hide,
        };

        await saveUserSettings(newSettings);
        return true;
      } catch (err) {
        console.error('Error updating hide closed issues setting:', err);
        setError('Failed to update hide closed issues setting');
        return false;
      }
    },
    [settings, saveUserSettings],
  );

  // Update last checked timestamp
  const updateLastCheckedAt = useCallback(
    async (timestamp: Date): Promise<boolean> => {
      try {
        const newSettings = {
          ...settings,
          lastCheckedAt: timestamp.toISOString(),
        };

        await saveUserSettings(newSettings);
        return true;
      } catch (err) {
        console.error('Error updating last checked timestamp:', err);
        setError('Failed to update last checked timestamp');
        return false;
      }
    },
    [settings, saveUserSettings],
  );

  return {
    settings,
    loading,
    error,
    saveIssue,
    unsaveIssue,
    updateIssueTags,
    updateNotificationFrequency,
    toggleHideClosedIssues,
    updateLastCheckedAt,
  };
};

export default useSettings;

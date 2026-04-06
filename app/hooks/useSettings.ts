import { useState, useEffect, useCallback, useRef } from 'react';
import { UserSettings } from '../types';
import { saveSettings, loadSettings, defaultSettings } from '../utils/localStorage';
import { getRepository, parseRepoUrl } from '../utils/github';
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

  // Add a repository
  const addRepository = useCallback(
    async (repoUrl: string) => {
      try {
        // Parse the repository URL
        const repoInfo = parseRepoUrl(repoUrl);

        if (!repoInfo) {
          throw new Error('Invalid repository URL');
        }

        // Fetch repository details from GitHub
        const repo = await getRepository(repoInfo.owner, repoInfo.name);

        if (!repo) {
          throw new Error('Repository not found');
        }

        // Check if repository already exists
        const repoExists = settings.repositories.some(
          r => r.owner === repo.owner && r.name === repo.name,
        );

        if (repoExists) {
          throw new Error('Repository already added');
        }

        // Add to repositories list
        const newSettings = {
          ...settings,
          repositories: [...settings.repositories, repo],
        };

        // Save settings
        await saveUserSettings(newSettings);

        return true;
      } catch (err: unknown) {
        console.error('Error adding repository:', err);

        // Handle rate limit errors
        const error = err as { isRateLimit?: boolean; resetTime?: Date };
        if (error.isRateLimit && error.resetTime) {
          const formattedTime = error.resetTime.toLocaleTimeString();
          setError(
            `GitHub API 사용 한도를 초과했습니다. ${formattedTime}에 다시 시도해주세요.`,
          );
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Failed to add repository');
        }

        return false;
      }
    },
    [settings, saveUserSettings],
  );

  // Remove a repository
  const removeRepository = useCallback(
    async (repoId: string) => {
      const newSettings = {
        ...settings,
        repositories: settings.repositories.filter(repo => repo.id !== repoId),
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

  // Toggle custom label
  const toggleCustomLabel = useCallback(
    async (label: string, add: boolean): Promise<boolean> => {
      try {
        const newSettings = {
          ...settings,
          customLabels: add
            ? [...settings.customLabels, label]
            : settings.customLabels.filter(l => l !== label),
        };

        await saveUserSettings(newSettings);
        return true;
      } catch (err) {
        console.error('Error updating custom labels:', err);
        setError('Failed to update custom labels');
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

  return {
    settings,
    loading,
    error,
    addRepository,
    removeRepository,
    updateNotificationFrequency,
    toggleCustomLabel,
    updateLastCheckedAt,
    toggleHideClosedIssues,
  };
};

export default useSettings;

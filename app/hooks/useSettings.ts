import { useState, useEffect, useCallback } from 'react';
import { UserSettings } from '../types';
import { saveSettings, loadSettings, defaultSettings } from '../utils/localStorage';
import {
  getRepository,
  parseRepoUrl,
  saveSettingsToGist,
  loadSettingsFromGist,
} from '../utils/github';

// Custom hook for managing user settings
const useSettings = (isLoggedIn: boolean) => {
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showSyncModal, setShowSyncModal] = useState<boolean>(false);
  const [gistSettings, setGistSettings] = useState<UserSettings | null>(null);

  // Load settings on mount and when auth state changes
  useEffect(() => {
    const loadUserSettings = async () => {
      setLoading(true);
      try {
        // Try to load settings from localStorage first
        const localSettings = loadSettings();

        // If user is logged in, try to get settings from GitHub Gist
        if (isLoggedIn) {
          try {
            const gistContent = await loadSettingsFromGist();

            if (gistContent) {
              // Parse gist content
              const parsedGistSettings = JSON.parse(gistContent) as UserSettings;

              // Compare local and gist repositories
              const localRepos = localSettings.repositories;
              const gistRepos = parsedGistSettings.repositories;

              // Check if repositories are different
              const hasDifferentRepos =
                localRepos.length !== gistRepos.length ||
                localRepos.some(
                  localRepo =>
                    !gistRepos.some(
                      gistRepo =>
                        gistRepo.owner === localRepo.owner &&
                        gistRepo.name === localRepo.name,
                    ),
                );

              if (hasDifferentRepos) {
                // Show sync modal
                setGistSettings(parsedGistSettings);
                setShowSyncModal(true);
                setSettings(localSettings);
              } else {
                // Use gist settings if they're the same
                setSettings(parsedGistSettings);
                saveSettings(parsedGistSettings);
              }
            } else {
              // No gist settings, use local settings
              setSettings(localSettings);
            }
          } catch (gistError) {
            console.error('Error loading settings from Gist:', gistError);
            // Continue with local settings if Gist loading fails
            setSettings(localSettings);
          }
        } else {
          // Not logged in, use local settings
          setSettings(localSettings);
        }
      } catch (err) {
        console.error('Error loading settings:', err);
        setError('Failed to load settings');
        // Use default settings if all else fails
        setSettings(defaultSettings);
      } finally {
        setLoading(false);
      }
    };

    loadUserSettings();
  }, [isLoggedIn]);

  // Handle repository synchronization
  const handleSync = useCallback(
    async (option: 'local' | 'gist' | 'merge') => {
      if (!gistSettings) return;

      let newSettings: UserSettings;

      switch (option) {
        case 'local':
          // Keep local repositories
          newSettings = settings;
          break;
        case 'gist':
          // Use gist repositories
          newSettings = gistSettings;
          break;
        case 'merge':
          // Merge repositories, removing duplicates
          const mergedRepos = [...settings.repositories];
          gistSettings.repositories.forEach(gistRepo => {
            const exists = mergedRepos.some(
              localRepo =>
                localRepo.owner === gistRepo.owner && localRepo.name === gistRepo.name,
            );
            if (!exists) {
              mergedRepos.push(gistRepo);
            }
          });
          newSettings = {
            ...settings,
            repositories: mergedRepos,
          };
          break;
      }

      // Save the new settings
      saveSettings(newSettings);
      if (isLoggedIn) {
        await saveSettingsToGist(JSON.stringify(newSettings));
      }
      setSettings(newSettings);
      setShowSyncModal(false);
    },
    [settings, gistSettings, isLoggedIn],
  );

  // Save settings to localStorage and optionally to GitHub Gist
  const saveUserSettings = useCallback(
    async (newSettings: UserSettings) => {
      try {
        // Always save to localStorage
        saveSettings(newSettings);

        // Update state
        setSettings(newSettings);

        // If logged in, also save to GitHub Gist
        if (isLoggedIn) {
          await saveSettingsToGist(JSON.stringify(newSettings));
        }

        return true;
      } catch (err) {
        console.error('Error saving settings:', err);
        setError('Failed to save settings');
        return false;
      }
    },
    [isLoggedIn],
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
  };
};

export default useSettings;

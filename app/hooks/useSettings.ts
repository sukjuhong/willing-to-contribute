import { useState, useEffect, useCallback } from 'react';
import { UserSettings, Repository } from '../types';
import { saveSettings, loadSettings, defaultSettings } from '../utils/localStorage';
import { getRepository, parseRepoUrl, saveSettingsToGist, loadSettingsFromGist } from '../utils/github';

// Custom hook for managing user settings
const useSettings = (isLoggedIn: boolean) => {
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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
              const gistSettings = JSON.parse(gistContent) as UserSettings;
              
              // Merge with default settings to ensure all fields exist
              setSettings({
                ...defaultSettings,
                ...gistSettings,
              });
              
              // Also save to localStorage
              saveSettings({
                ...defaultSettings,
                ...gistSettings,
              });
              
              setLoading(false);
              return;
            }
          } catch (gistError) {
            console.error('Error loading settings from Gist:', gistError);
            // Continue with local settings if Gist loading fails
          }
        }
        
        // Fall back to local settings
        setSettings(localSettings);
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

  // Save settings to localStorage and optionally to GitHub Gist
  const saveUserSettings = useCallback(async (newSettings: UserSettings) => {
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
  }, [isLoggedIn]);

  // Add a repository
  const addRepository = useCallback(async (repoUrl: string) => {
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
      const repoExists = settings.repositories.some(r => 
        r.owner === repo.owner && r.name === repo.name
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
    } catch (err: any) {
      console.error('Error adding repository:', err);
      
      // Handle rate limit errors
      if (err.isRateLimit) {
        const formattedTime = err.resetTime.toLocaleTimeString();
        setError(`GitHub API 사용 한도를 초과했습니다. ${formattedTime}에 다시 시도해주세요.`);
      } else {
        setError(err instanceof Error ? err.message : 'Failed to add repository');
      }
      
      return false;
    }
  }, [settings, saveUserSettings]);

  // Remove a repository
  const removeRepository = useCallback(async (repoId: string) => {
    try {
      // Filter out the repository to remove
      const newSettings = {
        ...settings,
        repositories: settings.repositories.filter(repo => repo.id !== repoId),
      };
      
      // Save settings
      await saveUserSettings(newSettings);
      
      return true;
    } catch (err) {
      console.error('Error removing repository:', err);
      setError('Failed to remove repository');
      return false;
    }
  }, [settings, saveUserSettings]);

  // Update notification frequency
  const updateNotificationFrequency = useCallback(async (
    frequency: 'hourly' | '6hours' | 'daily' | 'never'
  ) => {
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
  }, [settings, saveUserSettings]);

  // Add or remove a custom label
  const toggleCustomLabel = useCallback(async (label: string, add: boolean) => {
    try {
      let customLabels = [...settings.customLabels];
      
      if (add && !customLabels.includes(label)) {
        // Add label
        customLabels.push(label);
      } else if (!add && customLabels.includes(label)) {
        // Remove label
        customLabels = customLabels.filter(l => l !== label);
      }
      
      const newSettings = {
        ...settings,
        customLabels,
      };
      
      await saveUserSettings(newSettings);
      
      return true;
    } catch (err) {
      console.error('Error updating custom labels:', err);
      setError('Failed to update custom labels');
      return false;
    }
  }, [settings, saveUserSettings]);

  // Update lastCheckedAt timestamp
  const updateLastCheckedAt = useCallback(async () => {
    try {
      const newSettings = {
        ...settings,
        lastCheckedAt: new Date().toISOString(),
      };
      
      await saveUserSettings(newSettings);
      
      return true;
    } catch (err) {
      console.error('Error updating last checked timestamp:', err);
      setError('Failed to update last checked timestamp');
      return false;
    }
  }, [settings, saveUserSettings]);

  // Toggle hide closed issues setting
  const toggleHideClosedIssues = useCallback(async (hide: boolean) => {
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
  }, [settings, saveUserSettings]);

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
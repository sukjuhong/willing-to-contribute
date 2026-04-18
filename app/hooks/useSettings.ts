import { useState, useEffect, useCallback, useRef } from 'react';
import { UserSettings } from '../types';
import { saveSettings, loadSettings, defaultSettings } from '../utils/localStorage';
import {
  loadUserSettings as loadFromSupabase,
  saveUserSettings as saveToSupabase,
} from '../lib/supabase/settings';

// Custom hook for managing user settings (no longer manages picked issues)
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
    updateNotificationFrequency,
    toggleHideClosedIssues,
    updateLastCheckedAt,
    saveUserSettings,
  };
};

export default useSettings;

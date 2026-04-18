import { UserSettings } from '../types';

const SETTINGS_KEY = 'pickssue-settings';

// Legacy prefixes for migration chain: willing-to-contribute → contrifit → pickssue
const LEGACY_PREFIXES = ['willing-to-contribute-', 'contrifit-'];

export const migrateLocalStorageKeys = (): void => {
  if (typeof window === 'undefined') return;

  const currentPrefix = 'pickssue-';
  const keysToMigrate: [string, string][] = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key) continue;

    for (const legacyPrefix of LEGACY_PREFIXES) {
      if (key.startsWith(legacyPrefix)) {
        const newKey = key.replace(legacyPrefix, currentPrefix);
        keysToMigrate.push([key, newKey]);
        break;
      }
    }
  }

  for (const [oldKey, newKey] of keysToMigrate) {
    const oldValue = localStorage.getItem(oldKey);
    if (oldValue && !localStorage.getItem(newKey)) {
      localStorage.setItem(newKey, oldValue);
    }
    localStorage.removeItem(oldKey);
  }

  cleanupLegacyCaches();
};

const cleanupLegacyCaches = (): void => {
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (
      key === 'pickssue-issues' ||
      key === 'pickssue-cache-timestamp' ||
      key?.startsWith('pickssue-recommended-issues')
    ) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(key => localStorage.removeItem(key));
};

export const clearAllUserData = (): void => {
  if (typeof window === 'undefined') return;

  const prefix = 'pickssue-';
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(prefix)) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(key => localStorage.removeItem(key));
};

export const defaultSettings: UserSettings = {
  notificationFrequency: 'daily',
  hideClosedIssues: true,
  lastCheckedAt: new Date().toISOString(),
};

export const saveSettings = (settings: UserSettings): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }
};

export const loadSettings = (): UserSettings => {
  if (typeof window === 'undefined') return defaultSettings;
  const raw = localStorage.getItem(SETTINGS_KEY);
  if (!raw) return defaultSettings;
  try {
    const parsed = JSON.parse(raw);
    return {
      notificationFrequency:
        parsed.notificationFrequency ?? defaultSettings.notificationFrequency,
      hideClosedIssues: parsed.hideClosedIssues ?? defaultSettings.hideClosedIssues,
      lastCheckedAt: parsed.lastCheckedAt ?? defaultSettings.lastCheckedAt,
    };
  } catch {
    localStorage.removeItem(SETTINGS_KEY);
    return defaultSettings;
  }
};

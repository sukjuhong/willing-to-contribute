import { UserSettings, Issue } from '../types';

const SETTINGS_KEY = 'pickssue-settings';

// Legacy prefixes for migration chain: willing-to-contribute → contrifit → pickssue
const LEGACY_PREFIXES = ['willing-to-contribute-', 'contrifit-'];

// Migrate localStorage data from old keys to new keys (runs once)
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

  // Migrate old settings shape (repositories → pickedIssues)
  migrateSettingsShape();
};

// Convert old settings with repositories[] to new shape with pickedIssues[]
const migrateSettingsShape = (): void => {
  const raw = localStorage.getItem(SETTINGS_KEY);
  if (!raw) return;

  try {
    const parsed = JSON.parse(raw);
    // Old shape had 'repositories' and 'customLabels'
    if (parsed.repositories && !parsed.pickedIssues) {
      const migrated: UserSettings = {
        pickedIssues: [],
        notificationFrequency: parsed.notificationFrequency ?? 'daily',
        hideClosedIssues: parsed.hideClosedIssues ?? true,
        lastCheckedAt: parsed.lastCheckedAt,
      };
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(migrated));
    }
  } catch {
    // Corrupt data — reset to defaults
    localStorage.removeItem(SETTINGS_KEY);
  }

  // Clean up old repo issue caches
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key === 'pickssue-issues' || key === 'pickssue-cache-timestamp') {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(key => localStorage.removeItem(key));
};

// Clear all user data from localStorage on logout
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

// Default settings
export const defaultSettings: UserSettings = {
  pickedIssues: [],
  notificationFrequency: 'daily',
  hideClosedIssues: true,
  lastCheckedAt: new Date().toISOString(),
};

// User settings
export const saveSettings = (settings: UserSettings): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }
};

export const loadSettings = (): UserSettings => {
  if (typeof window !== 'undefined') {
    const settings = localStorage.getItem(SETTINGS_KEY);
    if (settings) {
      const parsed = JSON.parse(settings);
      // Guard against loading old shape
      if (parsed.pickedIssues) return parsed;
    }
  }
  return defaultSettings;
};

// Recommended issues cache
const RECOMMENDED_ISSUES_KEY = 'pickssue-recommended-issues';
const RECOMMENDED_CACHE_MINUTES = 30;

interface RecommendedIssuesCache {
  issues: Issue[];
  timestamp: number;
  language: string;
}

export const saveRecommendedIssuesCache = (issues: Issue[], language: string): void => {
  if (typeof window !== 'undefined') {
    const cacheKey = `${RECOMMENDED_ISSUES_KEY}-${language}`;
    const cache: RecommendedIssuesCache = {
      issues,
      timestamp: Date.now(),
      language,
    };
    localStorage.setItem(cacheKey, JSON.stringify(cache));
  }
};

export const loadRecommendedIssuesCache = (language: string): Issue[] | null => {
  if (typeof window !== 'undefined') {
    try {
      const cacheKey = `${RECOMMENDED_ISSUES_KEY}-${language}`;
      const data = localStorage.getItem(cacheKey);
      if (data) {
        const cache: RecommendedIssuesCache = JSON.parse(data);
        const elapsed = Date.now() - cache.timestamp;
        if (elapsed < RECOMMENDED_CACHE_MINUTES * 60 * 1000) {
          return cache.issues;
        }
      }
    } catch (error) {
      console.error('Error loading recommended issues cache:', error);
    }
  }
  return null;
};

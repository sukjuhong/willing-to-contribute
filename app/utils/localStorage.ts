import { UserSettings, Repository, Issue } from '../types';

const SETTINGS_KEY = 'contrifit-settings';
const ISSUES_KEY = 'contrifit-issues';
const CACHE_TIMESTAMP_KEY = 'contrifit-cache-timestamp';

// Legacy keys for migration from willing-to-contribute → contrifit
const LEGACY_PREFIX = 'willing-to-contribute-';
const LEGACY_KEY_MAP: Record<string, string> = {
  [`${LEGACY_PREFIX}settings`]: SETTINGS_KEY,
  [`${LEGACY_PREFIX}issues`]: ISSUES_KEY,
  [`${LEGACY_PREFIX}cache-timestamp`]: CACHE_TIMESTAMP_KEY,
};

// Migrate localStorage data from old keys to new keys (runs once)
export const migrateLocalStorageKeys = (): void => {
  if (typeof window === 'undefined') return;

  for (const [oldKey, newKey] of Object.entries(LEGACY_KEY_MAP)) {
    const oldValue = localStorage.getItem(oldKey);
    if (oldValue && !localStorage.getItem(newKey)) {
      localStorage.setItem(newKey, oldValue);
    }
    if (oldValue) {
      localStorage.removeItem(oldKey);
    }
  }

  // Also migrate recommended-issues cache keys (they have language suffix)
  const keysToMigrate: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(`${LEGACY_PREFIX}recommended-issues`)) {
      keysToMigrate.push(key);
    }
  }
  for (const oldKey of keysToMigrate) {
    const newKey = oldKey.replace(LEGACY_PREFIX, 'contrifit-');
    const oldValue = localStorage.getItem(oldKey);
    if (oldValue && !localStorage.getItem(newKey)) {
      localStorage.setItem(newKey, oldValue);
    }
    localStorage.removeItem(oldKey);
  }

  // Clean up legacy auth key (no longer needed with Supabase)
  localStorage.removeItem(`${LEGACY_PREFIX}auth`);
};

// Clear all user data from localStorage on logout
export const clearAllUserData = (): void => {
  if (typeof window === 'undefined') return;

  const prefix = 'contrifit-';
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
  repositories: [],
  customLabels: ['good first issue', 'help wanted', 'easy'],
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
      return JSON.parse(settings);
    }
  }
  return defaultSettings;
};

// Repository-specific issues
export interface RepositoryIssuesCache {
  [key: string]: {
    issues: Issue[];
    timestamp: number;
  };
}

// Issues - Using a repository-based structure
export const saveIssues = (issues: Issue[]): void => {
  if (typeof window !== 'undefined') {
    // Group issues by repository
    const repoIssues: RepositoryIssuesCache = {};

    // Group by repository
    issues.forEach(issue => {
      const repoKey = createRepositoryKey(issue.repository);

      if (!repoIssues[repoKey]) {
        repoIssues[repoKey] = {
          issues: [],
          timestamp: Date.now(),
        };
      }

      repoIssues[repoKey].issues.push(issue);
    });

    localStorage.setItem(ISSUES_KEY, JSON.stringify(repoIssues));
  }
};

export const loadIssues = (): Issue[] => {
  if (typeof window !== 'undefined') {
    const data = localStorage.getItem(ISSUES_KEY);
    if (data) {
      try {
        const repoIssues: RepositoryIssuesCache = JSON.parse(data);
        // Flatten all repository issues into a single array
        return Object.values(repoIssues).flatMap(repo => repo.issues);
      } catch (error) {
        console.error('Error loading issues:', error);
        // If there's an error parsing the JSON, return an empty array
        return [];
      }
    }
  }
  return [];
};

export const saveRepositoryIssues = (repositoryKey: string, issues: Issue[]): void => {
  if (typeof window !== 'undefined') {
    try {
      let repoIssues: RepositoryIssuesCache = {};
      const existingData = localStorage.getItem(ISSUES_KEY);

      if (existingData) {
        repoIssues = JSON.parse(existingData);
      }

      repoIssues[repositoryKey] = {
        issues: issues,
        timestamp: Date.now(),
      };

      localStorage.setItem(ISSUES_KEY, JSON.stringify(repoIssues));
    } catch (error) {
      console.error(`Error saving issues for repository ${repositoryKey}:`, error);
    }
  }
};

export const loadRepositoryIssues = (repositoryKey: string): Issue[] | null => {
  if (typeof window !== 'undefined') {
    try {
      const allData = localStorage.getItem(ISSUES_KEY);
      if (allData) {
        const repoIssues: RepositoryIssuesCache = JSON.parse(allData);
        if (repoIssues[repositoryKey]) {
          return repoIssues[repositoryKey].issues;
        }
      }
    } catch (error) {
      console.error(`Error loading issues for repository ${repositoryKey}:`, error);
    }
  }
  return null;
};

export const loadRepositoryTimestamp = (repositoryKey: string): number | null => {
  if (typeof window !== 'undefined') {
    try {
      const allData = localStorage.getItem(ISSUES_KEY);
      if (allData) {
        const repoIssues: RepositoryIssuesCache = JSON.parse(allData);
        if (repoIssues[repositoryKey]) {
          return repoIssues[repositoryKey].timestamp;
        }
      }
    } catch (error) {
      console.error(`Error loading timestamp for repository ${repositoryKey}:`, error);
    }
  }
  return null;
};

// Save cache timestamp
export const saveCacheTimestamp = (timestamp: number): void => {
  try {
    localStorage.setItem(CACHE_TIMESTAMP_KEY, timestamp.toString());
  } catch (error) {
    console.error('Error saving cache timestamp:', error);
  }
};

// Load cache timestamp
export const loadCacheTimestamp = (): number | null => {
  try {
    const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
    return timestamp ? parseInt(timestamp, 10) : null;
  } catch (error) {
    console.error('Error loading cache timestamp:', error);
    return null;
  }
};

export const createRepositoryKey = (repository: Repository): string => {
  return `${repository.owner}/${repository.name}`;
};

// Recommended issues cache
const RECOMMENDED_ISSUES_KEY = 'contrifit-recommended-issues';
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

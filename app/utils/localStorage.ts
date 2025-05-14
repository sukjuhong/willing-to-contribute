import { UserSettings, Repository, Issue } from '../types';

const SETTINGS_KEY = 'willing-to-contribute-settings';
const ISSUES_KEY = 'willing-to-contribute-issues';
const AUTH_KEY = 'willing-to-contribute-auth';
const CACHE_TIMESTAMP_KEY = 'willing-to-contribute-cache-timestamp';

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
          timestamp: Date.now()
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
        timestamp: Date.now()
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

// Auth
export const saveAuthToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(AUTH_KEY, token);
  }
};

export const loadAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(AUTH_KEY);
  }
  return null;
};

export const clearAuthToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(AUTH_KEY);
  }
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
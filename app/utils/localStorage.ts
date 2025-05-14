import { UserSettings, Repository, Issue } from '../types';

const SETTINGS_KEY = 'willing-to-contribute-settings';
const ISSUES_KEY = 'willing-to-contribute-issues';
const AUTH_KEY = 'willing-to-contribute-auth';

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

// Issues
export const saveIssues = (issues: Issue[]): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(ISSUES_KEY, JSON.stringify(issues));
  }
};

export const loadIssues = (): Issue[] => {
  if (typeof window !== 'undefined') {
    const issues = localStorage.getItem(ISSUES_KEY);
    if (issues) {
      return JSON.parse(issues);
    }
  }
  return [];
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
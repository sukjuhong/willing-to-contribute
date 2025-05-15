// Repository and Issue types
export interface Repository {
  id: string;
  owner: string;
  name: string;
  url: string;
  description?: string;
  stargazersCount?: number;
}

export interface Label {
  id: string;
  name: string;
  color: string;
}

export interface Issue {
  id: string;
  number: number;
  title: string;
  url: string;
  body?: string;
  labels: Label[];
  createdAt: string;
  updatedAt: string;
  state: 'open' | 'closed';
  repository: Repository;
  isNew?: boolean;
}

// User settings types
export interface UserSettings {
  repositories: Repository[];
  customLabels: string[];
  notificationFrequency: 'hourly' | '6hours' | 'daily' | 'never';
  hideClosedIssues: boolean;
  lastCheckedAt?: string;
}

// GitHub Auth types
export interface GithubAuthState {
  isLoggedIn: boolean;
  isAppAuth?: boolean; // Whether authentication is via GitHub App (true) or OAuth App (false/undefined)
  token?: string;
  installationToken?: string; // Token for GitHub App installation
  user?: {
    login: string;
    avatarUrl: string;
  };
}

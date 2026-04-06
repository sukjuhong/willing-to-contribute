// Repository and Issue types
export interface MaintainerScore {
  grade: 'A' | 'B' | 'C';
  avgResponseTimeHours: number;
  avgMergeTimeHours: number;
  mergeRate: number;
}

export interface Repository {
  id: string;
  owner: string;
  name: string;
  url: string;
  description?: string;
  stargazersCount?: number;
  maintainerScore?: MaintainerScore;
  language?: string;
  forksCount?: number;
  openIssuesCount?: number;
  lastPushedAt?: string;
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
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
}

// User settings types
export interface UserSettings {
  repositories: Repository[];
  customLabels: string[];
  notificationFrequency: 'hourly' | '6hours' | 'daily' | 'never';
  hideClosedIssues: boolean;
  lastCheckedAt?: string;
}

// Auth types
export interface GithubAuthState {
  isLoggedIn: boolean;
  user?: {
    login: string;
    avatarUrl: string;
  };
  accessToken?: string; // GitHub provider_token from Supabase session
  userId?: string; // Supabase user id
}

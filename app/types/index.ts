// Repository and Issue types
export interface MaintainerScore {
  grade: 'A' | 'B' | 'C';
  avgResponseTimeHours: number;
  avgMergeTimeHours: number;
  mergeRate: number;
}

export type IssueQualityGrade = 'A' | 'B' | 'C';

export interface IssueQualityScore {
  grade: IssueQualityGrade;
  score: number; // 0-100
  signals: {
    bodyLength: number;
    bodyPoints: number;
    comments: number;
    commentsPoints: number;
    hasAssignee: boolean;
    assigneePoints: number;
    hasBeginnerLabel: boolean;
    labelPoints: number;
  };
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
  comments?: number;
  assignee?: string | null;
  matchScore?: number; // 0-100 skill matching score (only for logged-in users with profile)
  qualityScore?: IssueQualityScore;
  pickCount?: number; // Number of users who have picked this issue (cross-user social proof)
}

// Saved (picked) issue types
export interface PickedIssue {
  id: string; // GitHub issue ID
  number: number;
  title: string;
  url: string;
  state: 'open' | 'closed';
  repository: {
    owner: string;
    name: string;
  };
  labels: Label[];
  savedAt: string; // ISO timestamp
  userTags: string[];
  lastKnownState: 'open' | 'closed';
  lastCheckedAt: string; // ISO timestamp
  assignee?: string;
}

// User settings types
export interface UserSettings {
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

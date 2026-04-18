import { Octokit } from '@octokit/rest';
import { Issue, Repository, Label } from '../types';

const getOctokit = (token?: string) => {
  return new Octokit({ auth: token || undefined });
};

export class GitHubRateLimitError extends Error {
  readonly isRateLimit = true as const;
  readonly resetTime: Date;

  constructor(resetTime: Date) {
    super(`GitHub API rate limit exceeded. Reset at ${resetTime.toLocaleTimeString()}`);
    this.name = 'GitHubRateLimitError';
    this.resetTime = resetTime;
  }
}

interface OctokitErrorShape {
  status?: number;
  response?: {
    headers?: {
      'x-ratelimit-remaining'?: string;
      'x-ratelimit-reset'?: string;
    };
  };
}

const throwIfRateLimited = (error: unknown): void => {
  const err = error as OctokitErrorShape;
  if (err?.status === 403 && err?.response?.headers?.['x-ratelimit-remaining'] === '0') {
    const resetTime = new Date(Number(err.response.headers['x-ratelimit-reset']) * 1000);
    throw new GitHubRateLimitError(resetTime);
  }
};

export const parseRepoUrl = (url: string): { owner: string; name: string } | null => {
  try {
    const match = url.match(/(?:github\.com\/)?([^\/]+)\/([^\/]+)(?:\/)?$/);
    if (match && match.length >= 3) {
      return { owner: match[1], name: match[2] };
    }
    return null;
  } catch (error) {
    console.error('Error parsing repository URL:', error);
    return null;
  }
};

export const getRepository = async (
  owner: string,
  name: string,
): Promise<Repository | null> => {
  try {
    const octokit = getOctokit();
    const { data } = await octokit.repos.get({
      owner,
      repo: name,
    });

    return {
      id: data.id.toString(),
      owner: data.owner.login,
      name: data.name,
      url: data.html_url,
      description: data.description || undefined,
      stargazersCount: data.stargazers_count,
    };
  } catch (error: unknown) {
    throwIfRateLimited(error);
    console.error(`Error fetching repository ${owner}/${name}:`, error);
    return null;
  }
};

type OctokitType = ReturnType<typeof getOctokit>;

export const getIssuesWithOrLabels = async (
  octokit: OctokitType,
  repository: Repository,
  labels: string[],
  state: 'open' | 'closed' | 'all',
): Promise<Issue[]> => {
  try {
    const issuePromises = labels.map(label =>
      octokit.issues.listForRepo({
        owner: repository.owner,
        repo: repository.name,
        labels: label,
        state,
        per_page: 100,
      }),
    );

    const responses = await Promise.all(issuePromises);
    const issuesArrays = responses.map(response => response.data);

    const uniqueIssues = new Map<number, unknown>();
    issuesArrays.forEach(issues => {
      issues.forEach((issue: unknown) => {
        uniqueIssues.set((issue as { id: number }).id, issue);
      });
    });

    const allIssues = Array.from(uniqueIssues.values());
    return processIssueData(allIssues, repository);
  } catch (error: unknown) {
    throwIfRateLimited(error);
    console.error(
      `Error fetching issues for ${repository.owner}/${repository.name}:`,
      error,
    );
    return [];
  }
};

interface GithubLabel {
  id: number;
  name: string;
  color: string;
}

interface GithubIssue {
  id: number;
  number: number;
  title: string;
  html_url: string;
  body?: string;
  labels: (GithubLabel | string)[];
  created_at: string;
  updated_at: string;
  state: 'open' | 'closed';
  comments: number;
  assignee: { login: string } | null;
}

const convertLabel = (label: GithubLabel | string): Label => {
  if (typeof label === 'string') {
    return { id: label, name: label, color: 'gray' };
  }
  return {
    id: String(label.id),
    name: label.name || '',
    color: label.color || 'gray',
  };
};

const processIssueData = (data: unknown[], repository: Repository): Issue[] => {
  return data.map(issueData => {
    const issue = issueData as GithubIssue;

    const issueLabels: Label[] = (issue.labels as (GithubLabel | string)[]).map(
      convertLabel,
    );

    return {
      id: issue.id.toString(),
      number: issue.number,
      title: issue.title,
      url: issue.html_url,
      body: issue.body || undefined,
      labels: issueLabels,
      createdAt: issue.created_at,
      updatedAt: issue.updated_at,
      state: issue.state,
      repository,
      comments: issue.comments,
      assignee: issue.assignee?.login ?? null,
    };
  });
};

export const getIssues = async (
  repository: Repository,
  labels: string[],
  hideClosedIssues: boolean,
): Promise<Issue[]> => {
  try {
    const octokit = getOctokit();
    const state: 'open' | 'closed' | 'all' = hideClosedIssues ? 'open' : 'all';

    if (labels.length === 0) {
      return [];
    }

    return getIssuesWithOrLabels(octokit, repository, labels, state);
  } catch (error: unknown) {
    if (error instanceof GitHubRateLimitError) throw error;
    console.error(
      `Error fetching issues for ${repository.owner}/${repository.name}:`,
      error,
    );
    return [];
  }
};

export const searchRepositories = async (query: string): Promise<Repository[]> => {
  try {
    const octokit = getOctokit();
    const { data } = await octokit.search.repos({
      q: query,
      sort: 'stars',
      order: 'desc',
      per_page: 5,
    });

    return data.items.map(item => ({
      id: item.id.toString(),
      owner: item.owner?.login ?? '',
      name: item.name,
      url: item.html_url,
      description: item.description || undefined,
      stargazersCount: item.stargazers_count,
    }));
  } catch (error: unknown) {
    throwIfRateLimited(error);
    console.error('Error searching repositories:', error);
    return [];
  }
};

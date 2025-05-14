import { Octokit } from '@octokit/rest';
import { Issue, Repository, Label } from '../types';
import { loadAuthToken } from './localStorage';

// Create Octokit instance with or without auth token
const getOctokit = () => {
  const token = loadAuthToken();
  return new Octokit({
    auth: token || undefined,
  });
};

// Parse repository URL to get owner and name
export const parseRepoUrl = (url: string): { owner: string; name: string } | null => {
  try {
    // Handle both https://github.com/owner/repo and owner/repo formats
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

// Get repository details
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
    // Check specifically for rate limit errors
    const err = error as {
      status?: number;
      response?: {
        headers?: {
          'x-ratelimit-remaining'?: string;
          'x-ratelimit-reset'?: string;
        };
      };
    };

    if (
      err?.status === 403 &&
      err?.response?.headers?.['x-ratelimit-remaining'] === '0'
    ) {
      const resetTime = new Date(
        Number(err?.response?.headers?.['x-ratelimit-reset']) * 1000,
      );
      console.error(
        `GitHub API rate limit exceeded. Reset at ${resetTime.toLocaleTimeString()}`,
      );

      // Re-throw with rate limit information
      throw {
        isRateLimit: true,
        resetTime,
        message: `GitHub API rate limit exceeded. Reset at ${resetTime.toLocaleTimeString()}`,
      };
    }

    console.error(`Error fetching repository ${owner}/${name}:`, error);
    return null;
  }
};

// Type definition for the Octokit instance
type OctokitType = ReturnType<typeof getOctokit>;

// Get issues with any of the provided labels (OR operation)
export const getIssuesWithOrLabels = async (
  octokit: OctokitType,
  repository: Repository,
  labels: string[],
  state: 'open' | 'closed' | 'all',
): Promise<Issue[]> => {
  try {
    // Create promises for fetching issues with each label separately
    const issuePromises = labels.map(label =>
      octokit.issues.listForRepo({
        owner: repository.owner,
        repo: repository.name,
        labels: label,
        state,
        per_page: 100,
      }),
    );

    // Execute all promises in parallel
    const responses = await Promise.all(issuePromises);

    // Extract data from responses
    const issuesArrays = responses.map(response => response.data);

    // Track processed issues by ID to avoid duplicates
    const uniqueIssues = new Map<number, unknown>();

    // Flatten and deduplicate issues
    issuesArrays.forEach(issues => {
      issues.forEach((issue: unknown) => {
        uniqueIssues.set((issue as { id: number }).id, issue);
      });
    });

    // Convert to array
    const allIssues = Array.from(uniqueIssues.values());

    console.log(
      `Found ${allIssues.length} unique issues for ${repository.owner}/${repository.name} with labels: ${labels.join(', ')}`,
    );
    return processIssueData(allIssues, repository);
  } catch (error: unknown) {
    // Check specifically for rate limit errors
    const err = error as {
      status?: number;
      response?: {
        headers?: {
          'x-ratelimit-remaining'?: string;
          'x-ratelimit-reset'?: string;
        };
      };
    };

    if (
      err?.status === 403 &&
      err?.response?.headers?.['x-ratelimit-remaining'] === '0'
    ) {
      const resetTime = new Date(
        Number(err?.response?.headers?.['x-ratelimit-reset']) * 1000,
      );
      console.error(
        `GitHub API rate limit exceeded. Reset at ${resetTime.toLocaleTimeString()}`,
      );

      // Re-throw with rate limit information
      throw {
        isRateLimit: true,
        resetTime,
        message: `GitHub API rate limit exceeded. Reset at ${resetTime.toLocaleTimeString()}`,
      };
    }

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
}

// Helper function to process GitHub API data into our Issue type
const processIssueData = (data: unknown[], repository: Repository): Issue[] => {
  return data.map(issueData => {
    const issue = issueData as GithubIssue;

    // Convert GitHub API label objects to our Label type
    const issueLabels: Label[] = (issue.labels as (GithubLabel | string)[]).map(label => {
      if (typeof label === 'string') {
        return {
          id: label,
          name: label,
          color: 'gray',
        };
      } else {
        return {
          id: String(label.id),
          name: label.name || '',
          color: label.color || 'gray',
        };
      }
    });

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
    };
  });
};

// Refactored getIssues to use the new function
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
    // Pass through rate limit errors
    const err = error as { isRateLimit?: boolean };
    if (err.isRateLimit) {
      throw error;
    }

    console.error(
      `Error fetching issues for ${repository.owner}/${repository.name}:`,
      error,
    );
    return [];
  }
};

// Save settings to GitHub Gist
export const saveSettingsToGist = async (content: string): Promise<string | null> => {
  try {
    const octokit = getOctokit();
    const token = loadAuthToken();

    if (!token) {
      throw new Error('No GitHub token available');
    }

    // Check if gist already exists
    const { data: gists } = await octokit.gists.list();
    const existingGist = gists.find(
      gist => gist.description === 'Willing to Contribute Settings',
    );

    if (existingGist) {
      // Update existing gist
      const { data } = await octokit.gists.update({
        gist_id: existingGist.id,
        files: {
          'willing-to-contribute-settings.json': {
            content,
          },
        },
      });
      return data.id ?? null;
    } else {
      // Create new gist
      const { data } = await octokit.gists.create({
        description: 'Willing to Contribute Settings',
        public: false,
        files: {
          'willing-to-contribute-settings.json': {
            content,
          },
        },
      });
      return data.id ?? null;
    }
  } catch (error) {
    console.error('Error saving settings to GitHub Gist:', error);
    return null;
  }
};

// Load settings from GitHub Gist
export const loadSettingsFromGist = async (): Promise<string | null> => {
  try {
    const octokit = getOctokit();
    const token = loadAuthToken();

    if (!token) {
      throw new Error('No GitHub token available');
    }

    // Find the gist
    const { data: gists } = await octokit.gists.list();
    const existingGist = gists.find(
      gist => gist.description === 'Willing to Contribute Settings',
    );

    if (!existingGist) {
      return null;
    }

    // Get gist content
    const { data } = await octokit.gists.get({
      gist_id: existingGist.id,
    });

    const file = data.files?.['willing-to-contribute-settings.json'];
    return file?.content || null;
  } catch (error) {
    console.error('Error loading settings from GitHub Gist:', error);
    return null;
  }
};

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
export const getRepository = async (owner: string, name: string): Promise<Repository | null> => {
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
  } catch (error) {
    console.error(`Error fetching repository ${owner}/${name}:`, error);
    return null;
  }
};

// Get issues for a repository with specific labels
export const getIssues = async (
  repository: Repository, 
  labels: string[],
  hideClosedIssues: boolean
): Promise<Issue[]> => {
  try {
    const octokit = getOctokit();
    const state = hideClosedIssues ? 'open' : 'all';
    const labelsString = labels.join(',');
    
    const { data } = await octokit.issues.listForRepo({
      owner: repository.owner,
      repo: repository.name,
      labels: labelsString,
      state,
      per_page: 100,
    });
    
    return data.map(issue => {
      // Convert GitHub API label objects to our Label type
      const issueLabels: Label[] = (issue.labels as any[]).map(label => {
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
        state: issue.state as 'open' | 'closed',
        repository,
      };
    });
  } catch (error) {
    console.error(`Error fetching issues for ${repository.owner}/${repository.name}:`, error);
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
    const existingGist = gists.find(gist => 
      gist.description === 'Willing to Contribute Settings'
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
      return data.id;
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
      return data.id;
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
    const existingGist = gists.find(gist => 
      gist.description === 'Willing to Contribute Settings'
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
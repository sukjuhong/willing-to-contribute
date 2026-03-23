/**
 * GitHub API utility for Chrome Extension
 * Uses fetch directly (no Octokit dependency for lighter bundle)
 */

const GITHUB_API = 'https://api.github.com';

function headers(token) {
  const h = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'WillingToContribute-Extension/1.0',
  };
  if (token) {
    h.Authorization = `Bearer ${token}`;
  }
  return h;
}

/**
 * Parse a GitHub repository URL into owner/name
 * Supports: https://github.com/owner/name, github.com/owner/name, owner/name
 */
function parseRepoUrl(input) {
  const trimmed = input.trim().replace(/\/+$/, '');

  // Try URL format
  const urlMatch = trimmed.match(
    /(?:https?:\/\/)?(?:www\.)?github\.com\/([^/]+)\/([^/]+)/,
  );
  if (urlMatch) {
    return { owner: urlMatch[1], name: urlMatch[2] };
  }

  // Try owner/name format
  const shortMatch = trimmed.match(/^([^/]+)\/([^/]+)$/);
  if (shortMatch) {
    return { owner: shortMatch[1], name: shortMatch[2] };
  }

  return null;
}

/**
 * Fetch repository info from GitHub API
 */
async function fetchRepository(owner, name, token) {
  const response = await fetch(`${GITHUB_API}/repos/${owner}/${name}`, {
    headers: headers(token),
  });

  if (!response.ok) {
    if (response.status === 404) throw new Error('Repository not found');
    throw new Error(`GitHub API error: ${response.status}`);
  }

  const data = await response.json();
  return {
    id: data.id,
    owner: data.owner.login,
    name: data.name,
    url: data.html_url,
    description: data.description || '',
    language: data.language || '',
    stars: data.stargazers_count,
  };
}

/**
 * Fetch beginner-friendly issues for a repository
 */
async function fetchIssues(owner, name, labels, token) {
  const allIssues = [];

  for (const label of labels) {
    const params = new URLSearchParams({
      labels: label,
      state: 'open',
      sort: 'created',
      direction: 'desc',
      per_page: '30',
    });

    try {
      const response = await fetch(
        `${GITHUB_API}/repos/${owner}/${name}/issues?${params}`,
        { headers: headers(token) },
      );

      if (!response.ok) continue;

      const data = await response.json();
      for (const issue of data) {
        // Skip pull requests (they appear in issues endpoint)
        if (issue.pull_request) continue;

        const existing = allIssues.find(i => i.id === issue.id);
        if (!existing) {
          allIssues.push({
            id: issue.id,
            number: issue.number,
            title: issue.title,
            url: issue.html_url,
            state: issue.state,
            createdAt: issue.created_at,
            updatedAt: issue.updated_at,
            comments: issue.comments,
            labels: issue.labels.map(l => ({
              name: l.name,
              color: l.color,
              description: l.description || '',
            })),
            repository: { owner, name },
            user: {
              login: issue.user.login,
              avatarUrl: issue.user.avatar_url,
            },
          });
        }
      }
    } catch {
      // Skip failed label fetches
    }
  }

  // Sort by creation date (newest first)
  allIssues.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return allIssues;
}

/**
 * Get rate limit info
 */
async function getRateLimit(token) {
  const response = await fetch(`${GITHUB_API}/rate_limit`, {
    headers: headers(token),
  });

  if (!response.ok) return null;

  const data = await response.json();
  return {
    remaining: data.rate.remaining,
    limit: data.rate.limit,
    reset: new Date(data.rate.reset * 1000),
  };
}

/**
 * Detect owner/name from a GitHub URL path
 */
function detectRepoFromUrl(url) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== 'github.com') return null;

    const parts = parsed.pathname.split('/').filter(Boolean);
    if (parts.length < 2) return null;

    // Exclude non-repo pages
    const nonRepoFirstSegments = [
      'settings',
      'notifications',
      'explore',
      'topics',
      'trending',
      'collections',
      'events',
      'sponsors',
      'login',
      'signup',
      'organizations',
      'orgs',
      'marketplace',
      'features',
      'enterprise',
      'pricing',
      'search',
    ];
    if (nonRepoFirstSegments.includes(parts[0])) return null;

    return { owner: parts[0], name: parts[1] };
  } catch {
    return null;
  }
}

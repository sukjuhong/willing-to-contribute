import { Octokit } from '@octokit/rest';

export interface UserProfile {
  username: string;
  top_languages: string[];
  starred_categories: string[];
  contributed_repos: string[];
}

export async function getTopLanguages(octokit: Octokit, username: string): Promise<string[]> {
  const { data: repos } = await octokit.repos.listForUser({
    username,
    type: 'owner',
    per_page: 100,
  });

  const langCount: Record<string, number> = {};
  for (const repo of repos) {
    if (repo.language) {
      langCount[repo.language] = (langCount[repo.language] || 0) + (repo.stargazers_count || 1);
    }
  }

  return Object.entries(langCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([lang]) => lang);
}

export async function getStarredCategories(
  octokit: Octokit,
  username: string,
): Promise<string[]> {
  const { data: starred } = await octokit.activity.listReposStarredByUser({
    username,
    per_page: 50,
  });

  const topicCount: Record<string, number> = {};
  for (const repo of starred) {
    const topics = (repo as unknown as { topics?: string[] }).topics ?? [];
    for (const topic of topics) {
      topicCount[topic] = (topicCount[topic] || 0) + 1;
    }
  }

  return Object.entries(topicCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([topic]) => topic);
}

export async function getContributedRepos(
  octokit: Octokit,
  username: string,
): Promise<string[]> {
  const { data: events } = await octokit.activity.listPublicEventsForUser({
    username,
    per_page: 100,
  });

  const repos = new Set<string>();
  for (const event of events) {
    if (event.type === 'PushEvent' || event.type === 'PullRequestEvent') {
      const repoName = event.repo.name;
      if (!repoName.startsWith(`${username}/`)) {
        repos.add(repoName);
      }
    }
  }

  return Array.from(repos);
}

export async function analyzeUserProfile(
  octokit: Octokit,
  username: string,
): Promise<UserProfile> {
  const [top_languages, starred_categories, contributed_repos] = await Promise.all([
    getTopLanguages(octokit, username),
    getStarredCategories(octokit, username),
    getContributedRepos(octokit, username),
  ]);

  return { username, top_languages, starred_categories, contributed_repos };
}

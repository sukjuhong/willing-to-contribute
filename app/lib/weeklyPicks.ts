import { Issue, Label, Repository } from '../types';
import { getServerOctokit } from '../api/recommended/serverOctokit';
import { calculateMaintainerScore } from '../api/recommended/maintainerScore';
import { cacheGet, cacheSet } from './cache';

const CACHE_KEY = 'weekly-picks';
const CACHE_TTL_SECONDS = 604800; // 1 week

const getFreshnessDate = (freshness: '1w' | '1m'): string => {
  const now = new Date();
  if (freshness === '1w') {
    now.setDate(now.getDate() - 7);
  } else {
    now.setMonth(now.getMonth() - 1);
  }
  return now.toISOString().split('T')[0];
};

const getWeekNumber = (date: Date): number => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
};

export interface WeeklyPicksData {
  issues: Issue[];
  weekNumber: number;
  year: number;
  generatedAt: string;
}

async function fetchIssuesFromGitHub(
  freshness: '1w' | '1m',
  limit: number,
): Promise<Issue[]> {
  const dateStr = getFreshnessDate(freshness);
  const query = `is:issue is:open label:"good first issue" stars:>500 pushed:>${dateStr}`;

  const octokit = await getServerOctokit();

  const { data } = await octokit.search.issuesAndPullRequests({
    q: query,
    sort: 'reactions',
    order: 'desc',
    per_page: limit,
  });

  const issues = await Promise.all(
    data.items.map(async item => {
      const repoUrl = item.repository_url;
      const parts = repoUrl.split('/');
      const repoName = parts[parts.length - 1];
      const repoOwner = parts[parts.length - 2];

      const maintainerScore = await calculateMaintainerScore(repoOwner, repoName);

      let stargazersCount: number | undefined;
      let forksCount: number | undefined;
      let repoLanguage: string | undefined;
      let lastPushedAt: string | undefined;
      let description: string | undefined;
      try {
        const { data: repoData } = await octokit.repos.get({
          owner: repoOwner,
          repo: repoName,
        });
        stargazersCount = repoData.stargazers_count;
        forksCount = repoData.forks_count;
        repoLanguage = repoData.language ?? undefined;
        lastPushedAt = repoData.pushed_at ?? undefined;
        description = repoData.description ?? undefined;
      } catch {
        // Continue without repo metadata
      }

      const repository: Repository = {
        id: `${repoOwner}/${repoName}`,
        owner: repoOwner,
        name: repoName,
        url: `https://github.com/${repoOwner}/${repoName}`,
        description,
        stargazersCount,
        forksCount,
        language: repoLanguage,
        lastPushedAt,
        maintainerScore,
      };

      const labels: Label[] = item.labels
        .filter(
          (
            l,
          ): l is {
            id: number;
            name: string;
            color: string;
            description: string | null;
            default: boolean;
            node_id: string;
            url: string;
          } => typeof l === 'object' && l !== null && 'name' in l,
        )
        .map(l => ({
          id: String(l.id ?? ''),
          name: l.name ?? '',
          color: l.color ?? '',
        }));

      const issue: Issue = {
        id: String(item.id),
        number: item.number,
        title: item.title,
        url: item.html_url,
        body: item.body ?? undefined,
        labels,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        state: item.state as 'open' | 'closed',
        repository,
        comments: item.comments,
        assignee: item.assignee?.login ?? null,
      };

      return issue;
    }),
  );

  return issues;
}

export async function getWeeklyPicks(): Promise<WeeklyPicksData> {
  const now = new Date();
  const weekNumber = getWeekNumber(now);
  const year = now.getFullYear();
  const weekCacheKey = `${CACHE_KEY}:${year}-W${weekNumber}`;

  const cached = await cacheGet<WeeklyPicksData>(weekCacheKey);
  if (cached) return cached;

  let issues = await fetchIssuesFromGitHub('1w', 10);

  // Fallback: if fewer than 5 issues, relax to 1 month freshness
  if (issues.length < 5) {
    issues = await fetchIssuesFromGitHub('1m', 10);
  }

  const result: WeeklyPicksData = {
    issues,
    weekNumber,
    year,
    generatedAt: now.toISOString(),
  };

  await cacheSet(weekCacheKey, result, CACHE_TTL_SECONDS);

  return result;
}

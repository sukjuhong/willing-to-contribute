import { NextResponse } from 'next/server';
import { Issue, Label, Repository } from '../../types';
import { estimateDifficulty } from './difficulty';
import { calculateMaintainerScore } from './maintainerScore';
import { getServerOctokit } from './serverOctokit';

interface CacheEntry {
  data: { issues: Issue[]; total: number };
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes
const MAX_CACHE_ENTRIES = 100;

const getFreshnessDate = (freshness: string): string => {
  const now = new Date();
  switch (freshness) {
    case '1w':
      now.setDate(now.getDate() - 7);
      break;
    case '1m':
      now.setMonth(now.getMonth() - 1);
      break;
    case '3m':
      now.setMonth(now.getMonth() - 3);
      break;
    case '6m':
      now.setMonth(now.getMonth() - 6);
      break;
    default:
      now.setMonth(now.getMonth() - 3);
  }
  return now.toISOString().split('T')[0];
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const language = searchParams.get('language') || '';
    const difficulties = searchParams.getAll('difficulty');
    const minStars = parseInt(searchParams.get('minStars') || '500', 10);
    const maxStarsRaw = parseInt(searchParams.get('maxStars') || '', 10);
    const maxStars = isNaN(maxStarsRaw) ? null : maxStarsRaw;
    const maintainerGrades = searchParams.getAll('maintainerGrade');
    const sort = searchParams.get('sort') || 'reactions-+1';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const freshness = searchParams.get('freshness') || '3m';
    const label = (searchParams.get('label') || '').replace(/"/g, '');
    const minForksRaw = parseInt(searchParams.get('minForks') || '', 10);
    const minForks = isNaN(minForksRaw) ? null : minForksRaw;
    const maxForksRaw = parseInt(searchParams.get('maxForks') || '', 10);
    const maxForks = isNaN(maxForksRaw) ? null : maxForksRaw;

    const cacheKey = JSON.stringify({
      language,
      difficulties,
      minStars,
      maxStars,
      maintainerGrades,
      sort,
      page,
      freshness,
      label,
      minForks,
      maxForks,
    });

    const cached = cache.get(cacheKey);
    if (cached && Date.now() < cached.expiresAt) {
      return NextResponse.json(cached.data);
    }

    const dateStr = getFreshnessDate(freshness);

    let query = `is:issue is:open label:"good first issue" stars:>${minStars} pushed:>${dateStr}`;
    if (maxStars) query += ` stars:<${maxStars}`;
    if (language) query += ` language:${language}`;
    if (label) query += ` label:"${label}"`;
    if (minForks) query += ` forks:>${minForks}`;
    if (maxForks) query += ` forks:<${maxForks}`;

    const sortParam =
      sort === 'reactions-+1'
        ? 'reactions-+1'
        : (sort as 'reactions' | 'created' | 'updated' | 'comments');

    const octokit = await getServerOctokit();

    const { data } = await octokit.search.issuesAndPullRequests({
      q: query,
      sort: sortParam === 'reactions-+1' ? 'reactions' : sortParam,
      order: 'desc',
      per_page: 20,
      page,
    });

    const issuesWithMeta = await Promise.all(
      data.items.map(async item => {
        const repoUrl = item.repository_url;
        const parts = repoUrl.split('/');
        const repoName = parts[parts.length - 1];
        const repoOwner = parts[parts.length - 2];

        const itemDifficulty = estimateDifficulty(
          item.labels
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
            .map(l => ({ name: l.name ?? '' })),
        );

        const maintainerScore = await calculateMaintainerScore(repoOwner, repoName);

        const repository: Repository = {
          id: `${repoOwner}/${repoName}`,
          owner: repoOwner,
          name: repoName,
          url: `https://github.com/${repoOwner}/${repoName}`,
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
          difficulty: itemDifficulty,
        };

        return { issue, maintainerScore };
      }),
    );

    let filtered = issuesWithMeta;

    if (difficulties.length > 0) {
      filtered = filtered.filter(
        ({ issue }) => issue.difficulty && difficulties.includes(issue.difficulty),
      );
    }

    if (maintainerGrades.length > 0) {
      filtered = filtered.filter(({ maintainerScore }) =>
        maintainerGrades.includes(maintainerScore.grade),
      );
    }

    const issues = filtered.map(({ issue }) => issue);
    const result = { issues, total: data.total_count };

    if (cache.size >= MAX_CACHE_ENTRIES) {
      const oldestKey = cache.keys().next().value;
      if (oldestKey) cache.delete(oldestKey);
    }
    cache.set(cacheKey, { data: result, expiresAt: Date.now() + CACHE_TTL_MS });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching recommended issues:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

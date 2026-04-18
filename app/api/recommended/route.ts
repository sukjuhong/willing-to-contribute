import { NextResponse } from 'next/server';
import { Issue, Label, Repository } from '../../types';
import { calculateMaintainerScore } from './maintainerScore';
import { calculateMatchScore } from '../../utils/skillMatcher';
import { calculateIssueQualityScore } from './issueQualityScore';
import { getServerOctokit } from './serverOctokit';
import { cacheGet, cacheSet } from '../../lib/cache';
import { createClient } from '@/app/lib/supabase/server';

const CACHE_TTL_SECONDS = 900;
const CACHE_VERSION = 'v2';
const RESULTS_PER_PAGE = 20;

type Octokit = Awaited<ReturnType<typeof getServerOctokit>>;
type SearchItem = Awaited<
  ReturnType<Octokit['search']['issuesAndPullRequests']>
>['data']['items'][number];

interface UserProfileContext {
  topLanguages: string[];
  topics: string[];
  contributedRepos: Set<string>;
  sessionUserId: string | null;
  isPersonalized: boolean;
}

interface SearchParams {
  language: string;
  labelPreset: string;
  minStars: number;
  maxStars: number | null;
  maintainerGrades: string[];
  sort: string;
  page: number;
  freshness: string;
  label: string;
  minForks: number | null;
  maxForks: number | null;
}

interface RepoMeta {
  stargazersCount?: number;
  forksCount?: number;
  language?: string;
  lastPushedAt?: string;
  description?: string;
}

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

async function loadUserProfile(): Promise<UserProfileContext> {
  const empty: UserProfileContext = {
    topLanguages: [],
    topics: [],
    contributedRepos: new Set(),
    sessionUserId: null,
    isPersonalized: false,
  };

  try {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return empty;

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('top_languages, contributed_repos, starred_categories')
      .eq('id', session.user.id)
      .maybeSingle<{
        top_languages: string[] | null;
        contributed_repos: string[] | null;
        starred_categories: string[] | null;
      }>();

    if (!profile) {
      return { ...empty, sessionUserId: session.user.id };
    }

    return {
      topLanguages: profile.top_languages ?? [],
      topics: profile.starred_categories ?? [],
      contributedRepos: new Set(profile.contributed_repos ?? []),
      sessionUserId: session.user.id,
      isPersonalized: true,
    };
  } catch {
    return empty;
  }
}

function parseSearchParams(
  searchParams: URLSearchParams,
  userTopLanguages: string[],
): SearchParams {
  const rawLanguage = searchParams.get('language') || '';
  const language =
    !rawLanguage && userTopLanguages.length > 0 ? userTopLanguages[0] : rawLanguage;

  const maxStarsRaw = parseInt(searchParams.get('maxStars') || '', 10);
  const minForksRaw = parseInt(searchParams.get('minForks') || '', 10);
  const maxForksRaw = parseInt(searchParams.get('maxForks') || '', 10);

  return {
    language,
    labelPreset: searchParams.get('labelPreset') || '',
    minStars: parseInt(searchParams.get('minStars') || '500', 10) || 500,
    maxStars: isNaN(maxStarsRaw) ? null : maxStarsRaw,
    maintainerGrades: searchParams.getAll('maintainerGrade'),
    sort: searchParams.get('sort') || 'reactions-+1',
    page: parseInt(searchParams.get('page') || '1', 10) || 1,
    freshness: searchParams.get('freshness') || '3m',
    label: (searchParams.get('label') || '').replace(/"/g, ''),
    minForks: isNaN(minForksRaw) ? null : minForksRaw,
    maxForks: isNaN(maxForksRaw) ? null : maxForksRaw,
  };
}

function buildSearchQuery(p: SearchParams): string {
  const dateStr = getFreshnessDate(p.freshness);
  const queryLabel = p.labelPreset || 'good first issue';
  let q = `is:issue is:open label:"${queryLabel}" stars:>${p.minStars} pushed:>${dateStr}`;
  if (p.maxStars) q += ` stars:<${p.maxStars}`;
  if (p.language) q += ` language:${p.language}`;
  if (p.label) q += ` label:"${p.label}"`;
  if (p.minForks) q += ` forks:>${p.minForks}`;
  if (p.maxForks) q += ` forks:<${p.maxForks}`;
  return q;
}

function parseRepoFromUrl(repositoryUrl: string): { owner: string; name: string } {
  const parts = repositoryUrl.split('/');
  return {
    name: parts[parts.length - 1],
    owner: parts[parts.length - 2],
  };
}

async function fetchRepoMeta(
  octokit: Octokit,
  owner: string,
  name: string,
): Promise<RepoMeta> {
  try {
    const { data } = await octokit.repos.get({ owner, repo: name });
    return {
      stargazersCount: data.stargazers_count,
      forksCount: data.forks_count,
      language: data.language ?? undefined,
      lastPushedAt: data.pushed_at ?? undefined,
      description: data.description ?? undefined,
    };
  } catch {
    return {};
  }
}

// Dedup repo lookups: many issues can share the same repo
async function buildRepoMetaCache(
  octokit: Octokit,
  items: SearchItem[],
): Promise<
  Map<
    string,
    {
      meta: RepoMeta;
      maintainerScore: Awaited<ReturnType<typeof calculateMaintainerScore>>;
    }
  >
> {
  const uniqueRepos = new Map<string, { owner: string; name: string }>();
  for (const item of items) {
    const { owner, name } = parseRepoFromUrl(item.repository_url);
    uniqueRepos.set(`${owner}/${name}`, { owner, name });
  }

  const cache = new Map<
    string,
    {
      meta: RepoMeta;
      maintainerScore: Awaited<ReturnType<typeof calculateMaintainerScore>>;
    }
  >();

  await Promise.all(
    Array.from(uniqueRepos.entries()).map(async ([key, { owner, name }]) => {
      const [meta, maintainerScore] = await Promise.all([
        fetchRepoMeta(octokit, owner, name),
        calculateMaintainerScore(owner, name),
      ]);
      cache.set(key, { meta, maintainerScore });
    }),
  );

  return cache;
}

function extractLabels(item: SearchItem): Label[] {
  return item.labels
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
}

function buildIssue(
  item: SearchItem,
  repoMeta: RepoMeta,
  maintainerScore: Awaited<ReturnType<typeof calculateMaintainerScore>>,
  profile: UserProfileContext,
): Issue {
  const { owner, name } = parseRepoFromUrl(item.repository_url);

  const repository: Repository = {
    id: `${owner}/${name}`,
    owner,
    name,
    url: `https://github.com/${owner}/${name}`,
    description: repoMeta.description,
    stargazersCount: repoMeta.stargazersCount,
    forksCount: repoMeta.forksCount,
    language: repoMeta.language,
    lastPushedAt: repoMeta.lastPushedAt,
    maintainerScore,
  };

  const labels = extractLabels(item);

  const matchScore = profile.isPersonalized
    ? calculateMatchScore({
        userLanguages: profile.topLanguages,
        userCategories: profile.topics,
        repoLanguage: repoMeta.language,
        issueLabels: labels.map(l => l.name),
      })
    : undefined;

  const qualityScore = calculateIssueQualityScore({
    body: item.body,
    comments: item.comments,
    assignees: item.assignees,
    assignee: item.assignee,
    labels: item.labels,
  });

  return {
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
    matchScore,
    qualityScore,
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const profile = await loadUserProfile();
    const params = parseSearchParams(searchParams, profile.topLanguages);

    const cacheKey = JSON.stringify({
      v: CACHE_VERSION,
      userId: profile.sessionUserId,
      ...params,
    });

    const cached = await cacheGet<{
      issues: Issue[];
      total: number;
      personalized: boolean;
    }>(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    const octokit = await getServerOctokit();
    const sortParam = params.sort as
      | 'reactions'
      | 'reactions-+1'
      | 'created'
      | 'updated'
      | 'comments';

    const { data } = await octokit.search.issuesAndPullRequests({
      q: buildSearchQuery(params),
      sort: sortParam,
      order: 'desc',
      per_page: RESULTS_PER_PAGE,
      page: params.page,
    });

    const repoCache = await buildRepoMetaCache(octokit, data.items);

    const allIssues = data.items.map(item => {
      const { owner, name } = parseRepoFromUrl(item.repository_url);
      const entry = repoCache.get(`${owner}/${name}`);
      return buildIssue(
        item,
        entry?.meta ?? {},
        entry?.maintainerScore ?? {
          grade: 'C',
          avgResponseTimeHours: 0,
          avgMergeTimeHours: 0,
          mergeRate: 0,
        },
        profile,
      );
    });

    let issues = allIssues;
    if (params.maintainerGrades.length > 0) {
      issues = issues.filter(
        i =>
          i.repository.maintainerScore &&
          params.maintainerGrades.includes(i.repository.maintainerScore.grade),
      );
    }

    if (profile.contributedRepos.size > 0) {
      issues = issues.filter(
        i => !profile.contributedRepos.has(`${i.repository.owner}/${i.repository.name}`),
      );
    }

    const result = {
      issues,
      total: data.total_count,
      personalized: profile.isPersonalized,
    };
    await cacheSet(cacheKey, result, CACHE_TTL_SECONDS);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching recommended issues:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

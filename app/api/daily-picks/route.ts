import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { Issue, Label, Repository } from '../../types';
import { calculateMaintainerScore } from '../recommended/maintainerScore';
import { calculateMatchScore } from '../../utils/skillMatcher';
import { calculateIssueQualityScore } from '../recommended/issueQualityScore';
import { getServerOctokit } from '../recommended/serverOctokit';
import { cacheGet, cacheSet } from '../../lib/cache';
import { createClient } from '@/app/lib/supabase/server';

const CACHE_TTL_SECONDS = 3600; // 1 hour — daily picks refresh once per hour max
const DAILY_COUNT = 5;

/**
 * FNV-1a 32-bit hash for deterministic seeding.
 * Returns a non-negative integer suitable for seeded shuffle.
 */
function fnv1a(str: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = (hash * 0x01000193) >>> 0;
  }
  return hash;
}

/**
 * Seeded pseudo-random number generator (mulberry32).
 * Returns a function that yields values in [0, 1).
 */
function seededRng(seed: number): () => number {
  let s = seed;
  return () => {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Fisher-Yates shuffle using a seeded RNG — deterministic for the same seed.
 */
function seededShuffle<T>(arr: T[], rng: () => number): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Personalization: load user profile if session exists
    let userTopLanguages: string[] = [];
    let userTopics: string[] = [];
    let userContributedRepos: Set<string> = new Set();
    let isPersonalized = false;
    let sessionUserId: string | null = null;

    try {
      const supabase = await createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        sessionUserId = session.user.id;
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('top_languages, contributed_repos, starred_categories')
          .eq('id', session.user.id)
          .maybeSingle<{
            top_languages: string[] | null;
            contributed_repos: string[] | null;
            starred_categories: string[] | null;
          }>();
        if (profile) {
          userTopLanguages = profile.top_languages ?? [];
          userTopics = profile.starred_categories ?? [];
          userContributedRepos = new Set(profile.contributed_repos ?? []);
          isPersonalized = true;
        }
      }
    } catch {
      // Session/profile fetch is best-effort — continue without personalization
    }

    // Daily seed: YYYY-MM-DD + user_id (or "guest" for anonymous users)
    const dateStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD in UTC
    const seedInput = `${dateStr}:${sessionUserId ?? 'guest'}`;
    const seedHash = crypto.createHash('sha256').update(seedInput).digest('hex');
    const seed = fnv1a(seedHash);

    // Language from profile or query param
    const rawLanguage = searchParams.get('language') || '';
    const language =
      !rawLanguage && userTopLanguages.length > 0 ? userTopLanguages[0] : rawLanguage;

    const cacheKey = JSON.stringify({
      v: 'daily-v1',
      userId: sessionUserId,
      date: dateStr,
      language,
    });

    const cached = await cacheGet<{
      issues: Issue[];
      total: number;
      personalized: boolean;
    }>(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    // Fetch candidates: A/B grade maintainer repos, unassigned, recent 1 month
    const now = new Date();
    now.setMonth(now.getMonth() - 1);
    const freshnessCutoff = now.toISOString().split('T')[0];

    let query = `is:issue is:open label:"good first issue" no:assignee stars:>500 pushed:>${freshnessCutoff}`;
    if (language) query += ` language:${language}`;

    const octokit = await getServerOctokit();

    const { data } = await octokit.search.issuesAndPullRequests({
      q: query,
      sort: 'reactions',
      order: 'desc',
      per_page: 30,
      page: 1,
    });

    const issuesWithMeta = await Promise.all(
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

        const matchScore = isPersonalized
          ? calculateMatchScore({
              userLanguages: userTopLanguages,
              userCategories: userTopics,
              repoLanguage,
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
          matchScore,
          qualityScore,
        };

        return { issue, maintainerScore };
      }),
    );

    // Filter: only A/B grade maintainers
    let filtered = issuesWithMeta.filter(({ maintainerScore }) =>
      ['A', 'B'].includes(maintainerScore.grade),
    );

    // Fallback to all if not enough after filter
    if (filtered.length < DAILY_COUNT) {
      filtered = issuesWithMeta;
    }

    let issues = filtered.map(({ issue }) => issue);

    // Exclude repos the user has already contributed to
    if (userContributedRepos.size > 0) {
      const filtered2 = issues.filter(
        issue =>
          !userContributedRepos.has(`${issue.repository.owner}/${issue.repository.name}`),
      );
      if (filtered2.length >= DAILY_COUNT) issues = filtered2;
    }

    // Deterministic daily shuffle + pick top N
    const rng = seededRng(seed);
    const shuffled = seededShuffle(issues, rng);
    const dailyIssues = shuffled.slice(0, DAILY_COUNT);

    const result = {
      issues: dailyIssues,
      total: dailyIssues.length,
      personalized: isPersonalized,
      date: dateStr,
    };

    await cacheSet(cacheKey, result, CACHE_TTL_SECONDS);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching daily picks:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

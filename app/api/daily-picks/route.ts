import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { Issue, Label, Repository } from '../../types';
import { calculateMaintainerScore } from '../recommended/maintainerScore';
import { calculateMatchScore } from '../../utils/skillMatcher';
import { calculateIssueQualityScore } from '../recommended/issueQualityScore';
import { getServerOctokit } from '../recommended/serverOctokit';
import { cacheGet, cacheSet } from '../../lib/cache';
import { createClient } from '@/app/lib/supabase/server';

const POOL_CACHE_TTL_SECONDS = 3600; // 1 hour: shared candidate pool
const DAILY_COUNT = 5;
const SCORING_CONCURRENCY = 5;

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

type PoolCandidate = {
  issue: Issue;
  maintainerGrade: string;
};

/**
 * Candidate pool is shared across all users for a given (date, language).
 * Per-user filtering (contributed repos, matchScore) and shuffling happens on top.
 */
async function loadCandidatePool(
  language: string,
  dateStr: string,
): Promise<PoolCandidate[]> {
  const poolCacheKey = `daily-pool-v1:${dateStr}:${language || 'any'}`;
  const cached = await cacheGet<PoolCandidate[]>(poolCacheKey);
  if (cached) return cached;

  const now = new Date();
  now.setMonth(now.getMonth() - 1);
  const freshnessCutoff = now.toISOString().split('T')[0];

  let q = `is:issue is:open label:"good first issue" no:assignee stars:>500 pushed:>${freshnessCutoff}`;
  if (language) q += ` language:${language}`;

  const octokit = await getServerOctokit();
  const { data } = await octokit.search.issuesAndPullRequests({
    q,
    sort: 'reactions',
    order: 'desc',
    per_page: 30,
    page: 1,
  });

  const items = data.items;
  const candidates: PoolCandidate[] = [];

  // Concurrency-limited scoring to avoid GitHub secondary rate limits.
  // Rely on the `stars:>500` query filter for repo quality — skip octokit.repos.get.
  for (let i = 0; i < items.length; i += SCORING_CONCURRENCY) {
    const batch = items.slice(i, i + SCORING_CONCURRENCY);
    const batchResults = await Promise.all(
      batch.map(async item => {
        const parts = item.repository_url.split('/');
        const repoName = parts[parts.length - 1];
        const repoOwner = parts[parts.length - 2];

        const maintainerScore = await calculateMaintainerScore(repoOwner, repoName);

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

        const qualityScore = calculateIssueQualityScore({
          body: item.body,
          comments: item.comments,
          assignees: item.assignees,
          assignee: item.assignee,
          labels: item.labels,
        });

        const repository: Repository = {
          id: `${repoOwner}/${repoName}`,
          owner: repoOwner,
          name: repoName,
          url: `https://github.com/${repoOwner}/${repoName}`,
          maintainerScore,
        };

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
          qualityScore,
        };

        return { issue, maintainerGrade: maintainerScore.grade };
      }),
    );
    candidates.push(...batchResults);
  }

  await cacheSet(poolCacheKey, candidates, POOL_CACHE_TTL_SECONDS);
  return candidates;
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
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        sessionUserId = user.id;
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('top_languages, contributed_repos, starred_categories')
          .eq('id', user.id)
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

    const rawLanguage = searchParams.get('language') || '';
    const language =
      !rawLanguage && userTopLanguages.length > 0 ? userTopLanguages[0] : rawLanguage;

    // Shared candidate pool — cached by (date, language), not by user
    const pool = await loadCandidatePool(language, dateStr);

    // Filter: A/B grade maintainers, fallback to all if too few
    let filteredCandidates = pool.filter(c => ['A', 'B'].includes(c.maintainerGrade));
    if (filteredCandidates.length < DAILY_COUNT) {
      filteredCandidates = pool;
    }

    // User-specific decoration: matchScore is computed per request against the shared pool
    let issues: Issue[] = filteredCandidates.map(({ issue }) => {
      if (!isPersonalized) return issue;
      const matchScore = calculateMatchScore({
        userLanguages: userTopLanguages,
        userCategories: userTopics,
        repoLanguage: issue.repository.language,
        issueLabels: issue.labels.map(l => l.name),
      });
      return { ...issue, matchScore };
    });

    // Exclude repos the user already contributed to
    if (userContributedRepos.size > 0) {
      const pruned = issues.filter(
        issue =>
          !userContributedRepos.has(`${issue.repository.owner}/${issue.repository.name}`),
      );
      if (pruned.length >= DAILY_COUNT) issues = pruned;
    }

    // Deterministic daily shuffle + top N
    const rng = seededRng(seed);
    const shuffled = seededShuffle(issues, rng);
    const dailyIssues = shuffled.slice(0, DAILY_COUNT);

    return NextResponse.json({
      issues: dailyIssues,
      total: dailyIssues.length,
      personalized: isPersonalized,
      date: dateStr,
    });
  } catch (error) {
    console.error('Error fetching daily picks:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { Issue, Label, Repository } from '../../types';
import { calculateMaintainerScore } from './maintainerScore';
import { calculateMatchScore } from '../../utils/skillMatcher';
import { calculateIssueQualityScore } from './issueQualityScore';
import { getServerOctokit } from './serverOctokit';
import { cacheGet, cacheSet } from '../../lib/cache';
import { createClient } from '@/app/lib/supabase/server';

const CACHE_TTL_SECONDS = 900; // 15 minutes
const CACHE_VERSION = 'v2'; // bump when response shape changes (added qualityScore)

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

    // Auto-inject language from profile if not explicitly set
    const rawLanguage = searchParams.get('language') || '';
    const language =
      !rawLanguage && userTopLanguages.length > 0 ? userTopLanguages[0] : rawLanguage;
    const labelPreset = searchParams.get('labelPreset') || '';
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
      v: CACHE_VERSION,
      userId: sessionUserId,
      language,
      labelPreset,
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

    const cached = await cacheGet<{ issues: Issue[]; total: number }>(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    const dateStr = getFreshnessDate(freshness);

    const queryLabel = labelPreset || 'good first issue';
    let query = `is:issue is:open label:"${queryLabel}" stars:>${minStars} pushed:>${dateStr}`;
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

        const maintainerScore = await calculateMaintainerScore(repoOwner, repoName);

        // Fetch repo details for metadata
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

    let filtered = issuesWithMeta;

    if (maintainerGrades.length > 0) {
      filtered = filtered.filter(({ maintainerScore }) =>
        maintainerGrades.includes(maintainerScore.grade),
      );
    }

    let issues = filtered.map(({ issue }) => issue);

    // Exclude issues from repos the user has already contributed to
    if (userContributedRepos.size > 0) {
      issues = issues.filter(
        issue =>
          !userContributedRepos.has(`${issue.repository.owner}/${issue.repository.name}`),
      );
    }

    const result = { issues, total: data.total_count, personalized: isPersonalized };

    await cacheSet(cacheKey, result, CACHE_TTL_SECONDS);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching recommended issues:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

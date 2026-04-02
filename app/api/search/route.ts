import { NextResponse } from 'next/server';
import { Octokit } from '@octokit/rest';
import { Issue, Label, Repository } from '../../types';
import { estimateDifficulty } from '../recommended/difficulty';
import { cacheGet, cacheSet } from '../../lib/cache';

const CACHE_TTL_SECONDS = 300; // 5 minutes

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const type = searchParams.get('type');
    const q = searchParams.get('q');
    const language = searchParams.get('language') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);

    if (!type || !q) {
      return NextResponse.json(
        { error: 'Missing required parameters: type and q' },
        { status: 400 },
      );
    }

    if (type !== 'issues' && type !== 'repos') {
      return NextResponse.json(
        { error: 'Parameter type must be "issues" or "repos"' },
        { status: 400 },
      );
    }

    const authHeader = request.headers.get('Authorization');
    const userToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    const octokit = new Octokit({ auth: userToken || undefined });

    const cacheKey = JSON.stringify({
      type,
      q,
      language,
      page,
      authenticated: !!userToken,
    });
    const cached = await cacheGet<{ results: Issue[] | Repository[]; total: number }>(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    let result: { results: Issue[] | Repository[]; total: number };

    if (type === 'repos') {
      let query = q;
      if (language) query += ` language:${language}`;

      const { data } = await octokit.search.repos({
        q: query,
        sort: 'stars',
        order: 'desc',
        per_page: 10,
        page,
      });

      const repositories: Repository[] = data.items.map(item => ({
        id: String(item.id),
        owner: item.owner?.login ?? '',
        name: item.name,
        url: item.html_url,
        description: item.description ?? undefined,
        stargazersCount: item.stargazers_count,
        language: item.language ?? undefined,
        forksCount: item.forks_count,
        openIssuesCount: item.open_issues_count,
        lastPushedAt: item.pushed_at ?? undefined,
      }));

      result = { results: repositories, total: data.total_count };
    } else {
      let query = `${q} is:issue is:open label:"good first issue"`;
      if (language) query += ` language:${language}`;

      const { data } = await octokit.search.issuesAndPullRequests({
        q: query,
        sort: 'reactions',
        order: 'desc',
        per_page: 10,
        page,
      });

      const issues: Issue[] = data.items.map(item => {
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

        const repository: Repository = {
          id: `${repoOwner}/${repoName}`,
          owner: repoOwner,
          name: repoName,
          url: `https://github.com/${repoOwner}/${repoName}`,
        };

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
          difficulty: itemDifficulty,
        };
      });

      result = { results: issues, total: data.total_count };
    }

    await cacheSet(cacheKey, result, CACHE_TTL_SECONDS);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error handling search request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

import { MetadataRoute } from 'next';
import { createClient } from '@/app/lib/supabase/server';

const BASE_URL = 'https://pickssue.dev';

interface PickedIssueCountRow {
  repository_owner: string;
  repository_name: string;
  pick_count: number;
}

async function getTopPickedRepos(
  limit = 100,
): Promise<{ owner: string; name: string }[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('picked_issues_counts')
      .select('repository_owner, repository_name, pick_count')
      .order('pick_count', { ascending: false })
      .limit(limit * 5);

    if (!data) return [];

    const seen = new Set<string>();
    const repos: { owner: string; name: string }[] = [];
    for (const row of data as PickedIssueCountRow[]) {
      const key = `${row.repository_owner}/${row.repository_name}`;
      if (!seen.has(key)) {
        seen.add(key);
        repos.push({ owner: row.repository_owner, name: row.repository_name });
        if (repos.length >= limit) break;
      }
    }
    return repos;
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = BASE_URL;
  const topRepos = await getTopPickedRepos(100);

  const repoEntries: MetadataRoute.Sitemap = topRepos.map(({ owner, name }) => ({
    url: `${baseUrl}/repos/${owner}/${name}`,
    changeFrequency: 'daily',
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/guide`,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/faq`,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy`,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    ...repoEntries,
  ];
}

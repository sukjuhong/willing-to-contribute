import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { createClient } from '@/app/lib/supabase/server';
import { MaintainerScore } from '@/app/types';
import RepoLandingClient from './RepoLandingClient';

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ owner: string; name: string }>;
}

interface PickedIssueRow {
  issue_url: string;
  issue_number: number;
  title: string;
  labels: unknown;
  pick_count: number;
  repository_owner: string;
  repository_name: string;
}

interface IssueTipRow {
  id: string;
  issue_url: string;
  content: string;
  like_count: number;
  created_at: string;
}

export interface RepoIssue {
  issueUrl: string;
  issueNumber: number;
  title: string;
  labels: { id: string; name: string; color: string }[];
  pickCount: number;
}

export interface RepoTip {
  id: string;
  issueUrl: string;
  content: string;
  likeCount: number;
  createdAt: string;
}

export interface MaintainerScoreData extends MaintainerScore {
  owner: string;
  repo: string;
}

async function fetchMaintainerScore(
  owner: string,
  repo: string,
): Promise<MaintainerScoreData | null> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://pickssue.dev';
  try {
    const res = await fetch(`${baseUrl}/api/v1/score/${owner}/${repo}`, {
      next: { revalidate: 21600 },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      owner: string;
      repo: string;
      grade: 'A' | 'B' | 'C';
      avgResponseTimeHours: number;
      avgMergeTimeHours: number;
      mergeRate: number;
    };
    return {
      owner: data.owner,
      repo: data.repo,
      grade: data.grade,
      avgResponseTimeHours: data.avgResponseTimeHours,
      avgMergeTimeHours: data.avgMergeTimeHours,
      mergeRate: data.mergeRate,
    };
  } catch {
    return null;
  }
}

async function fetchRepoData(owner: string, repoName: string) {
  const supabase = await createClient();

  // Fetch top issues by pick count
  const { data: issuesData } = await supabase
    .from('picked_issues_counts')
    .select('issue_url, repository_owner, repository_name, title, pick_count')
    .eq('repository_owner', owner)
    .eq('repository_name', repoName)
    .order('pick_count', { ascending: false })
    .limit(20);

  // Fetch visible tips for this repo's issues
  // We get all issue_urls for this repo first, then fetch tips
  const issueUrls = (issuesData as PickedIssueRow[] | null)?.map(r => r.issue_url) ?? [];

  let tipsData: IssueTipRow[] = [];
  if (issueUrls.length > 0) {
    const { data } = await supabase
      .from('issue_tips')
      .select('id, issue_url, content, like_count, created_at')
      .in('issue_url', issueUrls)
      .is('hidden_at', null)
      .order('like_count', { ascending: false })
      .limit(50);
    tipsData = (data as IssueTipRow[] | null) ?? [];
  }

  // Also fetch tips for issues not in picked list (by repo URL pattern)
  if (issueUrls.length === 0) {
    const repoUrlPattern = `https://github.com/${owner}/${repoName}/issues/`;
    const { data } = await supabase
      .from('issue_tips')
      .select('id, issue_url, content, like_count, created_at')
      .like('issue_url', `${repoUrlPattern}%`)
      .is('hidden_at', null)
      .order('like_count', { ascending: false })
      .limit(50);
    tipsData = (data as IssueTipRow[] | null) ?? [];
  }

  const issues: RepoIssue[] = ((issuesData as PickedIssueRow[] | null) ?? []).map(r => ({
    issueUrl: r.issue_url,
    issueNumber: Number(r.issue_url.split('/').pop() ?? r.issue_number ?? 0),
    title: r.title,
    labels: [],
    pickCount: Number(r.pick_count),
  }));

  const tips: RepoTip[] = tipsData.map(r => ({
    id: r.id,
    issueUrl: r.issue_url,
    content: r.content,
    likeCount: r.like_count,
    createdAt: r.created_at,
  }));

  return { issues, tips };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { owner, name } = await params;
  const t = await getTranslations('repoLanding');

  const title = t('metaTitle', { owner, name });
  const description = t('metaDescription', { owner, name });

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `/repos/${owner}/${name}`,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
    alternates: {
      canonical: `/repos/${owner}/${name}`,
    },
  };
}

export default async function RepoLandingPage({ params }: PageProps) {
  const { owner, name } = await params;

  const [{ issues, tips }, maintainerScore] = await Promise.all([
    fetchRepoData(owner, name),
    fetchMaintainerScore(owner, name),
  ]);

  // If no data at all, show 404
  if (issues.length === 0 && tips.length === 0 && !maintainerScore) {
    notFound();
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareSourceCode',
    name: `${owner}/${name}`,
    codeRepository: `https://github.com/${owner}/${name}`,
    url: `https://pickssue.dev/repos/${owner}/${name}`,
    description: `Beginner-friendly issues, contributor tips, and maintainer responsiveness score for ${owner}/${name}.`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <RepoLandingClient
        owner={owner}
        name={name}
        issues={issues}
        tips={tips}
        maintainerScore={maintainerScore}
      />
    </>
  );
}

import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { createClient } from '@/app/lib/supabase/server';
import { calculateMaintainerScore } from '@/app/api/recommended/maintainerScore';
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
  try {
    const score = await calculateMaintainerScore(owner, repo);
    return {
      owner,
      repo,
      grade: score.grade,
      avgResponseTimeHours: score.avgResponseTimeHours,
      avgMergeTimeHours: score.avgMergeTimeHours,
      mergeRate: score.mergeRate,
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
    .select(
      'issue_url, issue_number, repository_owner, repository_name, title, pick_count',
    )
    .eq('repository_owner', owner)
    .eq('repository_name', repoName)
    .order('pick_count', { ascending: false })
    .limit(20);

  // Fetch all visible tips for this repo (by repo URL pattern) regardless of pick state
  const repoUrlPattern = `https://github.com/${owner}/${repoName}/issues/`;
  const { data: tipsRaw } = await supabase
    .from('issue_tips')
    .select('id, issue_url, content, like_count, created_at')
    .like('issue_url', `${repoUrlPattern}%`)
    .is('hidden_at', null)
    .order('like_count', { ascending: false })
    .limit(50);
  const tipsData: IssueTipRow[] = (tipsRaw as IssueTipRow[] | null) ?? [];

  const issues: RepoIssue[] = ((issuesData as PickedIssueRow[] | null) ?? []).map(r => ({
    issueUrl: r.issue_url,
    issueNumber: Number(
      r.issue_number ?? r.issue_url.replace(/\/$/, '').split('/').pop() ?? 0,
    ),
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

  // If there's no Pickssue-unique data for this repo, show 404.
  // maintainerScore is always truthy due to FALLBACK_SCORE in calculateMaintainerScore,
  // so only issues/tips determine whether the repo is worth a landing page.
  if (issues.length === 0 && tips.length === 0) {
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
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
        }}
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

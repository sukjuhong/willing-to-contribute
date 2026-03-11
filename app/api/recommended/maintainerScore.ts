import { MaintainerScore } from '../../types';
import { getServerOctokit } from './serverOctokit';

interface CacheEntry {
  score: MaintainerScore;
  expiresAt: number;
}

export const maintainerScoreCache = new Map<string, CacheEntry>();

const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

const FALLBACK_SCORE: MaintainerScore = {
  grade: 'C',
  avgResponseTimeHours: 0,
  avgMergeTimeHours: 0,
  mergeRate: 0,
};

const hoursBetween = (start: string, end: string): number => {
  const diffMs = new Date(end).getTime() - new Date(start).getTime();
  return diffMs / (1000 * 60 * 60);
};

export const getCachedMaintainerScore = (
  owner: string,
  repo: string,
): MaintainerScore | null => {
  const key = `${owner}/${repo}`;
  const entry = maintainerScoreCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    maintainerScoreCache.delete(key);
    return null;
  }
  return entry.score;
};

export const calculateMaintainerScore = async (
  owner: string,
  repo: string,
): Promise<MaintainerScore> => {
  const cached = getCachedMaintainerScore(owner, repo);
  if (cached) return cached;

  try {
    const octokit = await getServerOctokit();

    // Fetch last 20 issues with comments to calculate avg response time
    const { data: issues } = await octokit.issues.listForRepo({
      owner,
      repo,
      state: 'closed',
      per_page: 20,
      sort: 'updated',
      direction: 'desc',
    });

    let totalResponseHours = 0;
    let responseCount = 0;

    await Promise.all(
      issues.map(async issue => {
        if (issue.pull_request) return;
        try {
          const { data: comments } = await octokit.issues.listComments({
            owner,
            repo,
            issue_number: issue.number,
            per_page: 1,
          });
          if (comments.length > 0) {
            totalResponseHours += hoursBetween(issue.created_at, comments[0].created_at);
            responseCount++;
          }
        } catch {
          // skip individual issue errors
        }
      }),
    );

    const avgResponseTimeHours =
      responseCount > 0 ? totalResponseHours / responseCount : 0;

    // Fetch last 20 merged PRs for avg merge time
    const { data: mergedPRs } = await octokit.pulls.list({
      owner,
      repo,
      state: 'closed',
      per_page: 20,
      sort: 'updated',
      direction: 'desc',
    });

    const merged = mergedPRs.filter(pr => pr.merged_at != null);
    const totalMergeHours = merged.reduce(
      (sum, pr) => sum + hoursBetween(pr.created_at, pr.merged_at!),
      0,
    );
    const avgMergeTimeHours = merged.length > 0 ? totalMergeHours / merged.length : 0;

    // Fetch last 50 closed PRs for merge rate
    const { data: closedPRs } = await octokit.pulls.list({
      owner,
      repo,
      state: 'closed',
      per_page: 50,
      sort: 'updated',
      direction: 'desc',
    });

    const mergedCount = closedPRs.filter(pr => pr.merged_at != null).length;
    const mergeRate = closedPRs.length > 0 ? mergedCount / closedPRs.length : 0;

    // Grade calculation
    let grade: 'A' | 'B' | 'C';
    if (avgResponseTimeHours < 24 && mergeRate > 0.7) {
      grade = 'A';
    } else if (avgResponseTimeHours < 72 && mergeRate > 0.5) {
      grade = 'B';
    } else {
      grade = 'C';
    }

    const score: MaintainerScore = {
      grade,
      avgResponseTimeHours,
      avgMergeTimeHours,
      mergeRate,
    };

    maintainerScoreCache.set(`${owner}/${repo}`, {
      score,
      expiresAt: Date.now() + CACHE_TTL_MS,
    });

    return score;
  } catch (error) {
    console.error(`Error calculating maintainer score for ${owner}/${repo}:`, error);
    return FALLBACK_SCORE;
  }
};

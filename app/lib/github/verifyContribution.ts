import { Octokit } from '@octokit/rest';

export interface ContributionVerification {
  verified: boolean;
  closingPrUrl?: string;
  closingPrAuthor?: string;
}

interface TimelineEvent {
  event?: string;
  commit_id?: string | null;
  source?: {
    type?: string;
    issue?: {
      pull_request?: {
        html_url?: string;
        merged_at?: string | null;
      };
      html_url?: string;
      user?: { login?: string } | null;
      state?: string;
    };
  };
}

/**
 * Parse owner, repo, and issue number from a GitHub issue URL.
 * Returns null if the URL doesn't match the expected shape.
 */
export function parseIssueUrl(
  url: string,
): { owner: string; repo: string; issueNumber: number } | null {
  try {
    const match = url.match(
      /github\.com\/([^\/]+)\/([^\/]+)\/issues\/(\d+)(?:[\/?#].*)?$/,
    );
    if (!match) return null;
    const issueNumber = Number(match[3]);
    if (!Number.isFinite(issueNumber)) return null;
    return { owner: match[1], repo: match[2], issueNumber };
  } catch {
    return null;
  }
}

/**
 * Examine timeline events for a closing PR authored by `userLogin`.
 * Exported for unit testing. Input is the raw Octokit timeline payload.
 */
export function findClosingPrInTimeline(
  events: TimelineEvent[],
  userLogin: string,
): ContributionVerification {
  const target = userLogin.toLowerCase();

  // 1. Prefer `cross-referenced` events whose source PR is merged + authored by user.
  //    GitHub fires this when a PR body contains "Fixes #N" / "Closes #N".
  for (const ev of events) {
    if (ev.event !== 'cross-referenced') continue;
    const src = ev.source?.issue;
    if (!src?.pull_request) continue;
    if (!src.pull_request.merged_at) continue;
    const author = src.user?.login;
    if (author && author.toLowerCase() === target) {
      return {
        verified: true,
        closingPrUrl: src.pull_request.html_url ?? src.html_url,
        closingPrAuthor: author,
      };
    }
  }

  // 2. Fallback: `closed` event carrying a commit_id does not, on its own,
  //    tell us the PR author. Without a linked PR we cannot verify authorship,
  //    so we return unverified rather than guess.
  return { verified: false };
}

type OctokitLike = Pick<Octokit, 'issues'>;

/**
 * Fetch the issue timeline and determine whether `userLogin` closed the issue
 * via their own merged PR.
 *
 * Must never throw — GitHub 404s, rate limits, and network errors all resolve
 * to `{ verified: false }` so the caller's refresh loop stays resilient.
 */
export async function verifyContributionForIssue(
  issueUrl: string,
  userLogin: string,
  accessToken?: string,
  octokitOverride?: OctokitLike,
): Promise<ContributionVerification> {
  if (!userLogin) return { verified: false };
  const parsed = parseIssueUrl(issueUrl);
  if (!parsed) return { verified: false };

  const octokit: OctokitLike =
    octokitOverride ?? new Octokit(accessToken ? { auth: accessToken } : undefined);

  try {
    // `listEventsForTimeline` returns the full activity feed including
    // cross-referenced PRs (pagination rarely needed for small issues,
    // but we cap at 100 to match other calls in this codebase).
    const { data } = await octokit.issues.listEventsForTimeline({
      owner: parsed.owner,
      repo: parsed.repo,
      issue_number: parsed.issueNumber,
      per_page: 100,
      mediaType: {
        previews: ['mockingbird'],
      },
    });

    return findClosingPrInTimeline(data as TimelineEvent[], userLogin);
  } catch (err) {
    // 404 (private/deleted), 403 (rate limit), 5xx, network — all treated as
    // "can't verify right now, try again next refresh cycle".
    console.error('[verifyContribution] timeline fetch failed:', err);
    return { verified: false };
  }
}

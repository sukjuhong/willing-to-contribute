import { describe, it, expect, vi } from 'vitest';

import {
  parseIssueUrl,
  findClosingPrInTimeline,
  verifyContributionForIssue,
} from '@/app/lib/github/verifyContribution';

// -------------------------
// parseIssueUrl
// -------------------------
describe('parseIssueUrl', () => {
  it('parses a standard GitHub issue URL', () => {
    expect(parseIssueUrl('https://github.com/facebook/react/issues/123')).toEqual({
      owner: 'facebook',
      repo: 'react',
      issueNumber: 123,
    });
  });

  it('parses an issue URL with trailing slash', () => {
    expect(parseIssueUrl('https://github.com/facebook/react/issues/42/')).toEqual({
      owner: 'facebook',
      repo: 'react',
      issueNumber: 42,
    });
  });

  it('parses an issue URL with query string', () => {
    expect(parseIssueUrl('https://github.com/facebook/react/issues/42?foo=bar')).toEqual({
      owner: 'facebook',
      repo: 'react',
      issueNumber: 42,
    });
  });

  it('returns null for a PR URL', () => {
    expect(parseIssueUrl('https://github.com/facebook/react/pull/99')).toBeNull();
  });

  it('returns null for a malformed URL', () => {
    expect(parseIssueUrl('not-a-url')).toBeNull();
    expect(parseIssueUrl('')).toBeNull();
  });
});

// -------------------------
// findClosingPrInTimeline
// -------------------------
describe('findClosingPrInTimeline', () => {
  const mergedCrossRef = (author: string) => ({
    event: 'cross-referenced',
    source: {
      type: 'issue',
      issue: {
        pull_request: {
          html_url: `https://github.com/owner/repo/pull/7`,
          merged_at: '2026-04-01T00:00:00Z',
        },
        html_url: `https://github.com/owner/repo/pull/7`,
        user: { login: author },
        state: 'closed',
      },
    },
  });

  it('verifies contribution when a merged PR by the user closed the issue', () => {
    const events = [mergedCrossRef('octocat')];
    expect(findClosingPrInTimeline(events, 'octocat')).toEqual({
      verified: true,
      closingPrUrl: 'https://github.com/owner/repo/pull/7',
      closingPrAuthor: 'octocat',
    });
  });

  it('matches case-insensitively on author login', () => {
    const events = [mergedCrossRef('OctoCat')];
    expect(findClosingPrInTimeline(events, 'octocat').verified).toBe(true);
  });

  it('does not verify when the closing PR was authored by someone else', () => {
    const events = [mergedCrossRef('another-user')];
    expect(findClosingPrInTimeline(events, 'octocat')).toEqual({ verified: false });
  });

  it('does not verify when the referenced PR is not merged', () => {
    const events = [
      {
        event: 'cross-referenced',
        source: {
          type: 'issue',
          issue: {
            pull_request: {
              html_url: 'https://github.com/owner/repo/pull/8',
              merged_at: null,
            },
            html_url: 'https://github.com/owner/repo/pull/8',
            user: { login: 'octocat' },
            state: 'open',
          },
        },
      },
    ];
    expect(findClosingPrInTimeline(events, 'octocat')).toEqual({ verified: false });
  });

  it('ignores cross-referenced events that are issues (not PRs)', () => {
    const events = [
      {
        event: 'cross-referenced',
        source: {
          type: 'issue',
          issue: {
            // No pull_request field — just another issue referencing this one
            html_url: 'https://github.com/owner/repo/issues/9',
            user: { login: 'octocat' },
            state: 'open',
          },
        },
      },
    ];
    expect(findClosingPrInTimeline(events, 'octocat')).toEqual({ verified: false });
  });

  it('returns unverified for a closed event with a commit_id but no linked PR', () => {
    // We cannot infer PR authorship from a raw commit, so we refuse to verify.
    const events = [
      {
        event: 'closed',
        commit_id: 'deadbeef',
      },
    ];
    expect(findClosingPrInTimeline(events, 'octocat')).toEqual({ verified: false });
  });

  it('picks the user-authored PR when multiple cross-references exist', () => {
    const events = [
      mergedCrossRef('some-bot'),
      mergedCrossRef('octocat'),
      mergedCrossRef('another-user'),
    ];
    expect(findClosingPrInTimeline(events, 'octocat').verified).toBe(true);
  });

  it('returns unverified for an empty timeline', () => {
    expect(findClosingPrInTimeline([], 'octocat')).toEqual({ verified: false });
  });
});

// -------------------------
// verifyContributionForIssue (integration with mocked Octokit)
// -------------------------
describe('verifyContributionForIssue', () => {
  const mkOctokit = (mock: ReturnType<typeof vi.fn>) =>
    ({ issues: { listEventsForTimeline: mock } }) as never;

  it('returns unverified without calling the API when userLogin is empty', async () => {
    const listEventsForTimeline = vi.fn();
    const result = await verifyContributionForIssue(
      'https://github.com/o/r/issues/1',
      '',
      undefined,
      mkOctokit(listEventsForTimeline),
    );
    expect(result).toEqual({ verified: false });
    expect(listEventsForTimeline).not.toHaveBeenCalled();
  });

  it('returns unverified for a malformed issue URL', async () => {
    const listEventsForTimeline = vi.fn();
    const result = await verifyContributionForIssue(
      'not-a-url',
      'octocat',
      undefined,
      mkOctokit(listEventsForTimeline),
    );
    expect(result).toEqual({ verified: false });
    expect(listEventsForTimeline).not.toHaveBeenCalled();
  });

  it('swallows API errors and returns unverified (rate limit, 404, etc.)', async () => {
    const listEventsForTimeline = vi.fn().mockRejectedValue({ status: 403 });
    const result = await verifyContributionForIssue(
      'https://github.com/o/r/issues/1',
      'octocat',
      undefined,
      mkOctokit(listEventsForTimeline),
    );
    expect(result).toEqual({ verified: false });
  });

  it('returns verified when API returns a merged PR by the user', async () => {
    const listEventsForTimeline = vi.fn().mockResolvedValue({
      data: [
        {
          event: 'cross-referenced',
          source: {
            type: 'issue',
            issue: {
              pull_request: {
                html_url: 'https://github.com/o/r/pull/2',
                merged_at: '2026-04-01T00:00:00Z',
              },
              html_url: 'https://github.com/o/r/pull/2',
              user: { login: 'octocat' },
              state: 'closed',
            },
          },
        },
      ],
    });

    const result = await verifyContributionForIssue(
      'https://github.com/o/r/issues/1',
      'octocat',
      undefined,
      mkOctokit(listEventsForTimeline),
    );
    expect(result).toEqual({
      verified: true,
      closingPrUrl: 'https://github.com/o/r/pull/2',
      closingPrAuthor: 'octocat',
    });
    expect(listEventsForTimeline).toHaveBeenCalledWith(
      expect.objectContaining({ owner: 'o', repo: 'r', issue_number: 1 }),
    );
  });
});

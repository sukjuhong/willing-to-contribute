import { vi, beforeEach } from 'vitest';

// Use vi.hoisted so these are available inside vi.mock factories
const mocks = vi.hoisted(() => ({
  issuesListForRepo: vi.fn(),
  issuesListComments: vi.fn(),
  pullsList: vi.fn(),
  getServerOctokit: vi.fn(),
  cacheGet: vi.fn(),
  cacheSet: vi.fn(),
}));

vi.mock('@/app/api/recommended/serverOctokit', () => ({
  getServerOctokit: mocks.getServerOctokit,
}));

vi.mock('@/app/lib/cache', () => ({
  cacheGet: mocks.cacheGet,
  cacheSet: mocks.cacheSet,
}));

import {
  calculateMaintainerScore,
  getCachedMaintainerScore,
} from '@/app/api/recommended/maintainerScore';

const makeIssue = (
  number: number,
  createdAt: string,
  isPR = false,
): Record<string, unknown> => ({
  number,
  created_at: createdAt,
  pull_request: isPR ? {} : undefined,
});

const makeComment = (createdAt: string) => ({ created_at: createdAt });

const makePR = (createdAt: string, mergedAt: string | null) => ({
  created_at: createdAt,
  merged_at: mergedAt,
});

const hoursAfter = (base: string, hours: number): string => {
  const d = new Date(base);
  d.setHours(d.getHours() + hours);
  return d.toISOString();
};

const BASE = '2024-01-01T00:00:00.000Z';

const makeOctokit = ({
  issues = [] as ReturnType<typeof makeIssue>[],
  comments = [] as ReturnType<typeof makeComment>[],
  closedPRs = [] as ReturnType<typeof makePR>[],
} = {}) => ({
  issues: {
    listForRepo: mocks.issuesListForRepo.mockResolvedValue({ data: issues }),
    listComments: mocks.issuesListComments.mockResolvedValue({ data: comments }),
  },
  pulls: {
    list: mocks.pullsList.mockResolvedValue({ data: closedPRs }),
  },
});

beforeEach(() => {
  vi.clearAllMocks();
  // Default: cache miss
  mocks.cacheGet.mockResolvedValue(null);
  mocks.cacheSet.mockResolvedValue(undefined);
});

// -------------------------
// getCachedMaintainerScore
// -------------------------
describe('getCachedMaintainerScore', () => {
  it('returns null when cache miss', async () => {
    mocks.cacheGet.mockResolvedValue(null);
    expect(await getCachedMaintainerScore('owner', 'repo')).toBeNull();
  });

  it('returns cached score when present', async () => {
    const score = { grade: 'A' as const, avgResponseTimeHours: 1, avgMergeTimeHours: 2, mergeRate: 0.9 };
    mocks.cacheGet.mockResolvedValue(score);
    expect(await getCachedMaintainerScore('owner', 'repo')).toEqual(score);
    expect(mocks.cacheGet).toHaveBeenCalledWith('maintainer:owner/repo');
  });
});

// -------------------------
// calculateMaintainerScore
// -------------------------
describe('calculateMaintainerScore', () => {
  describe('grade A: responseTime < 24h AND mergeRate > 70%', () => {
    it('assigns grade A', async () => {
      const issues = [makeIssue(1, BASE)];
      const comments = [makeComment(hoursAfter(BASE, 12))]; // 12h response
      const closedPRs = [
        makePR(BASE, hoursAfter(BASE, 10)),
        makePR(BASE, hoursAfter(BASE, 20)),
        makePR(BASE, hoursAfter(BASE, 5)),
      ]; // 3/3 = 100% merge rate
      mocks.getServerOctokit.mockResolvedValue(makeOctokit({ issues, comments, closedPRs }));

      const score = await calculateMaintainerScore('owner', 'repo');
      expect(score.grade).toBe('A');
      expect(score.avgResponseTimeHours).toBeCloseTo(12);
      expect(score.mergeRate).toBeCloseTo(1.0);
    });
  });

  describe('grade B: responseTime < 72h AND mergeRate > 50%', () => {
    it('assigns grade B when response 48h and mergeRate 60%', async () => {
      const issues = [makeIssue(1, BASE)];
      const comments = [makeComment(hoursAfter(BASE, 48))]; // 48h response
      const closedPRs = [
        makePR(BASE, hoursAfter(BASE, 5)),
        makePR(BASE, hoursAfter(BASE, 5)),
        makePR(BASE, hoursAfter(BASE, 5)),
        makePR(BASE, null),
        makePR(BASE, null),
      ]; // 3/5 = 60% merge rate
      mocks.getServerOctokit.mockResolvedValue(makeOctokit({ issues, comments, closedPRs }));

      const score = await calculateMaintainerScore('owner', 'repo');
      expect(score.grade).toBe('B');
    });
  });

  describe('grade C: fallback', () => {
    it('assigns grade C when responseTime >= 72h', async () => {
      const issues = [makeIssue(1, BASE)];
      const comments = [makeComment(hoursAfter(BASE, 96))]; // 96h response
      const closedPRs = [makePR(BASE, hoursAfter(BASE, 5))]; // 100% merge but slow
      mocks.getServerOctokit.mockResolvedValue(makeOctokit({ issues, comments, closedPRs }));

      const score = await calculateMaintainerScore('owner', 'repo');
      expect(score.grade).toBe('C');
    });

    it('assigns grade C when mergeRate <= 50%', async () => {
      const issues = [makeIssue(1, BASE)];
      const comments = [makeComment(hoursAfter(BASE, 10))]; // fast response
      const closedPRs = [
        makePR(BASE, hoursAfter(BASE, 1)),
        makePR(BASE, null),
        makePR(BASE, null),
        makePR(BASE, null),
      ]; // 1/4 = 25% merge rate
      mocks.getServerOctokit.mockResolvedValue(makeOctokit({ issues, comments, closedPRs }));

      const score = await calculateMaintainerScore('owner', 'repo');
      expect(score.grade).toBe('C');
    });

    it('assigns grade C when no data (zero responseCount, zero PRs)', async () => {
      mocks.getServerOctokit.mockResolvedValue(makeOctokit());

      const score = await calculateMaintainerScore('owner', 'repo');
      expect(score.avgResponseTimeHours).toBe(0);
      expect(score.mergeRate).toBe(0);
      expect(score.grade).toBe('C');
    });
  });

  describe('edge cases', () => {
    it('skips PR issues when calculating response time', async () => {
      const issues = [makeIssue(1, BASE, true)]; // is a PR, should be skipped
      mocks.getServerOctokit.mockResolvedValue(makeOctokit({ issues }));

      const score = await calculateMaintainerScore('owner', 'repo');
      expect(score.avgResponseTimeHours).toBe(0);
      expect(mocks.issuesListComments).not.toHaveBeenCalled();
    });

    it('returns cached result without calling octokit', async () => {
      const cached = { grade: 'A' as const, avgResponseTimeHours: 5, avgMergeTimeHours: 10, mergeRate: 0.9 };
      mocks.cacheGet.mockResolvedValue(cached);

      const score = await calculateMaintainerScore('owner', 'repo');
      expect(score).toEqual(cached);
      expect(mocks.getServerOctokit).not.toHaveBeenCalled();
    });

    it('saves computed score to cache', async () => {
      const issues = [makeIssue(1, BASE)];
      const comments = [makeComment(hoursAfter(BASE, 12))];
      const closedPRs = [makePR(BASE, hoursAfter(BASE, 5))];
      mocks.getServerOctokit.mockResolvedValue(makeOctokit({ issues, comments, closedPRs }));

      await calculateMaintainerScore('owner', 'repo');
      expect(mocks.cacheSet).toHaveBeenCalledWith(
        'maintainer:owner/repo',
        expect.objectContaining({ grade: expect.stringMatching(/^[ABC]$/) }),
        21600,
      );
    });

    it('returns FALLBACK_SCORE on API error', async () => {
      mocks.getServerOctokit.mockRejectedValue(new Error('network error'));

      const score = await calculateMaintainerScore('owner', 'broken-repo');
      expect(score).toEqual({
        grade: 'C',
        avgResponseTimeHours: 0,
        avgMergeTimeHours: 0,
        mergeRate: 0,
      });
    });
  });
});

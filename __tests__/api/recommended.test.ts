import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock serverOctokit before importing route
vi.mock('../../app/api/recommended/serverOctokit', () => ({
  getServerOctokit: vi.fn(),
}));

vi.mock('../../app/api/recommended/maintainerScore', () => ({
  calculateMaintainerScore: vi.fn(),
}));

import { getServerOctokit } from '../../app/api/recommended/serverOctokit';
import { calculateMaintainerScore } from '../../app/api/recommended/maintainerScore';
import { GET } from '../../app/api/recommended/route';

const mockGetServerOctokit = vi.mocked(getServerOctokit);
const mockCalculateMaintainerScore = vi.mocked(calculateMaintainerScore);

// Each test gets a unique page number to bust the module-level cache
let testCounter = 1000;
function makeRequest(params: Record<string, string | string[]> = {}) {
  const url = new URL('http://localhost:3000/api/recommended');
  // Use a unique page per test so the cache key is always different
  url.searchParams.set('page', String(++testCounter));
  for (const [k, v] of Object.entries(params)) {
    if (Array.isArray(v)) {
      v.forEach(val => url.searchParams.append(k, val));
    } else {
      url.searchParams.set(k, v);
    }
  }
  return new NextRequest(url.toString());
}

const mockIssueItem = {
  id: 1,
  number: 42,
  title: 'Good first issue',
  html_url: 'https://github.com/owner/repo/issues/42',
  body: 'Issue body',
  labels: [
    {
      id: 10,
      name: 'good first issue',
      color: '0075ca',
      description: null,
      default: false,
      node_id: 'n1',
      url: 'https://api.github.com/repos/owner/repo/labels/good+first+issue',
    },
  ],
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-15T00:00:00Z',
  state: 'open',
  repository_url: 'https://api.github.com/repos/owner/repo',
};

const mockMaintainerScore = {
  grade: 'A' as const,
  avgResponseTimeHours: 12,
  avgMergeTimeHours: 24,
  mergeRate: 0.85,
};

const mockRepoData = {
  stargazers_count: 5000,
  forks_count: 500,
  language: 'TypeScript',
  pushed_at: '2024-03-01T00:00:00Z',
  description: 'A great repo',
};

function makeOctokitMock(
  overrides: {
    issuesAndPullRequests?: ReturnType<typeof vi.fn>;
    reposGet?: ReturnType<typeof vi.fn>;
  } = {},
) {
  return {
    search: {
      issuesAndPullRequests:
        overrides.issuesAndPullRequests ??
        vi.fn().mockResolvedValue({ data: { items: [mockIssueItem], total_count: 1 } }),
    },
    repos: {
      get: overrides.reposGet ?? vi.fn().mockResolvedValue({ data: mockRepoData }),
    },
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  mockCalculateMaintainerScore.mockResolvedValue(mockMaintainerScore);
});

describe('GET /api/recommended', () => {
  describe('default params', () => {
    it('returns issues with default parameters', async () => {
      mockGetServerOctokit.mockResolvedValue(makeOctokitMock() as never);

      const req = makeRequest();
      const res = await GET(req);

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.total).toBe(1);
      expect(body.issues).toHaveLength(1);
      expect(body.issues[0].title).toBe('Good first issue');
    });

    it('includes maintainer score in repository metadata', async () => {
      mockGetServerOctokit.mockResolvedValue(makeOctokitMock() as never);

      const req = makeRequest();
      const res = await GET(req);
      const body = await res.json();

      expect(body.issues[0].repository.maintainerScore).toEqual(mockMaintainerScore);
    });

    it('includes repo metadata (stars, forks, language)', async () => {
      mockGetServerOctokit.mockResolvedValue(makeOctokitMock() as never);

      const req = makeRequest();
      const res = await GET(req);
      const body = await res.json();

      const repo = body.issues[0].repository;
      expect(repo.stargazersCount).toBe(5000);
      expect(repo.forksCount).toBe(500);
      expect(repo.language).toBe('TypeScript');
    });
  });

  describe('language filter', () => {
    it('appends language to search query when language param provided', async () => {
      const searchMock = vi
        .fn()
        .mockResolvedValue({ data: { items: [], total_count: 0 } });
      mockGetServerOctokit.mockResolvedValue(
        makeOctokitMock({ issuesAndPullRequests: searchMock }) as never,
      );

      const req = makeRequest({ language: 'Rust' });
      await GET(req);

      expect(searchMock).toHaveBeenCalledWith(
        expect.objectContaining({ q: expect.stringContaining('language:Rust') }),
      );
    });
  });

  describe('maintainerGrade filter', () => {
    it('filters issues by maintainer grade', async () => {
      mockCalculateMaintainerScore
        .mockResolvedValueOnce({ ...mockMaintainerScore, grade: 'A' })
        .mockResolvedValueOnce({ ...mockMaintainerScore, grade: 'C' });

      const twoItems = [
        mockIssueItem,
        { ...mockIssueItem, id: 2, number: 43, title: 'Low grade repo issue' },
      ];
      mockGetServerOctokit.mockResolvedValue(
        makeOctokitMock({
          issuesAndPullRequests: vi
            .fn()
            .mockResolvedValue({ data: { items: twoItems, total_count: 2 } }),
        }) as never,
      );

      const req = makeRequest({ maintainerGrade: ['A'] });
      const res = await GET(req);
      const body = await res.json();

      expect(body.issues).toHaveLength(1);
      expect(body.issues[0].title).toBe('Good first issue');
    });
  });

  describe('error handling', () => {
    it('returns 500 when getServerOctokit throws', async () => {
      mockGetServerOctokit.mockRejectedValue(new Error('Missing env vars'));

      const req = makeRequest();
      const res = await GET(req);

      expect(res.status).toBe(500);
      const body = await res.json();
      expect(body.error).toBe('Internal server error');
    });

    it('returns 500 when search API throws', async () => {
      mockGetServerOctokit.mockResolvedValue(
        makeOctokitMock({
          issuesAndPullRequests: vi.fn().mockRejectedValue(new Error('Rate limit')),
        }) as never,
      );

      const req = makeRequest();
      const res = await GET(req);

      expect(res.status).toBe(500);
      const body = await res.json();
      expect(body.error).toBe('Internal server error');
    });

    it('continues without repo metadata when repos.get throws', async () => {
      mockGetServerOctokit.mockResolvedValue(
        makeOctokitMock({
          reposGet: vi.fn().mockRejectedValue(new Error('Not found')),
        }) as never,
      );

      const req = makeRequest();
      const res = await GET(req);

      // Should still return 200 with the issue, just without metadata
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.issues).toHaveLength(1);
      expect(body.issues[0].repository.stargazersCount).toBeUndefined();
    });
  });
});

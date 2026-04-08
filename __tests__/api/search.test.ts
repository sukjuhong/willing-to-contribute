import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Shared mock functions declared before vi.mock (hoisted)
const mockSearchIssues = vi.fn();
const mockSearchRepos = vi.fn();
const mockOctokitInstance = {
  search: {
    issuesAndPullRequests: mockSearchIssues,
    repos: mockSearchRepos,
  },
};

vi.mock('@octokit/rest', () => {
  return {
    Octokit: class MockOctokit {
      search = mockOctokitInstance.search;
      // store auth for assertion
      auth: unknown;
      constructor(opts?: { auth?: unknown }) {
        this.auth = opts?.auth;
        // expose last instance for auth assertion
        MockOctokit._lastAuth = opts?.auth;
      }
      static _lastAuth: unknown;
    },
  };
});

import { GET } from '../../app/api/search/route';
import { Octokit } from '@octokit/rest';

function makeRequest(params: Record<string, string>, headers?: Record<string, string>) {
  const url = new URL('http://localhost:3000/api/search');
  // Use unique q per test to bust the module-level cache
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }
  return new NextRequest(url.toString(), { headers });
}

// Unique counter to generate cache-busting query strings
let testCounter = 0;
function uniqueQ(base: string) {
  return `${base}-${++testCounter}`;
}

const mockIssueItem = {
  id: 1,
  number: 42,
  title: 'Fix bug',
  html_url: 'https://github.com/owner/repo/issues/42',
  body: 'Some body',
  labels: [
    {
      id: 10,
      name: 'good first issue',
      color: 'green',
      description: null,
      default: false,
      node_id: 'n1',
      url: 'u',
    },
  ],
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-02T00:00:00Z',
  state: 'open',
  repository_url: 'https://api.github.com/repos/owner/repo',
};

const mockRepoItem = {
  id: 100,
  name: 'react',
  html_url: 'https://github.com/facebook/react',
  description: 'A declarative UI library',
  stargazers_count: 200000,
  language: 'JavaScript',
  forks_count: 40000,
  open_issues_count: 800,
  pushed_at: '2024-03-01T00:00:00Z',
  owner: { login: 'facebook' },
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('GET /api/search', () => {
  describe('parameter validation', () => {
    it('returns 400 when type is missing', async () => {
      const req = makeRequest({ q: uniqueQ('react') });
      const res = await GET(req);
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toMatch(/Missing required parameters/);
    });

    it('returns 400 when q is missing', async () => {
      const req = makeRequest({ type: 'issues' });
      const res = await GET(req);
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toMatch(/Missing required parameters/);
    });

    it('returns 400 for invalid type value', async () => {
      const req = makeRequest({ type: 'invalid', q: uniqueQ('react') });
      const res = await GET(req);
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toMatch(/type must be/);
    });
  });

  describe('type=issues', () => {
    it('returns issues list for valid params', async () => {
      mockSearchIssues.mockResolvedValueOnce({
        data: { items: [mockIssueItem], total_count: 1 },
      });

      const req = makeRequest({ type: 'issues', q: uniqueQ('react') });
      const res = await GET(req);

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.total).toBe(1);
      expect(body.results).toHaveLength(1);
      expect(body.results[0].title).toBe('Fix bug');
      expect(body.results[0].repository.owner).toBe('owner');
      expect(body.results[0].repository.name).toBe('repo');
    });

    it('includes language filter in query when language param provided', async () => {
      mockSearchIssues.mockResolvedValueOnce({
        data: { items: [], total_count: 0 },
      });

      const req = makeRequest({
        type: 'issues',
        q: uniqueQ('react'),
        language: 'TypeScript',
      });
      await GET(req);

      expect(mockSearchIssues).toHaveBeenCalledWith(
        expect.objectContaining({ q: expect.stringContaining('language:TypeScript') }),
      );
    });
  });

  describe('type=repos', () => {
    it('returns repositories for valid params', async () => {
      mockSearchRepos.mockResolvedValueOnce({
        data: { items: [mockRepoItem], total_count: 1 },
      });

      const req = makeRequest({ type: 'repos', q: uniqueQ('react') });
      const res = await GET(req);

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.total).toBe(1);
      expect(body.results[0].name).toBe('react');
      expect(body.results[0].owner).toBe('facebook');
      expect(body.results[0].stargazersCount).toBe(200000);
    });

    it('uses authorization header token when provided', async () => {
      mockSearchRepos.mockResolvedValueOnce({
        data: { items: [], total_count: 0 },
      });

      const req = makeRequest(
        { type: 'repos', q: uniqueQ('react') },
        { Authorization: 'Bearer mytoken123' },
      );
      await GET(req);

      // The MockOctokit class stores the last auth value
      expect((Octokit as unknown as { _lastAuth: unknown })._lastAuth).toBe('mytoken123');
    });
  });

  describe('error handling', () => {
    it('returns 500 when Octokit throws', async () => {
      mockSearchIssues.mockRejectedValueOnce(new Error('API error'));

      const req = makeRequest({ type: 'issues', q: uniqueQ('error-case') });
      const res = await GET(req);

      expect(res.status).toBe(500);
      const body = await res.json();
      expect(body.error).toBe('Internal server error');
    });
  });
});

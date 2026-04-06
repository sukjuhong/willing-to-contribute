import { vi, beforeEach } from 'vitest';

// Use vi.hoisted so mock fns are available inside vi.mock factories
const mocks = vi.hoisted(() => ({
  reposGet: vi.fn(),
  issuesListForRepo: vi.fn(),
}));

vi.mock('@octokit/rest', () => {
  class MockOctokit {
    repos = { get: mocks.reposGet };
    issues = { listForRepo: mocks.issuesListForRepo };
  }
  return { Octokit: MockOctokit };
});

import { parseRepoUrl, getRepository, getIssues } from '@/app/utils/github';

const REPO_FIXTURE = {
  id: 123,
  name: 'my-repo',
  owner: { login: 'my-owner' },
  html_url: 'https://github.com/my-owner/my-repo',
  description: 'A test repo',
  stargazers_count: 500,
};

const REPOSITORY = {
  id: '123',
  owner: 'my-owner',
  name: 'my-repo',
  url: 'https://github.com/my-owner/my-repo',
  description: 'A test repo',
  stargazersCount: 500,
};

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});

// -------------------------
// parseRepoUrl
// -------------------------
describe('parseRepoUrl', () => {
  it('parses full GitHub URL', () => {
    expect(parseRepoUrl('https://github.com/owner/repo')).toEqual({
      owner: 'owner',
      name: 'repo',
    });
  });

  it('parses owner/repo shorthand', () => {
    expect(parseRepoUrl('owner/repo')).toEqual({ owner: 'owner', name: 'repo' });
  });

  it('parses URL with trailing slash', () => {
    expect(parseRepoUrl('https://github.com/owner/repo/')).toEqual({
      owner: 'owner',
      name: 'repo',
    });
  });

  it('returns null for invalid input', () => {
    expect(parseRepoUrl('not-a-url')).toBeNull();
    expect(parseRepoUrl('')).toBeNull();
  });
});

// -------------------------
// getRepository
// -------------------------
describe('getRepository', () => {
  it('returns repository info on success', async () => {
    mocks.reposGet.mockResolvedValue({ data: REPO_FIXTURE });

    const result = await getRepository('my-owner', 'my-repo');
    expect(result).toEqual(REPOSITORY);
    expect(mocks.reposGet).toHaveBeenCalledWith({ owner: 'my-owner', repo: 'my-repo' });
  });

  it('returns null on generic error', async () => {
    mocks.reposGet.mockRejectedValue(new Error('not found'));
    const result = await getRepository('bad-owner', 'bad-repo');
    expect(result).toBeNull();
  });

  it('re-throws rate limit error with isRateLimit flag', async () => {
    mocks.reposGet.mockRejectedValue({
      status: 403,
      response: {
        headers: {
          'x-ratelimit-remaining': '0',
          'x-ratelimit-reset': '9999999999',
        },
      },
    });

    await expect(getRepository('owner', 'repo')).rejects.toMatchObject({
      isRateLimit: true,
    });
  });

  it('maps missing description to undefined', async () => {
    mocks.reposGet.mockResolvedValue({
      data: { ...REPO_FIXTURE, description: null },
    });
    const result = await getRepository('my-owner', 'my-repo');
    expect(result?.description).toBeUndefined();
  });
});

// -------------------------
// getIssues
// -------------------------
describe('getIssues', () => {
  const ISSUE_FIXTURE = {
    id: 1,
    number: 42,
    title: 'Fix bug',
    html_url: 'https://github.com/my-owner/my-repo/issues/42',
    body: 'details',
    labels: [{ id: 10, name: 'bug', color: 'red' }],
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z',
    state: 'open' as const,
  };

  it('returns empty array when labels list is empty', async () => {
    const result = await getIssues(REPOSITORY, [], false);
    expect(result).toEqual([]);
    expect(mocks.issuesListForRepo).not.toHaveBeenCalled();
  });

  it('fetches issues with each label and deduplicates', async () => {
    mocks.issuesListForRepo.mockResolvedValue({ data: [ISSUE_FIXTURE] });

    const result = await getIssues(REPOSITORY, ['bug', 'help wanted'], false);
    // Two labels -> two calls, but same issue id -> deduplicated to 1
    expect(mocks.issuesListForRepo).toHaveBeenCalledTimes(2);
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Fix bug');
  });

  it('uses state=open when hideClosedIssues=true', async () => {
    mocks.issuesListForRepo.mockResolvedValue({ data: [] });
    await getIssues(REPOSITORY, ['bug'], true);
    expect(mocks.issuesListForRepo).toHaveBeenCalledWith(
      expect.objectContaining({ state: 'open' }),
    );
  });

  it('uses state=all when hideClosedIssues=false', async () => {
    mocks.issuesListForRepo.mockResolvedValue({ data: [] });
    await getIssues(REPOSITORY, ['bug'], false);
    expect(mocks.issuesListForRepo).toHaveBeenCalledWith(
      expect.objectContaining({ state: 'all' }),
    );
  });

  it('returns empty array on generic error', async () => {
    mocks.issuesListForRepo.mockRejectedValue(new Error('server error'));
    const result = await getIssues(REPOSITORY, ['bug'], false);
    expect(result).toEqual([]);
  });
});

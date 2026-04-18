import { describe, it, expect } from 'vitest';
import {
  calculateMatchScore,
  profileFromSupabaseRow,
  type IssueContextForMatching,
  type UserProfileForMatching,
} from '../matchScore';

const baseIssueContext: IssueContextForMatching = {
  repoLanguage: 'TypeScript',
  repoTopics: ['frontend', 'testing', 'react'],
  repoStars: 1500,
};

describe('calculateMatchScore', () => {
  it('returns null when profile is null', () => {
    const result = calculateMatchScore(baseIssueContext, null);
    expect(result).toBeNull();
  });

  it('rank-1 language + 2 topic overlap + in-range scale → 40 + 25 + 20 = 85', () => {
    const profile: UserProfileForMatching = {
      topLanguages: [
        { language: 'TypeScript', rank: 1 },
        { language: 'Python', rank: 2 },
      ],
      starredCategories: ['frontend', 'testing', 'graphql'],
      contributedReposAvgStars: 1000, // range [500, 5000] includes 1500
    };

    const result = calculateMatchScore(baseIssueContext, profile);
    expect(result).not.toBeNull();
    expect(result!.breakdown.languagePoints).toBe(40);
    expect(result!.breakdown.topicPoints).toBe(25);
    expect(result!.breakdown.scalePoints).toBe(20);
    expect(result!.score).toBe(85);
    expect(result!.reasons[0]).toContain('TypeScript');
    expect(result!.reasons[0]).toContain('1위');
  });

  it('no language match + 0 topic overlap + out-of-range scale → score ≤ 10', () => {
    const profile: UserProfileForMatching = {
      topLanguages: [{ language: 'Rust', rank: 1 }],
      starredCategories: ['embedded', 'systems'],
      contributedReposAvgStars: 50, // range [25, 250] excludes 1500
    };

    const result = calculateMatchScore(baseIssueContext, profile);
    expect(result).not.toBeNull();
    expect(result!.breakdown.languagePoints).toBe(0);
    expect(result!.breakdown.topicPoints).toBe(0);
    expect(result!.breakdown.scalePoints).toBe(10);
    expect(result!.score).toBeLessThanOrEqual(10);
  });

  it('contributed_repos empty → fallback range [100, 10000] gives 20pts at 1000 stars', () => {
    const profile: UserProfileForMatching = {
      topLanguages: null,
      starredCategories: null,
      contributedReposAvgStars: null,
    };
    const issue: IssueContextForMatching = {
      repoLanguage: null,
      repoTopics: [],
      repoStars: 1000,
    };

    const result = calculateMatchScore(issue, profile);
    expect(result).not.toBeNull();
    expect(result!.breakdown.scalePoints).toBe(20);
  });

  it('topic overlap of 3+ caps language-side topic axis at 40', () => {
    const profile: UserProfileForMatching = {
      topLanguages: null,
      starredCategories: ['frontend', 'testing', 'react', 'graphql'],
      contributedReposAvgStars: null,
    };
    const issue: IssueContextForMatching = {
      repoLanguage: null,
      repoTopics: ['frontend', 'testing', 'react', 'extra'],
      repoStars: 500,
    };

    const result = calculateMatchScore(issue, profile);
    expect(result).not.toBeNull();
    expect(result!.breakdown.topicPoints).toBe(40);
  });

  it('rank 4+ language match awards 20 points', () => {
    const profile: UserProfileForMatching = {
      topLanguages: [
        { language: 'Python', rank: 1 },
        { language: 'Go', rank: 2 },
        { language: 'Java', rank: 3 },
        { language: 'TypeScript', rank: 4 },
      ],
      starredCategories: null,
      contributedReposAvgStars: null,
    };
    const result = calculateMatchScore(baseIssueContext, profile);
    expect(result!.breakdown.languagePoints).toBe(20);
  });

  it('language matching is case-insensitive', () => {
    const profile: UserProfileForMatching = {
      topLanguages: [{ language: 'typescript', rank: 1 }],
      starredCategories: null,
      contributedReposAvgStars: null,
    };
    const result = calculateMatchScore(baseIssueContext, profile);
    expect(result!.breakdown.languagePoints).toBe(40);
  });
});

describe('profileFromSupabaseRow', () => {
  it('returns null for null row', () => {
    expect(profileFromSupabaseRow(null)).toBeNull();
    expect(profileFromSupabaseRow(undefined)).toBeNull();
  });

  it('converts top_languages array order into ranks (1-indexed)', () => {
    const row = {
      top_languages: ['TypeScript', 'Python', 'Go'],
      starred_categories: ['frontend', 'cli'],
      contributed_repos: ['octocat/hello'],
    };
    const profile = profileFromSupabaseRow(row);
    expect(profile).not.toBeNull();
    expect(profile!.topLanguages).toEqual([
      { language: 'TypeScript', rank: 1 },
      { language: 'Python', rank: 2 },
      { language: 'Go', rank: 3 },
    ]);
    expect(profile!.starredCategories).toEqual(['frontend', 'cli']);
    expect(profile!.contributedReposAvgStars).toBeNull();
  });

  it('coerces non-array / non-string fields to null safely', () => {
    const row = {
      top_languages: null,
      starred_categories: 'not-an-array',
      contributed_repos: undefined,
    };
    const profile = profileFromSupabaseRow(row);
    expect(profile).not.toBeNull();
    expect(profile!.topLanguages).toBeNull();
    expect(profile!.starredCategories).toBeNull();
    expect(profile!.contributedReposAvgStars).toBeNull();
  });
});

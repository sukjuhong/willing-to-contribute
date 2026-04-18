import { MatchScore } from '../../types';

/**
 * Personalization match score (0–100) for a recommended issue.
 *
 * Combines three weighted axes — language fit (0–40), topic/domain overlap (0–40),
 * and repo scale appropriateness (0–20) — using only the user_profiles fields
 * (top_languages, starred_categories, contributed_repos) and repo metadata.
 * Pure function: no network/DB calls.
 *
 * TODO: improve contributed_repos average-stars accuracy (currently the DB stores
 * repo names only, not stars), add topic synonym handling (e.g. "react"/"reactjs"),
 * and tune scale-bucket thresholds once user feedback is available.
 */

export interface UserProfileForMatching {
  /** Ordered top languages (index 0 = highest rank). */
  topLanguages: Array<{ language: string; rank: number }> | null;
  /** Topics extracted from starred repos. */
  starredCategories: string[] | null;
  /** Average star count of repos the user has contributed to; null when unknown. */
  contributedReposAvgStars: number | null;
}

export interface IssueContextForMatching {
  repoLanguage: string | null;
  repoTopics: string[];
  repoStars: number;
}

/** Raw shape of a `user_profiles` row from Supabase. */
export interface SupabaseUserProfileRow {
  top_languages: unknown;
  starred_categories: unknown;
  contributed_repos: unknown;
}

const MAX_LANGUAGE_POINTS = 40;
const MAX_TOPIC_POINTS = 40;
const MAX_SCALE_POINTS = 20;

const calculateLanguagePoints = (
  repoLanguage: string | null,
  topLanguages: UserProfileForMatching['topLanguages'],
): { points: number; reason: string | null } => {
  if (!repoLanguage || !topLanguages || topLanguages.length === 0) {
    return { points: 0, reason: null };
  }

  const normalizedRepoLang = repoLanguage.toLowerCase();
  const match = topLanguages.find(
    entry => entry.language.toLowerCase() === normalizedRepoLang,
  );

  if (!match) {
    return { points: 0, reason: null };
  }

  let points: number;
  if (match.rank === 1) points = 40;
  else if (match.rank <= 3) points = 30;
  else points = 20;

  return {
    points,
    reason: `${repoLanguage} 상위 ${match.rank}위 언어 일치`,
  };
};

const calculateTopicPoints = (
  repoTopics: string[],
  starredCategories: string[] | null,
): { points: number; reason: string | null } => {
  if (!starredCategories || starredCategories.length === 0 || repoTopics.length === 0) {
    return { points: 0, reason: null };
  }

  const starredSet = new Set(starredCategories.map(t => t.toLowerCase()));
  const matched = repoTopics.filter(t => starredSet.has(t.toLowerCase()));
  const overlap = matched.length;

  if (overlap === 0) {
    return { points: 0, reason: null };
  }

  let points: number;
  if (overlap >= 3) points = 40;
  else if (overlap === 2) points = 25;
  else points = 15;

  return {
    points,
    reason: `${matched.slice(0, 3).join(', ')} 토픽 일치(${overlap}개)`,
  };
};

const FALLBACK_MIN_STARS = 100;
const FALLBACK_MAX_STARS = 10000;
const SCALE_LOWER_RATIO = 0.5;
const SCALE_UPPER_RATIO = 5;

const calculateScalePoints = (
  repoStars: number,
  contributedReposAvgStars: number | null,
): { points: number; reason: string } => {
  if (contributedReposAvgStars == null || contributedReposAvgStars <= 0) {
    const fits = repoStars >= FALLBACK_MIN_STARS && repoStars <= FALLBACK_MAX_STARS;
    return {
      points: fits ? 20 : 10,
      reason: fits ? `규모 적정(스타 ${repoStars})` : `규모 부적정(스타 ${repoStars})`,
    };
  }

  const lower = contributedReposAvgStars * SCALE_LOWER_RATIO;
  const upper = contributedReposAvgStars * SCALE_UPPER_RATIO;
  const fits = repoStars >= lower && repoStars <= upper;
  return {
    points: fits ? 20 : 10,
    reason: fits
      ? `규모 적정(스타 ${repoStars}, 기여 평균 ${Math.round(contributedReposAvgStars)})`
      : `규모 부적정(스타 ${repoStars}, 기여 평균 ${Math.round(contributedReposAvgStars)})`,
  };
};

/**
 * Compute a 0–100 match score for an issue against a user's profile.
 * Returns null when the user has no profile (anonymous / not synced) so callers
 * can hide the badge.
 */
export const calculateMatchScore = (
  issueContext: IssueContextForMatching,
  profile: UserProfileForMatching | null,
): MatchScore | null => {
  if (!profile) return null;

  const reasons: string[] = [];

  const language = calculateLanguagePoints(
    issueContext.repoLanguage,
    profile.topLanguages,
  );
  if (language.reason) reasons.push(language.reason);
  else reasons.push('언어 데이터 없음 또는 미일치');

  const topic = calculateTopicPoints(issueContext.repoTopics, profile.starredCategories);
  if (topic.reason) reasons.push(topic.reason);
  else reasons.push('토픽 데이터 없음 또는 미일치');

  const scale = calculateScalePoints(
    issueContext.repoStars,
    profile.contributedReposAvgStars,
  );
  reasons.push(scale.reason);

  const languagePoints = Math.min(language.points, MAX_LANGUAGE_POINTS);
  const topicPoints = Math.min(topic.points, MAX_TOPIC_POINTS);
  const scalePoints = Math.min(scale.points, MAX_SCALE_POINTS);
  const score = languagePoints + topicPoints + scalePoints;

  return {
    score,
    breakdown: {
      languagePoints,
      topicPoints,
      scalePoints,
    },
    reasons,
  };
};

const toStringArray = (value: unknown): string[] | null => {
  if (!Array.isArray(value)) return null;
  const arr = value.filter((v): v is string => typeof v === 'string');
  return arr.length > 0 ? arr : null;
};

/**
 * Convert a Supabase `user_profiles` row into the normalized matching profile.
 * The DB stores `top_languages` as an ordered JSON string array (rank = index + 1)
 * and `contributed_repos` as repo name strings (no stars yet) — so
 * `contributedReposAvgStars` is set to null until that signal is enriched upstream.
 */
export const profileFromSupabaseRow = (
  row: SupabaseUserProfileRow | null | undefined,
): UserProfileForMatching | null => {
  if (!row) return null;

  const langs = toStringArray(row.top_languages);
  const topLanguages = langs
    ? langs.map((language, idx) => ({ language, rank: idx + 1 }))
    : null;

  return {
    topLanguages,
    starredCategories: toStringArray(row.starred_categories),
    contributedReposAvgStars: null,
  };
};

/**
 * Rule-based skill matching algorithm.
 *
 * Computes a 0-100 score indicating how well a user's profile
 * matches a given issue/repository.
 *
 * Weights:
 *  - Language match:  60% (user top_languages vs repo language)
 *  - Category match:  40% (user starred_categories vs issue labels)
 */

export interface SkillMatchInput {
  /** User's top languages ordered by relevance (index 0 = most used) */
  userLanguages: string[];
  /** User's starred repo topics/categories */
  userCategories: string[];
  /** The primary language of the issue's repository */
  repoLanguage: string | undefined;
  /** Labels on the issue */
  issueLabels: string[];
}

/**
 * Calculate language match score (0-60).
 *
 * Primary language = 60, secondary = 40, tertiary+ = 20, no match = 0.
 */
function languageScore(
  userLanguages: string[],
  repoLanguage: string | undefined,
): number {
  if (!repoLanguage || userLanguages.length === 0) return 0;
  const normalised = repoLanguage.toLowerCase();
  const idx = userLanguages.findIndex(l => l.toLowerCase() === normalised);
  if (idx === 0) return 60;
  if (idx === 1) return 40;
  if (idx >= 2) return 20;
  return 0;
}

/**
 * Calculate category/topic match score (0-40).
 *
 * Proportional to overlap between user categories and issue labels,
 * capped at 3 matches for full score.
 */
function categoryScore(userCategories: string[], issueLabels: string[]): number {
  if (userCategories.length === 0 || issueLabels.length === 0) return 0;
  const lowerCategories = new Set(userCategories.map(c => c.toLowerCase()));
  const matchCount = issueLabels.filter(l => lowerCategories.has(l.toLowerCase())).length;
  return Math.round(Math.min(matchCount / 3, 1) * 40);
}

/**
 * Calculate a skill matching score (0-100) between a user profile
 * and an issue's repository.
 *
 * Returns `undefined` when the input lacks sufficient data to score.
 */
export function calculateMatchScore(input: SkillMatchInput): number | undefined {
  const { userLanguages, userCategories, repoLanguage, issueLabels } = input;

  if (userLanguages.length === 0 && userCategories.length === 0) {
    return undefined;
  }

  const lang = languageScore(userLanguages, repoLanguage);
  const cat = categoryScore(userCategories, issueLabels);

  return Math.min(lang + cat, 100);
}

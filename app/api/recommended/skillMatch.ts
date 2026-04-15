/**
 * Calculate a skill matching score (0-100) between a user profile and an issue's repository.
 *
 * Weights:
 *  - Language match:  50 pts (primary lang = 50, secondary = 30, tertiary = 15)
 *  - Topic match:     30 pts (proportional to overlap with starred categories)
 *  - Difficulty fit:  20 pts (beginner labels boost score for users with fewer contributions)
 */

const BEGINNER_LABELS = new Set([
  'good first issue',
  'beginner',
  'easy',
  'starter',
  'first-timers-only',
  'help wanted',
]);

interface SkillMatchInput {
  /** User's top languages ordered by relevance (index 0 = most used) */
  userLanguages: string[];
  /** User's starred repo topics/categories */
  userTopics: string[];
  /** Number of repos the user has contributed to */
  contributedRepoCount: number;
  /** The primary language of the issue's repository */
  repoLanguage: string | undefined;
  /** Topics/labels on the issue */
  issueLabels: string[];
}

export function calculateSkillMatchScore(input: SkillMatchInput): number {
  const {
    userLanguages,
    userTopics,
    contributedRepoCount,
    repoLanguage,
    issueLabels,
  } = input;

  let score = 0;

  // --- Language match (max 50) ---
  if (repoLanguage && userLanguages.length > 0) {
    const normalised = repoLanguage.toLowerCase();
    const idx = userLanguages.findIndex(l => l.toLowerCase() === normalised);
    if (idx === 0) score += 50;
    else if (idx === 1) score += 30;
    else if (idx >= 2) score += 15;
  }

  // --- Topic match (max 30) ---
  if (userTopics.length > 0) {
    const lowerTopics = new Set(userTopics.map(t => t.toLowerCase()));
    const lowerLabels = issueLabels.map(l => l.toLowerCase());
    const matchCount = lowerLabels.filter(l => lowerTopics.has(l)).length;
    // Cap at 3 matches = full score
    const topicScore = Math.min(matchCount / 3, 1) * 30;
    score += topicScore;
  }

  // --- Difficulty fit (max 20) ---
  const hasBeginnerLabel = issueLabels.some(l =>
    BEGINNER_LABELS.has(l.toLowerCase()),
  );
  if (hasBeginnerLabel) {
    // Fewer contributions = higher difficulty fit (beginner issues suit beginners)
    if (contributedRepoCount <= 3) score += 20;
    else if (contributedRepoCount <= 10) score += 15;
    else score += 10;
  }

  return Math.round(Math.min(score, 100));
}

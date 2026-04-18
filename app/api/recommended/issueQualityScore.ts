import { IssueQualityGrade, IssueQualityScore } from '../../types';

/**
 * Minimal shape required from a GitHub issue object to compute quality score.
 * Uses optional fields so it accepts both Octokit search results and our internal Issue type.
 */
export interface GithubIssueLike {
  body?: string | null;
  comments?: number | null;
  assignees?: ReadonlyArray<unknown> | null;
  assignee?: unknown;
  labels?: ReadonlyArray<{ name?: string | null } | string | null> | null;
}

const BEGINNER_LABEL_PATTERNS = [
  'good first issue',
  'good-first-issue',
  'help wanted',
  'help-wanted',
  'beginner',
  'beginner friendly',
  'beginner-friendly',
  'first-timers-only',
  'first timers only',
  'easy',
];

const scoreBody = (body?: string | null): number => {
  if (!body) return 0;
  const len = body.trim().length;
  if (len >= 200) return 30;
  if (len >= 100) return 20;
  if (len >= 50) return 10;
  return 0;
};

const scoreComments = (comments?: number | null): number => {
  return (comments ?? 0) >= 1 ? 25 : 0;
};

const scoreAssignee = (
  issue: GithubIssueLike,
): { points: number; hasAssignee: boolean } => {
  const hasAssigneesArr = Array.isArray(issue.assignees) && issue.assignees.length > 0;
  const hasAssigneeField = issue.assignee != null;
  const hasAssignee = hasAssigneesArr || hasAssigneeField;
  return { points: hasAssignee ? 0 : 25, hasAssignee };
};

const scoreLabels = (
  labels?: GithubIssueLike['labels'],
): { points: number; hasBeginnerLabel: boolean } => {
  if (!labels || labels.length === 0) {
    return { points: 10, hasBeginnerLabel: false };
  }
  const names = labels
    .map(l => {
      if (typeof l === 'string') return l;
      if (l && typeof l === 'object' && 'name' in l) return l.name ?? '';
      return '';
    })
    .map(n => n.toLowerCase().trim())
    .filter(n => n.length > 0);

  const hasBeginnerLabel = names.some(name =>
    BEGINNER_LABEL_PATTERNS.some(pattern => {
      if (pattern.includes(' ') || pattern.includes('-')) {
        return name.includes(pattern);
      }
      return name === pattern || name.split(/[- ]/).includes(pattern);
    }),
  );
  return { points: hasBeginnerLabel ? 20 : 10, hasBeginnerLabel };
};

const gradeForScore = (score: number): IssueQualityGrade => {
  if (score >= 80) return 'A';
  if (score >= 50) return 'B';
  return 'C';
};

/**
 * Pure function: compute a 0–100 quality score and A/B/C grade for a single GitHub issue.
 * No network calls — uses only fields already present on the issue object.
 */
export const calculateIssueQualityScore = (issue: GithubIssueLike): IssueQualityScore => {
  const bodyText = issue.body ?? '';
  const bodyLength = bodyText.trim().length;
  const bodyPoints = scoreBody(bodyText);

  const comments = issue.comments ?? 0;
  const commentsPoints = scoreComments(comments);

  const { points: assigneePoints, hasAssignee } = scoreAssignee(issue);
  const { points: labelPoints, hasBeginnerLabel } = scoreLabels(issue.labels);

  const score = bodyPoints + commentsPoints + assigneePoints + labelPoints;

  return {
    grade: gradeForScore(score),
    score,
    signals: {
      bodyLength,
      bodyPoints,
      comments,
      commentsPoints,
      hasAssignee,
      assigneePoints,
      hasBeginnerLabel,
      labelPoints,
    },
  };
};

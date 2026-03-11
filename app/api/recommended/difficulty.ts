type Difficulty = 'beginner' | 'intermediate' | 'advanced';

const DIFFICULTY_LABELS: Record<Difficulty, string[]> = {
  beginner: [
    'good first issue',
    'beginner',
    'easy',
    'starter',
    'first-timers-only',
    'good-first-issue',
    'first timers only',
  ],
  intermediate: ['help wanted', 'medium', 'moderate', 'enhancement'],
  advanced: ['bug', 'complex', 'hard', 'performance', 'security'],
};

const DIFFICULTY_PRIORITY: Difficulty[] = ['beginner', 'intermediate', 'advanced'];

export const estimateDifficulty = (labels: { name: string }[]): Difficulty => {
  const lowerLabels = labels.map(l => l.name.toLowerCase());

  for (const difficulty of DIFFICULTY_PRIORITY) {
    const matches = DIFFICULTY_LABELS[difficulty];
    if (lowerLabels.some(label => matches.includes(label))) {
      return difficulty;
    }
  }

  return 'intermediate';
};

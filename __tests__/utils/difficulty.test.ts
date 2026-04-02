import { estimateDifficulty } from '@/app/api/recommended/difficulty';

const label = (name: string) => ({ name });

describe('estimateDifficulty', () => {
  describe('beginner labels', () => {
    it.each([
      'good first issue',
      'beginner',
      'easy',
      'starter',
      'first-timers-only',
      'good-first-issue',
      'first timers only',
    ])('returns beginner for label "%s"', labelName => {
      expect(estimateDifficulty([label(labelName)])).toBe('beginner');
    });

    it('returns beginner when mixed with other labels', () => {
      expect(estimateDifficulty([label('bug'), label('good first issue')])).toBe('beginner');
    });
  });

  describe('intermediate labels', () => {
    it.each(['help wanted', 'medium', 'moderate', 'enhancement'])(
      'returns intermediate for label "%s"',
      labelName => {
        expect(estimateDifficulty([label(labelName)])).toBe('intermediate');
      },
    );
  });

  describe('advanced labels', () => {
    it.each(['bug', 'complex', 'hard', 'performance', 'security'])(
      'returns advanced for label "%s"',
      labelName => {
        expect(estimateDifficulty([label(labelName)])).toBe('advanced');
      },
    );
  });

  describe('priority ordering', () => {
    it('prefers beginner over intermediate when both present', () => {
      expect(estimateDifficulty([label('help wanted'), label('good first issue')])).toBe(
        'beginner',
      );
    });

    it('prefers beginner over advanced when both present', () => {
      expect(estimateDifficulty([label('bug'), label('easy')])).toBe('beginner');
    });

    it('prefers intermediate over advanced when both present', () => {
      expect(estimateDifficulty([label('bug'), label('help wanted')])).toBe('intermediate');
    });
  });

  describe('default fallback', () => {
    it('returns intermediate when no labels match', () => {
      expect(estimateDifficulty([label('feature'), label('wontfix')])).toBe('intermediate');
    });

    it('returns intermediate for empty labels array', () => {
      expect(estimateDifficulty([])).toBe('intermediate');
    });

    it('returns intermediate for unknown labels', () => {
      expect(estimateDifficulty([label('v2.0'), label('blocked')])).toBe('intermediate');
    });
  });

  describe('case insensitivity', () => {
    it('matches beginner labels case-insensitively', () => {
      expect(estimateDifficulty([label('Good First Issue')])).toBe('beginner');
      expect(estimateDifficulty([label('EASY')])).toBe('beginner');
      expect(estimateDifficulty([label('Beginner')])).toBe('beginner');
    });

    it('matches intermediate labels case-insensitively', () => {
      expect(estimateDifficulty([label('Help Wanted')])).toBe('intermediate');
      expect(estimateDifficulty([label('MEDIUM')])).toBe('intermediate');
    });

    it('matches advanced labels case-insensitively', () => {
      expect(estimateDifficulty([label('BUG')])).toBe('advanced');
      expect(estimateDifficulty([label('Security')])).toBe('advanced');
    });
  });
});

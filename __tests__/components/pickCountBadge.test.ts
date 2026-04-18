import { describe, it, expect } from 'vitest';
import {
  resolvePickCountDisplay,
  PICK_COUNT_PRIVACY_THRESHOLD,
} from '@/app/components/pickCountBadge';

describe('resolvePickCountDisplay', () => {
  describe('hidden state', () => {
    it('hides the badge when pickCount is undefined', () => {
      expect(resolvePickCountDisplay(undefined)).toEqual({ kind: 'hidden' });
    });

    it('hides the badge when pickCount is null', () => {
      expect(resolvePickCountDisplay(null)).toEqual({ kind: 'hidden' });
    });

    it('hides the badge when pickCount is 0', () => {
      expect(resolvePickCountDisplay(0)).toEqual({ kind: 'hidden' });
    });

    it('hides the badge when pickCount is negative (defensive)', () => {
      expect(resolvePickCountDisplay(-3)).toEqual({ kind: 'hidden' });
    });
  });

  describe('few state (privacy guard)', () => {
    it('returns "few" for 1 pick', () => {
      expect(resolvePickCountDisplay(1)).toEqual({ kind: 'few' });
    });

    it('returns "few" for 4 picks (just below threshold)', () => {
      expect(resolvePickCountDisplay(4)).toEqual({ kind: 'few' });
    });
  });

  describe('exact state', () => {
    it('returns exact count at the threshold (5)', () => {
      expect(resolvePickCountDisplay(PICK_COUNT_PRIVACY_THRESHOLD)).toEqual({
        kind: 'exact',
        count: 5,
      });
    });

    it('returns exact count for 7 picks', () => {
      expect(resolvePickCountDisplay(7)).toEqual({ kind: 'exact', count: 7 });
    });

    it('returns exact count for large values', () => {
      expect(resolvePickCountDisplay(1234)).toEqual({ kind: 'exact', count: 1234 });
    });
  });

  describe('threshold boundary', () => {
    it('4 → few, 5 → exact (boundary behavior)', () => {
      expect(resolvePickCountDisplay(4).kind).toBe('few');
      expect(resolvePickCountDisplay(5).kind).toBe('exact');
    });
  });
});

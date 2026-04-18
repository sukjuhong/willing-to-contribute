/**
 * Threshold below which exact pick counts are hidden to protect user privacy
 * in small communities where the set of pickers could otherwise be identified.
 */
export const PICK_COUNT_PRIVACY_THRESHOLD = 5;

export type PickCountDisplay =
  | { kind: 'hidden' }
  | { kind: 'few' }
  | { kind: 'exact'; count: number };

/**
 * Decide how to render the pick-count badge for an issue.
 * - `undefined`/`0` → hidden (no one has picked yet; avoid empty social proof)
 * - `1`..`PICK_COUNT_PRIVACY_THRESHOLD - 1` → "few" (privacy guard)
 * - `>= PICK_COUNT_PRIVACY_THRESHOLD` → exact count
 */
export const resolvePickCountDisplay = (
  pickCount: number | undefined | null,
): PickCountDisplay => {
  if (pickCount == null || pickCount <= 0) return { kind: 'hidden' };
  if (pickCount < PICK_COUNT_PRIVACY_THRESHOLD) return { kind: 'few' };
  return { kind: 'exact', count: pickCount };
};

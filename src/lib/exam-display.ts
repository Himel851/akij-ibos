/**
 * Fixed platform rule: each wrong answer deducts this many points from the score.
 * Use this constant when scoring attempts (exam screen / submit).
 */
export const NEGATIVE_MARK_PER_WRONG = 0.25;

/** Label on candidate exam cards — always reflects the fixed rule above. */
export function candidateNegativeMarkingDisplayLabel(): string {
  return `-${NEGATIVE_MARK_PER_WRONG}/wrong`;
}

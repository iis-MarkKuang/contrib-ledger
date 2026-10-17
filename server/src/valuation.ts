/**
 * Numeric caps for the MVP formula in requirements §7.
 * The formula itself lives in that section; these numbers are fixed in SOLUTION.md.
 */
export const QUALITY_CAP = 20;
export const SIZE_CAP = 30;
export const MAINTAINER_CAP = 10;
/** Already-scored count at or above this value makes the next contribution score 0. */
export const WINDOW_LIMIT = 3;

export type ValuationInput = {
  base: number;
  quality: number;
  size: number;
  maintainer: number;
  scoredInWindow: number;
};

function clamp(value: number, cap: number): number {
  if (value <= 0) return 0;
  if (value >= cap) return cap;
  return value;
}

/** Pure score. Callers must only pass merged PRs or resolved issues. */
export function valueContribution(input: ValuationInput): number {
  if (input.scoredInWindow >= WINDOW_LIMIT) return 0;
  return (
    clamp(input.base, Number.POSITIVE_INFINITY) +
    clamp(input.quality, QUALITY_CAP) +
    clamp(input.size, SIZE_CAP) +
    clamp(input.maintainer, MAINTAINER_CAP)
  );
}

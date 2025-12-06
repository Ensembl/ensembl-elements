/**
 * Helper functions to create region intervals that should be requested.
 * The purpose of such helpers is to avoid requesting multiple intervals
 * that mostly overlap.
 * 
 * One can think of various strategies for requesting features:
 * - Use a constant step - e.g. 1 megabase -
 *   and round up the input interval to the nearest step
 * 
 * 
 */

export const getStepBasedInterval = ({
  start,
  end,
  step
}: {
  start: number;
  end: number;
  step: number;
}) => {
  if (start % step === 0) {
    // An interval should start at (k * step + 1) and end at (k+1) * step
    // e.g. start at 1 and end at 1,000,000; or start at 1,000,001 and end at 2,000,000
    // Therefore, if start position happens to be an exact multiple of step,
    // it belongs in the previous interval.
    start -= 1;
  }

  start = Math.floor(start / step) * step + 1;
  end = Math.ceil(end / step) * step;

  return { start, end };
};
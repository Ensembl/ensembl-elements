/**
 * The arithmetic that the toBedStart function does is elementary;
 * however, the function's presence, and its name, should serve
 * as a reminder of the necessity to transform Ensembl coordinates
 * to bed coordinates for drawing purposes.
 */

export const toZeroBased = (num: number) =>
  num - 1;
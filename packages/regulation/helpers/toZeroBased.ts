/**
 * The arithmetic that the toZeroBased function does is elementary.
 * However, the function's presence in the code, and its name, should serve
 * as a reminder of the necessity to transform Ensembl coordinates
 * to bed coordinates for drawing purposes.
 */

export const toZeroBased = (num: number) =>
  num - 1;
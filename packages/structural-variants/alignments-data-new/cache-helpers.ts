type Interval = {
  start: number;
  end: number;
};

/**
 * Given a list of cached intervals, and a query interval,
 * which may have been fully or partially cached,
 * return the parts of the query interval that have not been cached.
 */

export const getUncachedIntervals = ({
  cachedIntervals,
  queryInterval
}: {
  cachedIntervals: Interval[];
  queryInterval: Interval;
}) => {
  const intervalsForTesting = [queryInterval];
  const result = [];

  if (!cachedIntervals.length) {
    return intervalsForTesting;
  }

  for (const interval of intervalsForTesting) {
    for (const [cachedIntervalIndex, cachedInterval] of cachedIntervals.entries()) {
      const overhangingIntervals = compareIntervals({
        cachedInterval,
        queryInterval: interval
      });
      if (overhangingIntervals === null) {
        // test interval does not intersect with the cached interval
        if (cachedIntervalIndex === cachedIntervals.length - 1) {
          // there aren't any more cached intervals to compare with the test interval
          // therefore, add this interval to the list of final results
          result.push(interval);
        }
      } else if (!overhangingIntervals.length) {
        // this is an - admittedly obscure - sign
        // that the cached interval fully contains the test interval
        // => stop further checking of this test interval
        break;
      } else {
        // interval comparison has detected that the interval being tested
        // partly overlaps with the current cached interval
        // => add the remainder to the list of intervals for testing,
        // and break out of this loop
        intervalsForTesting.push(...overhangingIntervals);
        break;
      }
    }
  }

  return result;
};



const compareIntervals = ({
  cachedInterval,
  queryInterval
}: {
  cachedInterval: Interval;
  queryInterval: Interval;
}) => {
  if (cachedInterval.start <= queryInterval.start && cachedInterval.end >= queryInterval.end) {
    // cached interval overlaps and fully contains the query interval
    return [];
  } else if (queryInterval.start < cachedInterval.start && queryInterval.end > cachedInterval.end) {
    // cached interval overlaps the query interval;
    // query interval is larger than the cached interval, and overhangs on both sides
    const leftInterval = {
      start: queryInterval.start,
      end: cachedInterval.start - 1
    };
    const rightInterval = {
      start: cachedInterval.end + 1,
      end: queryInterval.end
    };
    return [ leftInterval, rightInterval ];
  } else if (queryInterval.end > cachedInterval.start && queryInterval.end <= cachedInterval.end ) {
    // overlaps;
    // query interval's left end overhangs
    const leftInterval = {
      start: queryInterval.start,
      end: cachedInterval.start - 1
    };
    return [leftInterval];
  } else if (queryInterval.start < cachedInterval.end && queryInterval.start >= cachedInterval.start ) {
    // overlaps;
    // query interval's right end overhangs
    const rightInterval = {
      start: cachedInterval.end + 1,
      end: queryInterval.end
    };
    return [rightInterval];
  } else {
    // intervals do not intersect
    return null;
  }
}
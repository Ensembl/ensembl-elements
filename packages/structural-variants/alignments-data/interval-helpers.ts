export type Interval = {
  start: number;
  end: number;
};

/**
 * Given a set of intervals, and another interval (a query interval),
 * find which parts of the query interval overlap the intervals in the set,
 * and which parts don't.
 * Returns an object with two fields:
 * - overlappingIntervals: array of intervals
 *   that are parts of the query interval that overlap the intervals in the set
 * - nonOverlappingIntervals: array of intervals within the query interval
 *   that do not overlap with the intervals in the set
 */

export const checkIntervalOverlap = ({
  intervals,
  queryInterval
}: {
  intervals: Interval[];
  queryInterval: Interval;
}): {
  overlappingIntervals: Interval[];
  nonOverlappingIntervals: Interval[];
} => {
  const intervalsForTesting = [queryInterval];

  const overlappingIntervals = [];
  const nonOverlappingIntervals = [];

  if (!intervals.length) {
    return {
      overlappingIntervals: [],
      nonOverlappingIntervals: intervalsForTesting
    };
  }

  while (intervalsForTesting.length) {
    const interval = intervalsForTesting.shift() as Interval;

    for (const [intervalFromSetIndex, intervalFromSet] of intervals.entries()) {
      const {
        intersecting: intersectingInterval,
        nonIntersecting: nonIntersectingIntervals
      } = compareIntervals({
        referenceInterval: intervalFromSet,
        queryInterval: interval
      });

      if (!intersectingInterval && intervalFromSetIndex === intervals.length - 1) {
        // This is last loop of the cycle.
        // There aren't any more intervals to compare with the test interval
        // therefore, add this test interval to the list of final results
        nonOverlappingIntervals.push(interval);
      } else if (intersectingInterval) {
        overlappingIntervals.push(intersectingInterval);
        if (nonIntersectingIntervals.length) {
          intervalsForTesting.push(...nonIntersectingIntervals);
        }
        break;
      }
    }
  }

  return {
    overlappingIntervals,
    nonOverlappingIntervals
  };
};



export const compareIntervals = ({
  referenceInterval,
  queryInterval
}: {
  referenceInterval: Interval;
  queryInterval: Interval;
}): {
  intersecting: Interval | null;
  nonIntersecting: Interval[];
} => {
  if (referenceInterval.start <= queryInterval.start && referenceInterval.end >= queryInterval.end) {
    // reference interval overlaps and fully contains the query interval
    return {
      intersecting: queryInterval,
      nonIntersecting: []
    };
  } else if (queryInterval.start < referenceInterval.start && queryInterval.end > referenceInterval.end) {
    // query interval contains the reference interval, and overhangs on both sides
    const leftInterval = {
      start: queryInterval.start,
      end: referenceInterval.start - 1
    };
    const rightInterval = {
      start: referenceInterval.end + 1,
      end: queryInterval.end
    };
    return {
      intersecting: { start: referenceInterval.start, end: referenceInterval.end },
      nonIntersecting: [ leftInterval, rightInterval ] 
    };
  } else if (queryInterval.end > referenceInterval.start && queryInterval.end <= referenceInterval.end ) {
    // overlaps;
    // query interval's left end overhangs
    const leftInterval = {
      start: queryInterval.start,
      end: referenceInterval.start - 1
    };
    return {
      intersecting: { start: referenceInterval.start, end: queryInterval.end },
      nonIntersecting: [leftInterval]
    };
  } else if (queryInterval.start < referenceInterval.end && queryInterval.start >= referenceInterval.start ) {
    // overlaps;
    // query interval's right end overhangs
    const rightInterval = {
      start: referenceInterval.end + 1,
      end: queryInterval.end
    };
    return {
      intersecting: { start: queryInterval.start, end: referenceInterval.end },
      nonIntersecting: [rightInterval]
    };
  } else {
    // intervals do not intersect
    return {
      intersecting: null,
      nonIntersecting: [queryInterval]
    };
  }
}
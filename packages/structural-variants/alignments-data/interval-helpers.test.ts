import { describe, test } from 'node:test';
import assert from 'node:assert';

import { compareIntervals, checkIntervalOverlap, type Interval } from './interval-helpers';


describe('compareIntervals', () => {

  test('non-overlapping intervals', () => {
    const interval1 = { start: 1, end: 100 };
    const interval2 = { start: 201, end: 300 };

    const result = compareIntervals({
      referenceInterval: interval1,
      queryInterval: interval2
    });

    const expected = {
      intersecting: null,
      nonIntersecting: [interval2]
    }

    assert.deepStrictEqual(result, expected);
  });

  test('reference interval contains query interval', () => {
    const interval1 = { start: 1, end: 100 };
    const interval2 = { start: 10, end: 90 };

    const result = compareIntervals({
      referenceInterval: interval1,
      queryInterval: interval2
    });

    const expected = {
      intersecting: { start: 10, end: 90 },
      nonIntersecting: []
    }

    assert.deepStrictEqual(result, expected);
  });

  test('tail of query interval overlaps with reference', () => {
    const interval1 = { start: 100, end: 200 };
    const interval2 = { start: 10, end: 120 };

    const result = compareIntervals({
      referenceInterval: interval1,
      queryInterval: interval2
    });

    const expected = {
      intersecting: { start: 100, end: 120 },
      nonIntersecting: [{ start: 10, end: 99 }]
    };

    assert.deepStrictEqual(result, expected);
  });


  test('head of query interval overlaps with reference', () => {
    const interval1 = { start: 100, end: 200 };
    const interval2 = { start: 150, end: 220 };

    const result = compareIntervals({
      referenceInterval: interval1,
      queryInterval: interval2
    });

    const expected = {
      intersecting: { start: 150, end: 200 },
      nonIntersecting: [{ start: 201, end: 220 }]
    };

    assert.deepStrictEqual(result, expected);
  });

  test('query interval contains the reference interval', () => {
    const interval1 = { start: 100, end: 200 };
    const interval2 = { start: 1, end: 300 };

    const result = compareIntervals({
      referenceInterval: interval1,
      queryInterval: interval2
    });

    const expected = {
      intersecting: interval1,
      nonIntersecting: [{ start: 1, end: 99 }, { start: 201, end: 300 }]
    };

    assert.deepStrictEqual(result, expected);
  });

});

describe('checkIntervalOverlap', () => {

  test('reference intervals are an empty list', () => {
    const referenceIntervals: Interval[] = [];
    const queryInterval = { start: 201, end: 300 };
    const result = checkIntervalOverlap({
      intervals: referenceIntervals,
      queryInterval
    });

    const expected = {
      overlappingIntervals: [],
      nonOverlappingIntervals: [queryInterval]
    }

    assert.deepStrictEqual(result, expected);
  });

  test('non-overlapping intervals', () => {
    const referenceIntervals = [
      { start: 1, end: 100 },
      { start: 101, end: 200 }
    ];
    const queryInterval = { start: 201, end: 300 };
    const result = checkIntervalOverlap({
      intervals: referenceIntervals,
      queryInterval
    });

    const expected = {
      overlappingIntervals: [],
      nonOverlappingIntervals: [queryInterval]
    }

    assert.deepStrictEqual(result, expected);
  });

  test('query interval is fully contained within a single reference interval', () => {
    const referenceIntervals = [
      { start: 1, end: 100 },
      { start: 101, end: 200 }
    ];
    const queryInterval = { start: 120, end: 180 }; // is within the second reference interval
    const result = checkIntervalOverlap({
      intervals: referenceIntervals,
      queryInterval
    });

    const expected = {
      overlappingIntervals: [queryInterval],
      nonOverlappingIntervals: [] // NOTE: we are only interested in the parts of the query interval that overhang
    };

    assert.deepStrictEqual(result, expected);
  });

  test('different parts of query interval are in different the reference intervals', () => {
    const referenceIntervals = [
      { start: 1, end: 100 },
      { start: 101, end: 200 }
    ];
    const queryInterval = { start: 80, end: 180 };
    const result = checkIntervalOverlap({
      intervals: referenceIntervals,
      queryInterval
    });

    const expected = {
      overlappingIntervals: [{ start: 80, end: 100 }, { start: 101, end: 180 }],
      nonOverlappingIntervals: [] // NOTE: we are only interested in the parts of the query interval that overhang
    };

    assert.deepStrictEqual(result, expected);
  });


  test('query interval overhangs to the left', () => {
    const referenceIntervals = [
      { start: 101, end: 200 },
      { start: 201, end: 300 }
    ];
    const queryInterval = { start: 80, end: 120 };
    const result = checkIntervalOverlap({
      intervals: referenceIntervals,
      queryInterval
    });

    const expected = {
      overlappingIntervals: [{ start: 101, end: 120 }],
      nonOverlappingIntervals: [ { start: 80, end: 100 } ] // NOTE: we are only interested in the parts of the query interval that overhang
    };

    assert.deepStrictEqual(result, expected);
  });

  test('query interval overhangs to the right', () => {
    const referenceIntervals = [
      { start: 1, end: 100 },
      { start: 101, end: 200 },
    ];
    const queryInterval = { start: 180, end: 220 };
    const result = checkIntervalOverlap({
      intervals: referenceIntervals,
      queryInterval
    });

    const expected = {
      overlappingIntervals: [{ start: 180, end: 200 }],
      nonOverlappingIntervals: [ { start: 201, end: 220 } ] // NOTE: we are only interested in the parts of the query interval that overhang
    };

    assert.deepStrictEqual(result, expected);
  });

  test('query interval overhangs on both sides', () => {
    const referenceIntervals = [
      { start: 101, end: 200 },
      { start: 201, end: 300 }
    ];
    const queryInterval = { start: 80, end: 320 };
    const result = checkIntervalOverlap({
      intervals: referenceIntervals,
      queryInterval
    });

    const expected = {
      overlappingIntervals: [{ start: 101, end: 200 }, { start: 201, end: 300 }],
      nonOverlappingIntervals: [ { start: 80, end: 100 }, { start: 301, end: 320 } ]
    };

    assert.deepStrictEqual(result, expected);
  });

});
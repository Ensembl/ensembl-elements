import { describe, test } from 'node:test';
import assert from 'node:assert';

import { getUncachedIntervals } from './cache-helpers';


describe('getUncachedIntervals', () => {

  test('non-overlapping intervals', () => {
    const cachedIntervals = [
      { start: 1, end: 100 },
      { start: 101, end: 200 }
    ];
    const queryInterval = { start: 201, end: 300 }; // is not within cached intervals
    const uncachedIntervals = getUncachedIntervals({
      cachedIntervals,
      queryInterval
    });

    assert.deepStrictEqual([queryInterval], uncachedIntervals);
  });

  test('query interval is fully contained in a single cached interval', () => {
    const cachedIntervals = [
      { start: 1, end: 100 },
      { start: 101, end: 200 }
    ];
    const queryInterval = { start: 120, end: 180 }; // is within the second cached interval
    const uncachedIntervals = getUncachedIntervals({
      cachedIntervals,
      queryInterval
    });

    assert.deepStrictEqual(uncachedIntervals, []);
  });

  test('different parts of query interval are fully contained in cached intervals', () => {
    const cachedIntervals = [
      { start: 1, end: 100 },
      { start: 101, end: 200 }
    ];
    const queryInterval = { start: 80, end: 180 }; // part is cached in the first interval, another part in the second
    const uncachedIntervals = getUncachedIntervals({
      cachedIntervals,
      queryInterval
    });

    assert.deepStrictEqual(uncachedIntervals, []);
  });


  test('query interval overhangs to the left', () => {
    const cachedIntervals = [
      { start: 101, end: 200 },
      { start: 201, end: 300 }
    ];
    const queryInterval = { start: 80, end: 120 };
    const uncachedIntervals = getUncachedIntervals({
      cachedIntervals,
      queryInterval
    });

    const expectedUncachedIntervals = [{
      start: 80,
      end: 100
    }];

    assert.deepStrictEqual(uncachedIntervals, expectedUncachedIntervals);
  });

  test('query interval overhangs to the right', () => {
    const cachedIntervals = [
      { start: 1, end: 100 },
      { start: 101, end: 200 },
    ];
    const queryInterval = { start: 180, end: 220 };
    const uncachedIntervals = getUncachedIntervals({
      cachedIntervals,
      queryInterval
    });

    const expectedUncachedIntervals = [{
      start: 201,
      end: 220
    }];

    assert.deepStrictEqual(uncachedIntervals, expectedUncachedIntervals);
  });

  test('query interval overhangs on both sides', () => {
    const cachedIntervals = [
      { start: 101, end: 200 },
      { start: 201, end: 300 }
    ];
    const queryInterval = { start: 80, end: 320 };
    const uncachedIntervals = getUncachedIntervals({
      cachedIntervals,
      queryInterval
    });

    const expectedUncachedIntervals = [
      {
        start: 80,
        end: 100
      },
      {
        start: 301,
        end: 320
      }
    ];

    assert.deepStrictEqual(uncachedIntervals, expectedUncachedIntervals);
  });

});
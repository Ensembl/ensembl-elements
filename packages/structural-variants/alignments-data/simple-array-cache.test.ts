import { describe, test } from 'node:test';
import assert from 'node:assert';

import { SimpleArrayCache } from './simple-array-cache';

describe.only('SimpleArrayCache', () => {

  describe('basic caching functionality', () => {
    const batch = [...Array(10)]
      .map((_, i) => i)
      .map((number) => {
        const start = number * 10 + 1;
        const end = start + 5;
        const id = `${start}-${end}`;
        return {
          id,
          start,
          end
        }
      });

    test('retrieve all features after adding them', () => {
      const cache = new SimpleArrayCache();
      const intervalForCaching = { start: 1, end: 100 };

      cache.add({
        features: batch,
        interval: intervalForCaching
      });

      // read back features from the whole interval that was cached
      const queryInterval = intervalForCaching;

      const retrieved = cache.get(queryInterval);
      assert.deepStrictEqual(batch, retrieved);
    });

    test('retrieve features from a subinterval', () => {
      const cache = new SimpleArrayCache<{ id: string, start: number; end: number }>();
      const intervalForCaching = { start: 1, end: 100 };

      cache.add({
        features: batch,
        interval: intervalForCaching
      });

      // read back features from the whole interval that was cached
      const queryInterval = { start: 40, end: 80 };

      const retrieved = cache.get(queryInterval);

      const expectedStarts = [41, 51, 61, 71];
      const expectedEnds = [46, 56, 66, 76];

      assert.deepStrictEqual(retrieved.map(({ start }) => start), expectedStarts);
      assert.deepStrictEqual(retrieved.map(({ end }) => end), expectedEnds);
    });

    test('retrieve features partly overlapping query interval', () => {
      const cache = new SimpleArrayCache<{ id: string, start: number; end: number }>();
      const intervalForCaching = { start: 1, end: 100 };

      cache.add({
        features: batch,
        interval: intervalForCaching
      });

      // read back features from the whole interval that was cached
      const queryInterval = { start: 42, end: 75 };

      const retrieved = cache.get(queryInterval);

      const expectedStarts = [41, 51, 61, 71];
      const expectedEnds = [46, 56, 66, 76];

      assert.deepStrictEqual(retrieved.map(({ start }) => start), expectedStarts);
      assert.deepStrictEqual(retrieved.map(({ end }) => end), expectedEnds);
    });

  });

  describe('getting uncached intervals', () => {

    const features = [{id: 1, start: 100, end: 200}];
    const cachedInterval = { start: 100, end: 200 };
    const cache = new SimpleArrayCache();

    cache.add({
      features,
      interval: cachedInterval
    });

    test('interval not cached', () => {
      const queryInterval = { start: 1000, end: 2000 };
      const uncachedIntervals = cache.getUncachedIntervals(queryInterval);

      assert.deepStrictEqual(uncachedIntervals, [queryInterval]);
    });

    test('interval fully cached', () => {
      // end to end
      let queryInterval = { start: 100, end: 200 };
      let uncachedIntervals = cache.getUncachedIntervals(queryInterval);
      assert.deepStrictEqual(uncachedIntervals, []);

      // inside of cached interval
      queryInterval = { start: 120, end: 150 };
      uncachedIntervals = cache.getUncachedIntervals(queryInterval);
      assert.deepStrictEqual(uncachedIntervals, []);
    });

    test('left part of interval not cached', () => {
      const queryInterval = { start: 80, end: 120 };
      const uncachedIntervals = cache.getUncachedIntervals(queryInterval);

      assert.deepStrictEqual(uncachedIntervals, [{ start: 80, end: 99 }]);
    });

    test('right part of interval not cached', () => {
      const queryInterval = { start: 150, end: 220 };
      const uncachedIntervals = cache.getUncachedIntervals(queryInterval);

      assert.deepStrictEqual(uncachedIntervals, [{ start: 201, end: 220 }]);
    });

    test('left and right parts of interval not cached', () => {
      const queryInterval = { start: 80, end: 220 };
      const uncachedIntervals = cache.getUncachedIntervals(queryInterval);

      const expectedUncachedIntervals = [
        {
          start: 80,
          end: 99
        },
        {
          start: 201,
          end: 220
        }
      ];
      assert.deepStrictEqual(uncachedIntervals, expectedUncachedIntervals);
    });

  });

  describe('adding items to cache', () => {
    const batch = [...Array(10)]
      .map((_, i) => i)
      .map((number) => {
        const start = number * 10 + 1;
        const end = start + 5;
        const id = `${start}-${end}`;
        return {
          id,
          start,
          end
        }
      });


    test('retrieve items from several inserted intervals', () => {
      const newBatch = [...Array(10)]
        .map((_, i) => i)
        .map((number) => {
          const start = number * 10 + 101; // <-- start right after the previous batch
          const end = start + 5;
          const id = `${start}-${end}`;
          return {
            id,
            start,
            end
          }
        });
      const cache = new SimpleArrayCache<{ id: string, start: number; end: number }>();
      
      cache.add({ interval: { start: 1, end: 100 }, features: batch });
      cache.add({ interval: { start: 101, end: 200 }, features: newBatch });

      // use an interval that intersects both intervals above
      const queryInterval = { start: 80, end: 120 };

      const expectedStarts = [81, 91, 101, 111];
      const expectedEnds = [86, 96, 106, 116];

      const retrieved = cache.get(queryInterval);

      const retrievedStarts = retrieved.map(item => item.start);
      const retrievedEnds = retrieved.map(item => item.end);

      assert.deepStrictEqual(expectedStarts, retrievedStarts);
      assert.deepStrictEqual(expectedEnds, retrievedEnds);
    });


    test('deduplication of items with same id', () => {
      const newBatch = [ { id: '51-56', start: 51, end: 56 } ]; // contains a single item with same id as an already cached one
      const cache = new SimpleArrayCache<{ id: string, start: number; end: number }>();
      
      cache.add({ interval: { start: 1, end: 100 }, features: batch });
      cache.add({ interval: { start: 50, end: 200 }, features: newBatch });

      const queryInterval = { start: 50, end: 60 };

      // Expect to retrieve a single cached item.
      const expectedItems = [ { id: '51-56', start: 51, end: 56 } ];

      const retrieved = cache.get(queryInterval);

      assert.deepStrictEqual(retrieved, expectedItems);
    });

  });

});
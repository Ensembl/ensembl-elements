import { describe, test } from 'node:test';
import assert from 'node:assert';

import { DataService } from './data-service';

type SimpleFeature = {
  id: string;
  start: number;
  end: number;
};

const buildSimpleFeatures = (params: {
  from: number;
  to: number;
  size: number;
}) => {
  const { from, to, size } = params;
  const distance = to - from;
  const numFeatures = Math.floor(distance / size);
  
  const features = [...Array(numFeatures)].map((_, index) => {
    const start = from + size * index;
    const end = start + size;
    return {
      id: `${start}-${end}`,
      start,
      end
    };
  });

  return features;
}

describe('DataService', () => {
  const simpleFeatures = [[1, 10], [11, 20], [21, 30]].map(([start, end]) => ({
    id: `${start}-${end}`,
    start,
    end
  }));

  test('single data request', async () => {
    const intervalStart = 1;
    const intervalEnd = 100;
    const featureSize = 10;
    const features = buildSimpleFeatures({
      from: intervalStart,
      to: intervalEnd,
      size: featureSize
    });

    const mockLoader = () => {
      return Promise.resolve(features);
    }

    const dataService = new DataService<SimpleFeature>({
      loader: mockLoader,
    });

    const result = await dataService.get({ start: intervalStart, end: intervalEnd });

    const expectedResult = features;

    assert.deepStrictEqual(result, expectedResult);
  });

  test('request of same interval while previous request is in flight', async () => {
    const intervalStart = 1;
    const intervalEnd = 100;
    const featureSize = 10;
    const features = buildSimpleFeatures({
      from: intervalStart,
      to: intervalEnd,
      size: featureSize
    });

    let { promise: loaderBlockRemoved, resolve: removeLoaderBlocker } = Promise.withResolvers();
    let loaderCalledTimes = 0;
    const mockLoader = async () => {
      loaderCalledTimes++;
      await loaderBlockRemoved;
      return features;
    }

    const dataService = new DataService<SimpleFeature>({
      loader: mockLoader,
    });

    // call once
    dataService.get({ start: intervalStart, end: intervalEnd });

    // call second time, synchronously; the request from the previous call shouldn't have resolved
    const featuresPromise = dataService.get({ start: intervalStart, end: intervalEnd });

    // the loader should have been called only once
    assert.strictEqual(loaderCalledTimes, 1);
    
    removeLoaderBlocker('whatever');

    const result = await featuresPromise;
    const expectedResult = features;

    assert.deepStrictEqual(result, expectedResult);
  });



  test('request an interval that overlaps a previously requested one', async () => {
    const intervalStart = 1;
    const intervalEnd = 100;
    const featureSize = 10;
    const features = buildSimpleFeatures({
      from: intervalStart,
      to: intervalEnd,
      size: featureSize
    });

    let loaderCalledTimes = 0;
    const recordedRequests: { start: number, end: number }[] = [];
    const mockLoader = async (params: { start: number, end: number }) => {
      loaderCalledTimes++;
      recordedRequests.push(params);
      return features;
    }

    const dataService = new DataService<SimpleFeature>({
      loader: mockLoader
    });

    await dataService.get({ start: 40, end: 60 });
    await dataService.get({ start: 1, end: 100 });

    // Expect the service to have made 3 requests:
    // one for the first interval (which is then cached),
    // and then one for each of the sides of the larger interval
    assert.strictEqual(loaderCalledTimes, 3);

    const expectedParamsOfRequests = [
      { start: 1, end: 39},
      { start: 40, end: 60},
      { start: 61, end: 100}
    ];

    assert.deepStrictEqual(
      recordedRequests.toSorted((a, b) => a.start - b.start),
      expectedParamsOfRequests
    );
  });

});
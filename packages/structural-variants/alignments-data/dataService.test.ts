import { describe, test } from 'node:test';
import assert from 'node:assert';

import { DataService } from './dataService';

type Feature = {
  id: string;
  start: number;
  end: number;
};

describe('DataService', () => {

  test('features do not overlap bin boundaries', async () => {
    const mockLoader = () => {
      const locations = [[1, 10], [11, 20], [21, 30]].map(([start, end]) => ({
        id: `${start}-${end}`,
        start,
        end
      }));
      return Promise.resolve(locations);
    }

    const dataService = new DataService<Feature>({
      loader: mockLoader,
      binSize: 10
    });

    const result = await dataService.get({ start: 1, end: 30 });

    const expectedResult = await mockLoader();

    assert.deepStrictEqual(result, expectedResult);
  });


  test('features overlap bin boundaries', async () => {
    const mockLoader = () => {
      const locations = [[1, 55], [31, 67], [39, 72]].map(([start, end]) => ({
        id: `${start}-${end}`,
        start,
        end
      }));
      return Promise.resolve(locations);
    }

    const dataService = new DataService<Feature>({
      loader: mockLoader,
      binSize: 10
    });

    const result = await dataService.get({ start: 1, end: 100 });

    const expectedResult = await mockLoader();

    assert.deepStrictEqual(result, expectedResult);
  });


  test('requesting features while they are being loaded', async () => {
    let timesCalledLoader = 0;

    const mockLoader = () => {
      timesCalledLoader++;

      const locations = [[1, 55], [31, 67], [39, 72]].map(([start, end]) => ({
        id: `${start}-${end}`,
        start,
        end
      }));
      return Promise.resolve(locations);
    }

    const dataService = new DataService<Feature>({
      loader: mockLoader,
      binSize: 10
    });

    dataService.get({ start: 1, end: 100 }); // <-- note that we aren't waiting for the result here
    const result = await dataService.get({ start: 1, end: 35 }); // <-- this should now start while the previous data is loading


    // Although the loader returns three features, the last dataService.get call
    // only asks for features within the 1-35 slice; so we are expecting it to return two features
    const expectedResult = [
      { id: '1-55', start: 1, end: 55 },
      { id: '31-67', start: 31, end: 67 }
    ];

    assert.deepStrictEqual(result, expectedResult);
    assert.strictEqual(timesCalledLoader, 1);
  });

  test('using cached data to modify requests', { only: true }, async () => {
    const recordedRequestParams: Array<{start: number; end: number;}> = [];

    const mockLoader = (params: {start: number; end: number;}) => {
      recordedRequestParams.push(params);
      const { start, end } = params;

      const feature = {
        id: `${start}-${end}`,
        start,
        end
      };

      return Promise.resolve([feature]);
    }

    const dataService = new DataService<Feature>({
      loader: mockLoader,
      binSize: 100
    });

    await dataService.get({ start: 220, end: 280 });
    const result = await dataService.get({ start: 180, end: 320 });

    assert.strictEqual(recordedRequestParams.length, 3); // three requests were made via the loader

    // The first captured request params should reflect what data was requested first (via the .get method)
    assert.deepStrictEqual(recordedRequestParams[0], { start: 201, end: 300 });

    // The second and the third captured request params should demonstrate
    // that the previously requested slice (between 201 and 300) was not requested again;
    // but that the service requested data to either side of the previously requested slice
    const remainingRequestParams = recordedRequestParams.slice(1).toSorted((a, b) => a.start - b.start);
    assert.deepStrictEqual(remainingRequestParams, [
      { start: 101, end: 200 },
      { start: 301, end: 400 }
    ]);

    // Finally, confirm that the data service can retrieve both the earlier retrieved data,
    // and the more recently fetched one
    assert.deepStrictEqual(result, [
      { id: '101-200', start: 101, end: 200 },
      { id: '201-300', start: 201, end: 300 },
      { id: '301-400', start: 301, end: 400 }
    ]);
  });

});
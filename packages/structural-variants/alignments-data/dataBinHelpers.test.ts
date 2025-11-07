import { describe, test } from 'node:test';
import assert from 'node:assert';

import { combineLoadingLocations } from './dataBinHelpers';

describe('combineLoadingLocations', () => {

  test('combining contiguous locations into a single one', () => {
    const inputLocations = [
      {
        start: 1,
        end: 10
      },
      {
        start: 11,
        end: 20
      },
      {
        start: 21,
        end: 30
      }
    ];
    const expectedLocations = [{
      start: 1,
      end: 30
    }];

    assert.deepStrictEqual(combineLoadingLocations(inputLocations), expectedLocations);
  });

  test('combining locations with a gap between them into multiple locations', () => {
    const inputLocations = [
      {
        start: 1,
        end: 10
      },
      {
        start: 11,
        end: 20
      },
      {
        start: 31, // <-- there is a gap between start of this location and the end of the previous one
        end: 40
      },
      {
        start: 41,
        end: 50
      }
    ];
    const expectedLocations = [
      {
        start: 1,
        end: 20
      },
      {
        start: 31,
        end: 50
      },
    ];

    assert.deepStrictEqual(combineLoadingLocations(inputLocations), expectedLocations);
  });

});
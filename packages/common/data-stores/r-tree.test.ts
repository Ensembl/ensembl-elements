import { describe, it } from 'node:test';
import assert from 'node:assert';

import { RTree } from './r-tree.ts';

describe('R-tree', () => {

  describe('insertion and retrieval', () => {

    it('retrieves the entries overlapping the query', () => {
      const entry1 = { start: 100, end: 200, id: 'one' };
      const entry2 = { start: 120, end: 180, id: 'two' };
      const entry3 = { start: 180, end: 280, id: 'three' };
      const entry4 = { start: 80, end: 120, id: 'four' };
      const entry5 = { start: 80, end: 220, id: 'five' };
      const entry6 = { start: 10, end: 80, id: 'six' };
      const entry7 = { start: 201, end: 230, id: 'seven' };

      const tree = new RTree<typeof entry1>({ maxEntries: 4 }); // setting max entries to 4 will cause a split given the above number of entries
      const allEntries = [ entry1, entry2, entry3, entry4, entry5, entry6, entry7 ];
      
      for (const entry of allEntries) {
        tree.insert(entry);
      }

      const retrieved = tree.search({ start: 100, end: 200});
      const retrievedIds = retrieved.map(({ id }) => id);

      const expectedIds = ['one', 'two', 'three', 'four', 'five']; // entries 6 and 7 are outside the queried interval

      assert.deepEqual(retrievedIds.toSorted(), expectedIds.toSorted());
    });
  });

});
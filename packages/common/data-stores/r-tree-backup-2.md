// R-tree described in the following paper:
// http://www-db.deis.unibo.it/courses/SI-LS/papers/Gut84.pdf

// Other notable examples
// https://github.com/mourner/rbush/blob/main/index.js

export type Interval = {
  start: number;
  end: number;
};

type StorableFeature = Interval & {
  id: string;
}


class RTreeBasedStore<T extends StorableFeature> {
  storedIds = new Set<string>();

  tree: RTreeNode<T>

  constructor() {
    this.tree = new RTreeNode();
  }

  add() {

  }

  queryLocation(params: { start: number, end: number; }) {

  }
}



/**
 * Terminology:
 * - bbox: bounding box, or "minimum bounding rectangle"
 *   (in our case, the height of this rectangle is 0, because we are only interested in a single dimension)
 */




type LeafNodeEntry<T> = [
  Interval,
  T
];

type NonLeafNodeEntry<T> = [
  Interval,
  LeafNode<T> | NonLeafNode<T>
];

type NodeType = 'leaf' | 'internal';

type LeafNode<T> = {
  isLeaf: true;
  entries: LeafNodeEntry<T>[];
  // bbox: Interval;
  parent: NonLeafNode<T> | null;
}

type NonLeafNode<T> = {
  isLeaf: false;
  entries: NonLeafNodeEntry<T>[];
  // bbox: Interval;
  parent: NonLeafNode<T> | null;
}

export class RTreeNode<T extends Interval> {
  isLeaf: boolean = true;
  entries: Array<[ Interval, RTreeNode<T> | T ]> = [];
  #maxEntries: number;
  #minEntries: number;
  parent: NonLeafNode<T> | null = null;

  constructor({
    isLeaf = true,
    maxEntries= 10,
    parent
  }: {
    isLeaf?: boolean;
    maxEntries?: number;
    parent?: NonLeafNode<T> | null;
  }) {
    this.isLeaf = isLeaf;
    this.#maxEntries = maxEntries;
    this.#minEntries = maxEntries / 2;

    if (parent) {
      this.parent = parent;
    }
  }

  search(query: Interval) {
    const results: T[] = [];
    for (const [interval, childOrData] of this.entries) {
      if (this.#areIntersectingIntervals(interval, query)) {
        if (this.isLeaf) {
          results.push(childOrData as T);
        } else {
          results.push(...(childOrData as RTreeNode<T>).search(query));
        }
      }
    }
    return results;
  }

  insert(item: T) {
    const itemInterval = { start: item.start, end: item.end }
    if (this.isLeaf) {
      this.entries.push([ itemInterval, item ]);
      if (this.entries.length > this.#maxEntries) {
        return this.#split();
      }
    } else {
      const leafNode = this.chooseLeaf(itemInterval);
      const splitNode = leafNode.insert(item);

      if (splitNode) {
        this.entries = this.entries.filter(entry => entry[1] !== bestChild);
        const bbox = this.#computeBbox(bestChild);
        const splitNodebbox = this.#computeBbox(splitNode);
        this.entries.push([bbox, bestChild]);
        this.entries.push([splitNodebbox, splitNode]);
        if (this.entries.length > this.#maxEntries) {
          return this.#split();
        }
      }
    }

    return null;
  }

  // Choose a leaf for insertion
  protected chooseLeaf(interval: Interval) {
    if (this.isLeaf) {
      return this;
    } else {
      let node: RTreeNode<T> = this;
      while (!node.isLeaf) {
        node = node.chooseSubtree(interval);
      }
      return node;
    }
  }

  // Part of insertion algorithm (choosing a leaf node for insertion)
  protected chooseSubtree(interval: Interval) {
    // choose the entry whose bounding box needs least enlargement to include the new interval
    const [, subtree] = this.entries.reduce((best, current) => {
      const currentInterval = current[0];
      const bestInterval = best[0];

      const expandedCurrentInterval = this.#getExpandedInterval(currentInterval, interval);
      const expandedCurrentIntervalWidth = expandedCurrentInterval.end - expandedCurrentInterval.start;
      const currentIntervalWidth = currentInterval.end - currentInterval.start;
      const currentIntervalExpansionCost = expandedCurrentIntervalWidth - currentIntervalWidth;

      const expandedBestInterval = this.#getExpandedInterval(bestInterval, interval);
      const expandedBestIntervalWidth = expandedBestInterval.end - expandedBestInterval.start;
      const bestIntervalWidth = bestInterval.end - bestInterval.start;
      const bestIntervalExpansionCost = expandedBestIntervalWidth - bestIntervalWidth;

      return currentIntervalExpansionCost < bestIntervalExpansionCost
        ? current : best;
    });

    return subtree as RTreeNode<T>;
  }

  // Use quadratic-cost split algorithm
  #split() {
    const entries = [...this.entries];
    const [seedAIdx, seedBIdx] = this.#pickSeeds(entries as LeafNodeEntry<T>[]);
    
    const node1 = new RTreeNode({ parent: this.parent });
    const node2 = new RTreeNode({ parent: this.parent });

    const seedA = entries[seedAIdx];
    const seedB = entries[seedBIdx];

    node1.entries.push(seedA);
    node2.entries.push(seedB);

    // at this point, each of the new nodes contains only a single entry
    let node1Interval = seedA[0];
    let node2Interval = seedB[0];
    
    // fill the two split nodes with the remaining entries
    for (let i = 0; i < entries.length; i++) {
      if (i === seedAIdx || i === seedBIdx) {
        // seeds have already been planted
        continue;
      }
      // decide which of the two nodes to put the entry in,
      // based on which of the node intervals would have to be increased the least
      // to include the new entry
      const entry = entries[i];
      const entryInterval = entry[0];

      const enlargedNode1Interval = union(node1Interval, entryInterval);
      const enlargedNode2Interval = union(node2Interval, entryInterval);

      if (length(enlargedNode1Interval) < length(enlargedNode2Interval)) {
        node1.entries.push(entry);
        node1Interval = enlargedNode1Interval;
      } else if (length(enlargedNode2Interval) < length(enlargedNode1Interval)) {
        node2.entries.push(entry);
        node2Interval = enlargedNode2Interval;
      } else {
        if (node1.entries.length < node2.entries.length) {
          node1.entries.push(entry);
          node1Interval = enlargedNode1Interval;
        } else {
          node2.entries.push(entry);
          node2Interval = enlargedNode2Interval;
        }
      }
    }

    return [
      [node1Interval, node1],
      [node2Interval, node2]
    ];
  }

  #pickSeeds(entries: LeafNodeEntry<T>[]): [number, number] {
    let maxWaste = -Infinity;
    let seedA = 0, seedB = 1;
    for (let i = 0; i < entries.length - 1; i++) {
      for (let j = i + 1; j < entries.length; j++) {
        const ivlA = entries[i][0];
        const ivlB = entries[j][0];
        const waste = length(union(ivlA, ivlB)) - length(ivlA) - length(ivlB);

        if (waste > maxWaste) {
          maxWaste = waste;
          seedA = i;
          seedB = j;
        }
      }
    }
    return [seedA, seedB];
  }

  #pickNext() {

  }





  #computeBbox(node: RTreeNode<T>): Interval {
    let bbox: Interval | null = null;
    for (const [interval] of node.entries) {
      if (!bbox) {
        bbox = { ...interval };
      } else {
        bbox = this.#expandInterval(bbox, interval);
      }
    }
    return bbox!;
  }

  #areIntersectingIntervals(ivl1: Interval, ivl2: Interval) {
    return !(ivl1.end < ivl2.start || ivl1.start > ivl2.end);
  }

  #getExpandedInterval(ivl1: Interval, ivl2: Interval) {
    return {
      start: Math.min(ivl1.start, ivl2.start),
      end: Math.max(ivl1.start, ivl2.start)
    };
  }

}

const length = (interval: Interval) => {
  return Math.max(0, interval.end - interval.start);
}

// same as #getExpandedInterval method above; probably makes sense to move it into function
const union = (ivl1: Interval, ivl2: Interval): Interval => {
  return {
    start: Math.min(ivl1.start, ivl2.start),
    end: Math.max(ivl1.start, ivl2.start)
  };
}
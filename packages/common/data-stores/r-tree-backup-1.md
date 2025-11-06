// R-tree described in the following paper:
// http://www-db.deis.unibo.it/courses/SI-LS/papers/Gut84.pdf

// Other notable examples
// https://github.com/mourner/rbush/blob/main/index.js

type Interval = {
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



class RTreeNode<T extends Interval> {
  isLeaf: boolean = true;
  entries: Array<[ Interval, RTreeNode<T> | T ]> = [];
  maxEntries: number = 10;

  constructor(isLeaf: boolean = true, maxEntries: number = 10) {
    this.isLeaf = isLeaf;
    this.maxEntries = maxEntries;
  }

  insert(item: T) {
    const itemInterval = { start: item.start, end: item.end }
    if (this.isLeaf) {
      this.entries.push([ itemInterval, item ]);
      if (this.entries.length > this.maxEntries) {
        return this.#split();
      }
    } else {
      const bestChild = this.#chooseBestSubtree(itemInterval)[1] as RTreeNode<T>;
      const splitNode = bestChild.insert(item);
      if (splitNode) {
        this.entries = this.entries.filter(entry => entry[1] !== bestChild);
        const bbox = this.#computeBbox(bestChild);
        const splitNodebbox = this.#computeBbox(splitNode);
        this.entries.push([bbox, bestChild]);
        this.entries.push([splitNodebbox, splitNode]);
        if (this.entries.length > this.maxEntries) {
          return this.#split();
        }
      }
    }

    return null;
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

  #split() {
    const mid = Math.floor(this.entries.length / 2);
    const sibling = new RTreeNode<T>(this.isLeaf, this.maxEntries);
    sibling.entries = this.entries.splice(mid);
    return sibling;
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

  #chooseBestSubtree(interval: Interval) {
    return this.entries.reduce((best, current) => {
      const currentInterval = current[0];
      const bestInterval = best[0];
      const bbox = {...currentInterval};
      const expandedbbox = this.#expandInterval(bbox, interval);
      const cost = expandedbbox.end - expandedbbox.start - (currentInterval.end - currentInterval.start);
      const bestCost = best
        ? bestInterval.end - bestInterval.start - (bestInterval.end - bestInterval.start)
        : Infinity;
      return cost < bestCost ? current as [Interval, RTreeNode<T>] : best;
    });
  }

  #areIntersectingIntervals(ivl1: Interval, ivl2: Interval) {
    return !(ivl1.end < ivl2.start || ivl1.start > ivl2.end);
  }

  #expandInterval(ivl1: Interval, ivl2: Interval) {
    return {
      start: Math.min(ivl1.start, ivl2.start),
      end: Math.max(ivl1.start, ivl2.start)
    };
  }

}
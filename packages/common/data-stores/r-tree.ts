// The R-tree algorithm was first described in the following paper:
// http://www-db.deis.unibo.it/courses/SI-LS/papers/Gut84.pdf

// Other notable examples in javascript:
// https://github.com/mourner/rbush/blob/main/index.js

export type Interval = {
  start: number;
  end: number;
};

type StorableFeature = Interval & {
  id: string;
};




// class RTreeBasedStore<T extends StorableFeature> {
//   storedIds = new Set<string>();

//   tree: RTreeNode<T>

//   constructor() {
//     this.tree = new RTreeNode();
//   }

//   add() {

//   }

//   queryLocation(params: { start: number, end: number; }) {

//   }
// }



/**
 * Terminology:
 * - bbox: bounding box, or "minimum bounding rectangle"
 *   (in our case, the height of this rectangle is 0, because we are only interested in a single dimension)
 */




type LeafNodeEntry<T> = {
  interval: Interval;
  item: T;
};

type LeafNode<T> = {
  type: 'leaf';
  entries: LeafNodeEntry<T>[];
  interval: Interval;
  parent: NonLeafNode<T> | null;
}

type NonLeafNode<T> = {
  type: 'internal';
  children: Array<LeafNode<T> | NonLeafNode<T>>;
  interval: Interval;
  parent: NonLeafNode<T> | null;
}

type TreeNode<T> = LeafNode<T> | NonLeafNode<T>;

export class RTree<T extends StorableFeature> {
  #maxEntries: number;
  #minEntries: number;
  #root: LeafNode<T> | NonLeafNode<T>;

  constructor(options?: {
    maxEntries?: number;
    minEntries?: number;
  }) {
    const maxEntries = options?.maxEntries ?? 10;
    this.#maxEntries = maxEntries;
    this.#minEntries = options?.minEntries ?? maxEntries / 2;
    this.#root = this.#createLeafNode();
  }

  search(query: Interval): T[] {
    const results: T[] = [];
    this.#searchNode(this.#root, query, results);
    return results;
  }

  insert(item: T) {
    const itemInterval = { start: item.start, end: item.end };
    const leaf = this.chooseLeaf(this.#root, itemInterval);
    leaf.entries.push({ interval: itemInterval, item });
    this.tightenUpwards(leaf);

    if (leaf.entries.length > this.#maxEntries) {
      this.handleOverflow(leaf);
    }
  }

  #createLeafNode(parent: NonLeafNode<T> | null = null): LeafNode<T> {
    return {
      type: 'leaf',
      entries: [],
      interval: { start: Infinity, end: -Infinity },
      parent
    }
  }

  #createNonLeafNode(parent: NonLeafNode<T> | null = null): NonLeafNode<T> {
    return {
      type: 'internal',
      children: [],
      interval: { start: Infinity, end: -Infinity },
      parent
    };
  }

  // Choose a leaf for insertion
  protected chooseLeaf(node: TreeNode<T>, interval: Interval): LeafNode<T> {
    if (node.type === 'leaf') {
      return node;
    }

    let best: NonLeafNode<T> | null = null;
    let bestEnlargement = Infinity;
    let bestSpan = Infinity;

    for (let child of node.children) {
      const enlargement = calculateEnlargement(child.interval, interval);
      const span = length(child.interval);

      if (
        enlargement < bestEnlargement ||
        (enlargement === bestEnlargement && span < bestSpan) ||
        (enlargement === bestEnlargement && span === bestSpan &&
          this.childCount(child) < (best ? this.childCount(best) : Infinity)
        )
      ) {
        bestEnlargement = enlargement;
        bestSpan = span;
        best = child as NonLeafNode<T>;
      }
    }

    if (!best) {
      // Create a new leaf node for this internal node, and return it
      const newLeaf = this.#createLeafNode(node);
      node.children.push(newLeaf);
      this.tightenUpwards(node);
      return newLeaf;
    }

    return this.chooseLeaf(best, interval);
  }

  private childCount(node: TreeNode<T>): number {
    return node.type === 'leaf' ? node.entries.length : node.children.length;
  }

  private tighten(node: TreeNode<T>): void {
    node.interval = this.computeNodeInterval(node);
  }

  private tightenUpwards(node: TreeNode<T>): void {
    let n: TreeNode<T> | null = node;
    while (n) {
      this.tighten(n);
      n = n.parent;
    }
  }

  private computeNodeInterval(node: TreeNode<T>): Interval {
    if (node.type === 'leaf') {
      if (node.entries.length === 0) {
        return { start: Infinity, end: -Infinity };
      }
      const firstEntry = node.entries[0].interval;
      let result = { start: firstEntry.start, end: firstEntry.end };

      for (let i = 1; i < node.entries.length; i++) {
        result = union(result, node.entries[i].interval);
      }

      return result;
    } else {
      // non-leaf node
      if (node.children.length === 0) {
        return { start: Infinity, end: -Infinity };
      }
      const firstChild = node.children[0];
      let result = { start: firstChild.interval.start, end: firstChild.interval.end };
      
      for (let i = 1; i < node.children.length; i++) {
        result = union(result, node.children[i].interval);
      }

      return result;
    }
  }

  private handleOverflow(node: TreeNode<T>): void {
    const [splitNode1, splitNode2] = node.type === 'leaf'
      ? this.splitLeaf(node)
      : this.splitNonLeaf(node);

    if (!node.parent) {
      // Split the root: create a new root node with two children
      const newRoot = this.#createNonLeafNode(null);
      splitNode1.parent = newRoot;
      splitNode2.parent = newRoot;
      newRoot.children.push(splitNode1, splitNode2);
      this.tighten(newRoot);
      this.#root = newRoot;
    } else {
      // Non-root: replace node with the two split nodes in the parent
      const parent = node.parent;
      const idx = parent.children.indexOf(node);
      if (idx !== -1) parent.children.splice(idx, 1);
      splitNode1.parent = parent;
      splitNode2.parent = parent;
      parent.children.push(splitNode1, splitNode2);
      this.tightenUpwards(parent);

      if (parent.children.length > this.#maxEntries) {
        this.handleOverflow(parent);
      }
    }
  }

  // This method, as well as the splitNonLeaf method for non-leaf nodes
  // uses a quadratic-cost split algorithm
  private splitLeaf(node: LeafNode<T>): [LeafNode<T>, LeafNode<T>] {
    const entries = node.entries.slice();
    const [seedAIdx, seedBIdx] = this.#pickSeedsForLeafNodes(entries);
    const a = this.#createLeafNode(node.parent);
    const b = this.#createLeafNode(node.parent);

    const seedA = entries[seedAIdx];
    const seedB = entries[seedBIdx];

    a.entries.push(seedA);
    b.entries.push(seedB);

    const assigned = new Array(entries.length).fill(false);
    assigned[seedAIdx] = true;
    assigned[seedBIdx] = true;

    this.tighten(a);
    this.tighten(b);

    let remaining = entries.length - 2;

    for (let i = 0; i < entries.length; i++) {
      if (assigned[i]) continue;

      // Balance constraints: if filling the remainder would violate minEntries, force-assign.
      const remainingUnassigned = remaining;
      if (a.entries.length + remainingUnassigned === this.#minEntries) {
        // All must go to A
        for (let j = i; j < entries.length; j++) {
          if (!assigned[j]) {
            a.entries.push(entries[j]);
            assigned[j] = true;
          }
        }
        break;
      }
      if (b.entries.length + remainingUnassigned === this.#minEntries) {
        // All must go to B
        for (let j = i; j < entries.length; j++) {
          if (!assigned[j]) {
            b.entries.push(entries[j]);
            assigned[j] = true;
          }
        }
        break;
      }

      const entry = entries[i];
      const enlargedIntervalA = calculateEnlargement(a.interval, entry.interval);
      const enlargedIntervalB = calculateEnlargement(b.interval, entry.interval);
      if (enlargedIntervalA < enlargedIntervalB) {
        a.entries.push(entry);
      } else if (enlargedIntervalB < enlargedIntervalA) {
        b.entries.push(entry);
      } else {
        // Tie-breaker: smaller span, then fewer entries
        const spanA = length(a.interval);
        const spanB = length(b.interval);
        if (spanA < spanB) {
          a.entries.push(entry)
        } else if (spanB < spanA) {
          b.entries.push(entry)
        } else {
          const leaf = a.entries.length <= b.entries.length ? a : b;
          leaf.entries.push(entry);
        }
         
      }
      assigned[i] = true;
      remaining--;
      this.tighten(a);
      this.tighten(b);
    }

    this.tighten(a);
    this.tighten(b);
    return [a, b];
  }

  // Most of the code in this method repeats the code in splitLeaf;
  // yet there are sufficient differences that makes combining them into a single method cumbersome
  private splitNonLeaf(node: NonLeafNode<T>): [NonLeafNode<T>, NonLeafNode<T>] {
    const children = node.children.slice();
    const [seedAIdx, seedBIdx] = this.#pickSeedsForNonLeafNodes(children);
    const a = this.#createNonLeafNode(node.parent);
    const b = this.#createNonLeafNode(node.parent);

    const seedA = children[seedAIdx];
    const seedB = children[seedBIdx];

    a.children.push(seedA);
    b.children.push(seedB);
    seedA.parent = a;
    seedB.parent = b;

    const assigned = new Array(children.length).fill(false);
    assigned[seedAIdx] = true;
    assigned[seedBIdx] = true;

    this.tighten(a);
    this.tighten(b);

    let remaining = children.length - 2;

    for (let i = 0; i < children.length; i++) {
      if (assigned[i]) continue;

      const remainingUnassigned = remaining;
      if (a.children.length + remainingUnassigned === this.#minEntries) {
        for (let j = i; j < children.length; j++) {
          if (!assigned[j]) {
            const child = children[j];
            child.parent = a;
            a.children.push(child);
            assigned[j] = true;
          }
        }
        break;
      }
      if (b.children.length + remainingUnassigned === this.#minEntries) {
        for (let j = i; j < children.length; j++) {
          if (!assigned[j]) {
            const child = children[j];
            child.parent = b;
            b.children.push(child);
            assigned[j] = true;
          }
        }
        break;
      }

      const child = children[i];
      const enlargedIntervalA = calculateEnlargement(a.interval, child.interval);
      const enlargedIntervalB = calculateEnlargement(b.interval, child.interval);
      if (enlargedIntervalA < enlargedIntervalB) {
        child.parent = a;
        a.children.push(child);
      } else if (enlargedIntervalB < enlargedIntervalA) {
        child.parent = b;
        b.children.push(child);
      } else {
        const spanA = length(a.interval);
        const spanB = length(b.interval);
        if (spanA < spanB) {
          child.parent = a;
          a.children.push(child);
        } else if (spanB < spanA) {
          child.parent = b;
          b.children.push(child);
        } else {
          const node = a.children.length <= b.children.length ? a : b;
          child.parent = node;
          node.children.push(child);
        }
      }
      assigned[i] = true;
      remaining--;
      this.tighten(a);
      this.tighten(b);
    }

    this.tighten(a);
    this.tighten(b);
    return [a, b];
  }


  #searchNode(node: TreeNode<T>, query: Interval, results: T[]) {
    if (!areIntersecting(node.interval, query)) {
      return;
    }
    
    if (node.type === 'leaf') {
      for (const entry of node.entries) {
        if (areIntersecting(entry.interval, query)) {
          results.push(entry.item);
        }
      }
    } else {
      for (const child of node.children) {
        this.#searchNode(child, query, results);
      }
    }
  }

  #pickSeedsForLeafNodes(entries: LeafNodeEntry<T>[]): [number, number] {
    let maxWaste = -Infinity;
    let seedA = 0, seedB = 1;
    for (let i = 0; i < entries.length - 1; i++) {
      for (let j = i + 1; j < entries.length; j++) {
        const ivlA = entries[i].interval;
        const ivlB = entries[j].interval;
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

  #pickSeedsForNonLeafNodes(children: TreeNode<T>[]): [number, number] {
    let maxWaste = -Infinity;
    let seedA = 0, seedB = 1;
    for (let i = 0; i < children.length - 1; i++) {
      for (let j = i + 1; j < children.length; j++) {
        const a = children[i].interval;
        const b = children[j].interval;
        const w = length(union(a, b)) - length(a) - length(b);
        if (w > maxWaste) {
          maxWaste = w;
          seedA = i;
          seedB = j;
        }
      }
    }
    return [seedA, seedB];
  }

  // #pickNext() {

  // }





  // #computeBbox(node: RTreeNode<T>): Interval {
  //   let bbox: Interval | null = null;
  //   for (const [interval] of node.entries) {
  //     if (!bbox) {
  //       bbox = { ...interval };
  //     } else {
  //       bbox = this.#expandInterval(bbox, interval);
  //     }
  //   }
  //   return bbox!;
  // }

  // #areIntersectingIntervals(ivl1: Interval, ivl2: Interval) {
  //   return !(ivl1.end < ivl2.start || ivl1.start > ivl2.end);
  // }

  // #getExpandedInterval(ivl1: Interval, ivl2: Interval) {
  //   return {
  //     start: Math.min(ivl1.start, ivl2.start),
  //     end: Math.max(ivl1.start, ivl2.start)
  //   };
  // }

}

const length = (interval: Interval) => {
  return Math.max(0, interval.end - interval.start);
}

// same as #getExpandedInterval method above; probably makes sense to move it into function
const union = (ivl1: Interval, ivl2: Interval): Interval => {
  return {
    start: Math.min(ivl1.start, ivl2.start),
    end: Math.max(ivl1.end, ivl2.end)
  };
}

const calculateEnlargement = (ivl1: Interval, ivl2: Interval): number => {
  const u = union(ivl1, ivl2);
  return length(u) - length(ivl1);
}

const areIntersecting = (ivl1: Interval, ivl2: Interval) => {
  return !(ivl1.end < ivl2.start || ivl1.start > ivl2.end);
}



const jsonReplacer = (key: string, value: any) => {
  // Filtering out properties
  if (key === "parent") {
    return undefined;
  }
  return value;
}

const debug = (obj: any) => JSON.stringify(obj, jsonReplacer, 2);
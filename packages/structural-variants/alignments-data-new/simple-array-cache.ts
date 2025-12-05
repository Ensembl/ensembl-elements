type Interval = {
  start: number;
  end: number;
};

type DefaultFeatureWithId = {
  id: string | number;
  start: number;
  end: number;
};

export type FeatureCache<Feature> = {
  add: (params: { interval: Interval; features: Feature[]; }) => void;
  get: (params: { start: number; end: number; }) => Feature[];
  getCachedIntervals: () => Interval[];
};

// FIXME: think about how better to type cache
// export type FeatureCache = typeof SimpleArrayCache;

const defaultFeatureIdGetter = <Feature extends object>(feature: Feature) => {
  return (feature as DefaultFeatureWithId).id;
};

const defaultFeatureStartGetter = <Feature extends object>(feature: Feature) => {
  return (feature as DefaultFeatureWithId).start;
};

const defaultFeatureEndGetter = <Feature extends object>(feature: Feature) => {
  return (feature as DefaultFeatureWithId).end;
};


/**
 * This is an extremely naive caching implementation,
 * in which all features are stored in a single array.
 * 
 * Features are sorted by their start coordinate.
 */


export class SimpleArrayCache<Feature extends object> implements FeatureCache<Feature> {

  #cachedIntervals: { start: number; end: number; }[] = [];
  #cachedFeatureIds = new Set<string | number>();
  #getFeatureId: (feature: Feature) => string | number;
  #getFeatureStart: (feature: Feature) => number;
  #getFeatureEnd: (feature: Feature) => number;

  #featuresCache: Feature[] = []; // just put features in an array

  constructor(params: {
    getFeatureId?: (feature: Feature) => string | number;
    getFeatureStart?: (feature: Feature) => number;
    getFeatureEnd?: (feature: Feature) => number;
  } = {}) {
    this.#getFeatureId = params.getFeatureId ?? defaultFeatureIdGetter;
    this.#getFeatureStart = params.getFeatureStart ?? defaultFeatureStartGetter;
    this.#getFeatureEnd = params.getFeatureEnd ?? defaultFeatureEndGetter;
  }

  /**
   * Part of the public api; serves to add features to the cache.
   * The cache receives an array of features, and an interval that these features were requested from.
   * Q: Why is the interval necessary? Why can't it be inferred from start and end coordinates of features?
   * A: Because a feature can be only partly included in the requested interval
   *    (e.g. feature's start is outside) the interval. Thus, if you infer the interval
   *    from the smallest start and the largest end coordinates of all features,
   *    you may wrongly extend the interval beyond the one that was requested,
   *    and may miss small features that are just outside the requested interval.
   * Because a feature may be only partially included in an interval,
   * it is possible to receive the same feature in two (or more) requested intervals.
   * Therefore, storing features in the cache should be accompanied by checking
   * whether a feature with the same id has already been stored.
   */
  add({
    interval,
    features
  }: {
    interval: Interval,
    features: Feature[];
  }) {
    // Just a convinience to keep track of insertion index
    // (so that each feature does not have to look for its insertion position
    // from the start of the cached features array)
    const insertionState = { index: 0 };

    for (const feature of features) {
      this.#insertFeature({ feature, state: insertionState });
    }

    // Extend cached intervals to include the current one 
    this.#cachedIntervals.push(interval);
    // Recalculate cached intervals to merge overlapping / adjacent ones 
    this.#mergeCachedIntervals();
  }

  /**
   * Part of the public api; serves to retrieve features from the cache
   */
  get({
    start,
    end
  }: {
    start: number;
    end: number;
  }) {
    const retrieved = [];
    for (const feature of this.#featuresCache) {
      const featureStart = this.#getFeatureStart(feature);
      const featureEnd = this.#getFeatureEnd(feature);

      // if feature overlaps the interval
      if (
        featureStart >= start && featureStart <= end ||
        featureEnd >= start && featureEnd <= end ||
        featureStart <= start && featureEnd >= end
      ) {
        retrieved.push(feature);
      }
    }

    return retrieved;
  }

  getCachedIntervals() {
    return this.#cachedIntervals;
  }

  #insertFeature({
    feature,
    state
  }: {
    feature: Feature;
    state: { index: number; }
  }) {
    // Check if the feature is already registered in the cache.
    const featureId = this.#getFeatureId(feature);

    if (this.#cachedFeatureIds.has(featureId)) {
      // If feature has already been cached, no further action is necessary
      return;
    }

    const featureStart = this.#getFeatureStart(feature);
    let hasInserted = false;

    for (let i = state.index; i < this.#featuresCache.length; i++) {
      state.index = i;
      const cachedFeature = this.#featuresCache[i];
      const cachedFeatureStart = this.#getFeatureStart(cachedFeature);
      if (featureStart <= cachedFeatureStart) {
        if (!hasInserted) {
          this.#featuresCache.splice(i, 0, feature);
          hasInserted = true;
          break;
        }
      } else {
        continue;
      }
    }

    if (!hasInserted) {
      this.#featuresCache.push(feature);
    }

    // remember the id of the feature that was added to the cache
    this.#cachedFeatureIds.add(featureId);
  }

  /**
   * The purpose of this function is to merge overlapping cached intervals,
   * as well as adjacent cached intervals (e.g. an interval that starts right after previous interval ends)
   */
  #mergeCachedIntervals() {
    this.#cachedIntervals.sort((int1, int2) => int1.start - int2.start);
    const newIntervals = [this.#cachedIntervals[0]];

    for (let i = 1; i < this.#cachedIntervals.length; i++) {
      const currentInterval = this.#cachedIntervals[i];

      const lastProcessedInterval = newIntervals.at(-1) as Interval;

      if (currentInterval.start <= lastProcessedInterval.end + 1) {
        newIntervals[newIntervals.length - 1] = {
          start: Math.min(currentInterval.start, lastProcessedInterval.start),
          end: Math.max(currentInterval.end, lastProcessedInterval.end)
        }
      } else {
        newIntervals.push(currentInterval);
      }
    }

    this.#cachedIntervals = newIntervals;
  }

}
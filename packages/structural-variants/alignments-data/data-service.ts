import { SimpleArrayCache, type FeatureCache } from './simple-array-cache';
import { checkIntervalOverlap, compareIntervals } from './interval-helpers';

type MinimalLoaderParams = {
  start: number;
  end: number;
};

type Interval = {
  start: number;
  end: number;
};

type OngoingRequest = {
  interval: Interval;
  promise: Promise<void>;
};

export class DataService<
  Feature extends object,
  LoaderParams extends MinimalLoaderParams = MinimalLoaderParams
>{
  #featuresCache: FeatureCache<Feature>;
  #loader: (params: LoaderParams) => Promise<Feature[]>;
  #ongoingRequests = new Map<string, OngoingRequest>;

  constructor({
    loader,
    getFeatureId,
    getFeatureStart,
    getFeatureEnd,
    cache
  }: {
    loader: (params: LoaderParams) => Promise<Feature[]>;
    getFeatureId?: (feature: Feature) => string | number;
    getFeatureStart?: (feature: Feature) => number;
    getFeatureEnd?: (feature: Feature) => number;
    cache?: FeatureCache<Feature>; // TODO: think if cache should be passed as a class or as an instance
  }) {
    this.#featuresCache = cache ?? new SimpleArrayCache<Feature>({
      getFeatureId,
      getFeatureStart,
      getFeatureEnd,
    });
    this.#loader = loader;
  }

  async get(params: LoaderParams) {
    const { start, end } = params;
    const requestedInterval = { start, end };

    // exclude from the requested interval the part that is already cached
    const allCachedIntervals = this.#featuresCache.getCachedIntervals();
    const {
      nonOverlappingIntervals: uncachedIntervals,
      overlappingIntervals
    } = checkIntervalOverlap({
      intervals: allCachedIntervals,
      queryInterval: requestedInterval
    });

    // exclude from the requested interval the parts the requests for which
    // are already in flight
    let intervalsToCompare = [...uncachedIntervals];
    let intervalsToRequest: Interval[] = [];
    const ongoingRequests: Set<Promise<void>> = new Set();

    if (!this.#ongoingRequests.size) {
      intervalsToRequest = intervalsToCompare;
    }

    // TODO: don't know what to name this; names are hard
    const ongoingReqs = [...this.#ongoingRequests.values()];

    for (let i = 0; i < ongoingReqs.length; i++) {
      const req = ongoingReqs[i];
      const intervalInRequest = req.interval;

      for (const testInterval of intervalsToCompare) {
        const {
          intersecting: intersectingInterval,
          nonIntersecting: nonIntersectingIntervals
        } = compareIntervals({
          referenceInterval: intervalInRequest,
          queryInterval: testInterval
        });

        if (intersectingInterval === null) {
          intervalsToRequest.push(testInterval);
        } else {
          ongoingRequests.add(req.promise);
          intervalsToRequest.push(...nonIntersectingIntervals);
        }
      }

      intervalsToCompare = [...intervalsToRequest];
      if (i < ongoingReqs.length - 1) {
        intervalsToRequest = [];
      }
    }

    const newRequests: Promise<void>[] = [];

    for (const interval of intervalsToRequest) {
      const key = this.#createOngoingRequestKey(interval);
      const promise = this.#loader({
        ...params,
        start: interval.start,
        end: interval.end
      }).then((features) => {
          this.#featuresCache.add({
            interval,
            features
          });
        })
        .finally(() => {
          this.#ongoingRequests.delete(key); // clean up after itself
        });
      this.#ongoingRequests.set(key, {
        interval,
        promise
      });

      newRequests.push(promise);
    }

    // TODO: think about what to do if some of the requests fail
    await Promise.all([...ongoingRequests, ...newRequests]);

    // By the time the above promise resolves, the features should have been added to the cache
    return this.#featuresCache.get(params);
  }

  #createOngoingRequestKey({ start, end }: { start: number, end: number }) {
    return `${start}-${end}`;
  }

}
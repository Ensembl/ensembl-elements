import { DEFAULT_BIN_SIZE } from './constants';

import { createBins, createBinKey, combineLoadingLocations } from './dataBinHelpers';


/**
 * Design ideas for data service
 * 
 * - Can fetch data for multiple genomes / multiple regions
 * - Should not fetch data that is already available
 * - Maybe createDataService to 
 * 
 * 
 * .get() 
 * - Returns a promise?
 * - Loading state?
 * - Error state?
 * 
 * 
 */


/**
 * Problems to solve:
 * - Avoid unnecessary requests
 * - Reasonable time to access features (do not iterate over the whole array)
 */


type DataState<Feature> = {
  [binKey: string]: Feature[];
};

type MinimalLoaderParams = {
  start: number;
  end: number;
}

export class DataService<
  Feature extends object,
  LoaderParams extends MinimalLoaderParams = MinimalLoaderParams
> {
  #state: DataState<Feature> = {};
  #loader: (params: LoaderParams) => Promise<Feature[]>;

  binSize: number;
  featureStartFieldPath: string;
  featureEndFieldPath: string;

  #loadedLocations = new Set<string>();
  #ongoingRequests = new Map<string, Promise<Feature[]>>;

  constructor({
    loader,
    binSize = DEFAULT_BIN_SIZE,
    featureStartFieldPath = 'start',
    featureEndFieldPath = 'end',
    getFeatureId,
    getFeatureEnd
  }: {
    loader: (params: LoaderParams) => Promise<Feature[]>;
    featureStartFieldPath?: string;
    featureEndFieldPath?: string;
    binSize?: number;
    getFeatureEnd?: (feature: Feature) => number;
    getFeatureId?: (feature: Feature) => string | number;
  }) {
    this.binSize = binSize;
    this.featureStartFieldPath = featureStartFieldPath;
    this.featureEndFieldPath = featureEndFieldPath;
    this.#loader = loader;

    if (getFeatureEnd) {
      this.#getFeatureEnd = getFeatureEnd;
    }
    if (getFeatureId) {
      this.#getFeatureId = getFeatureId;
    }
  }

  async get(params: LoaderParams) {
    const { start, end } = params;
    const locationsToLoad = this.#getLocationsToLoad({ start, end });
    const updatedLoaderParams = locationsToLoad.map(location => ({
      ...params,
      start: location.start,
      end: location.end
    }));

    const ongoingRequests = this.#getOngoingRequestsForLocation(params);

    if (!updatedLoaderParams.length && !ongoingRequests.length) {
      // all data must have already been loaded
      return this.#getDataFromState(params);
    } else if (!updatedLoaderParams.length && ongoingRequests.length) {
      // nothing to do except wait until the data is loaded
      await Promise.all(ongoingRequests);
      return this.#getDataFromState(params);
    } else {
      // send requests; wait for them to resolve; and then read the data
      const newRequests = updatedLoaderParams.map(params => {
        const request = this.#loader(params);
        const bins = createBins({ start, end, binSize: this.binSize });
        const binKeys = bins.map(createBinKey);

        // mark that request is in process
        for (const key of binKeys) {
          this.#ongoingRequests.set(key, request);
        }
        
        return request.then(data => {
          this.#saveData({
            start: params.start,
            end: params.end,
            data
          });

          for (const key of binKeys) {
            this.#loadedLocations.add(key);
          }
        }).finally(() => {
          // remove from the stored list of ongoing requests
          for (const key of binKeys) {
            this.#ongoingRequests.delete(key);
          }
        });
      });
      await Promise.all([...ongoingRequests, ...newRequests]);

      return this.#getDataFromState(params);
    }
  }

  #getLocationsToLoad = ({ start, end }: { start: number, end: number }) => {
    const locations = createBins({ start, end, binSize: this.binSize });

    // from the list of generated locations, only select for loading
    // ones that have not already been loaded, and that are not currently being loaded
    const filteredLocations = locations.filter(bin => {
      const binKey = createBinKey(bin);
      return !this.#loadedLocations.has(binKey) && !this.#ongoingRequests.has(binKey);
    });

    const consolidatedLocations = combineLoadingLocations(filteredLocations);

    return consolidatedLocations;
  }

  #getOngoingRequestsForLocation = ({ start, end }: { start: number; end: number }) => {
    const locations = createBins({ start, end, binSize: this.binSize });

    return locations.map(location => {
      const mapKey = createBinKey(location);
      return this.#ongoingRequests.get(mapKey);
    }).filter(item => Boolean(item));
  }

  #getDataFromState = ({ start, end }: { start: number; end: number }) => {
    const bins = createBins({ start, end, binSize: this.binSize });
    let features: Feature[] = [];

    for (let i = 0; i < bins.length; i++) {
      const bin = bins[i];
      const isFirstBin = i === 0;
      
      const binKey = createBinKey(bin);
      const binFeatures = this.#state[binKey];

      if (!binFeatures) {
        continue;
      }

      for (const feature of binFeatures) {
        const featureStart = this.#getFeatureStart(feature);
        const featureEnd = this.#getFeatureEnd(feature);

        const isFeatureWithinRequestedSlice =
          // feature starts within the slice, or
          (featureStart >= start && featureStart <= end) ||
          // feature ends within the slice, or
          (featureEnd >= start && featureEnd <= end) ||
          // feature is longer than the slice and overlaps it completely
          (featureStart < start && featureEnd > end);

        if (!isFeatureWithinRequestedSlice) {
          continue;
        } else if (isFirstBin) {
          features.push(feature);
        } else {
          const shouldSkipFeature = featureStart < bin.start; // feature must have been present in a previous bin

          if (!shouldSkipFeature) {
            features.push(feature);
          }
        }
      }
    }

    return features;
  }

  #saveData = ({
    start,
    end,
    data
  }: {
    start: number;
    end: number;
    data: Feature[];
  }) => {
    const bins = createBins({ start, end, binSize: this.binSize });

    const binsMap = bins.reduce(
      (obj, { start, end }) => {
        const key = createBinKey({ start, end });
        obj[key] = [];
        return obj;
      },
      {} as DataState<Feature>
    );

    const addBin = (key: string) => {
      binsMap[key] = [];
    };

    for (const item of data) {
      const storageBins = createBins({
        start: this.#getFeatureStart(item), // FIXME, path
        end: this.#getFeatureEnd(item),
        binSize: this.binSize
      });

      const binKeys = storageBins.map((bin) =>
        createBinKey({ start: bin.start, end: bin.end })
      );
      for (const key of binKeys) {
        if (!binsMap[key]) {
          addBin(key);
        }
        binsMap[key].push(item);
      }
    }

    // Now add the new feature to the state; but be careful not to duplicate the features within a single bin
    [...Object.keys(binsMap)].forEach(key => {
      const savedFeatures = this.#state[key];

      if (!savedFeatures) {
        this.#state[key] = binsMap[key];
        return;
      }

      const savedFeatureIds = new Set<string | number>();
      savedFeatures.forEach(feature => savedFeatureIds.add(this.#getFeatureId(feature)));

      const newFeatures = binsMap[key];

      for (const feature of newFeatures) {
        const featureId = this.#getFeatureId(feature);
        if (!savedFeatureIds.has(featureId)) {
          savedFeatures.push(feature);
        }
      }
    });
  }

  #getFeatureId = (feature: Feature) => {
    if ('id' in feature) {
      return feature.id as string | number;
    } else {
      throw new Error('Feature does not have an id field');
    }
  }

  #getFeatureStart = (feature: Feature) => {
    const pathToStart = this.featureStartFieldPath.split('.');

    const featureStart: unknown = pathToStart.reduce((acc: any, key) => acc?.[key] ?? null, feature);

    if (typeof featureStart !== 'number') {
      throw new Error('Incorrect path to feature start');
    }
    
    return featureStart;
  }

  #getFeatureEnd = (feature: Feature) => {
    const pathToEnd = this.featureEndFieldPath.split('.');

    const featureEnd: unknown = pathToEnd.reduce((acc: any, key) => acc?.[key] ?? null, feature);

    if (typeof featureEnd !== 'number') {
      throw new Error('Incorrect path to feature end');
    }
    
    return featureEnd;
  }


}

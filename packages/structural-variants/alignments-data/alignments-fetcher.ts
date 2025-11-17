import { DEFAULT_BIN_SIZE } from './constants';

import type { Alignment } from '../alignments';

import { createBins, createBinKey, combineLoadingLocations } from './data-bin-helpers';

type LoaderParams = {
  referenceGenomeId: string;
  queryGenomeId: string;
  regionName: string;
  start: number;
  end: number;
  targetStart?: number;
  targetEnd?: number;
};

export class AlignmentsLoader {
  binSize: number;
  endpoint: string;

  #loadedLocations = new Set<string>();
  #ongoingRequests = new Map<string, Promise<Alignment[]>>;

  #state: Alignment[] = [];

  constructor(params: {
    endpoint?: string;
  }) {
    this.binSize = DEFAULT_BIN_SIZE;
    this.endpoint = params.endpoint ?? '/api/alignments';
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
        const request = this.#loadData(params);
        const bins = createBins({ start, end, binSize: this.binSize });
        const binKeys = bins.map(createBinKey);

        // mark that request is in process
        for (const key of binKeys) {
          this.#ongoingRequests.set(key, request);
        }
        
        return request.then(data => {
          this.#saveData({
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

  #loadData = async (params: LoaderParams) => {
    const paramsWithEndpoint = { ...params, endpoint: this.endpoint };
    const requestPromises = Promise.all([
      fetchAlignments(paramsWithEndpoint),
      fetchAlignmentsFromAltSequence(paramsWithEndpoint)
    ]);
    const [alignments1, alignments2] = await requestPromises;

    return combineAlignments(alignments1, alignments2);
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

  #getDataFromState = async ({
    start,
    end,
    targetStart,
    targetEnd
  }: LoaderParams) => {
    const storedAlignments = this.#state;

    const alignments: Alignment[] = [];

    for (let i = 0; i < storedAlignments.length; i++) {
      const alignment = storedAlignments[i];
      const alignmentReferenceEnd = alignment.reference.start + alignment.reference.length;
      const alignmentTargetEnd = alignment.target.start + alignment.target.length;

      const isMatch = (alignment.reference.start <= end && alignmentReferenceEnd >= start) ||
        (targetStart && targetEnd && alignment.target.start <= targetEnd && alignmentTargetEnd >= targetStart) ||
        (alignment.reference.start < start && targetEnd && alignment.target.start > targetEnd) ||
        (alignmentReferenceEnd > end && targetStart && alignmentTargetEnd < targetStart);

      if (isMatch) {
        alignments.push(alignment);
      }
    }

    return alignments;
  }

  #saveData = async ({
    data
  }: {
    data: Alignment[];
  }) => {
    const newState: Alignment[] = [];

    let oldStateIndex = 0;
    let newDataIndex = 0;

    while (oldStateIndex < this.#state.length || newDataIndex < data.length) {
      const alignmentFromState = this.#state[oldStateIndex];
      const alignmentFromData = data[newDataIndex];

      if (oldStateIndex >= this.#state.length) {
        newState.push(...data.slice(newDataIndex));
        break;
      } else if (newDataIndex >= data.length) {
        newState.push(...this.#state.slice(oldStateIndex));
        break;
      } else if (alignmentFromState.id === alignmentFromData.id) {
        newState.push(alignmentFromState);
        oldStateIndex++;
      } else if (alignmentFromState.reference.start <= alignmentFromData.reference.start) {
        newState.push(alignmentFromState);
        oldStateIndex++;
      } else {
        newState.push(alignmentFromData);
        newDataIndex++;
      }
    }

    this.#state = newState;
  }

}


const fetchAlignments = async (params: LoaderParams & { endpoint: string }) => {
  const { endpoint, referenceGenomeId, queryGenomeId, regionName, start, end } = params;
  const searchParams = new URLSearchParams();
  searchParams.append('reference_genome_id', referenceGenomeId);
  searchParams.append('query_genome_id', queryGenomeId);
  searchParams.append('viewport', `${regionName}:${start}-${end}`);
  const queryString = decodeURIComponent(searchParams.toString());
  const url = `${endpoint}?${queryString}`;
  const data: Alignment[] = await fetch(url).then(response => response.json());
  return data;
};

const fetchAlignmentsFromAltSequence = async (params: LoaderParams & { endpoint: string }) => {
  const { endpoint, referenceGenomeId, queryGenomeId, regionName, start, end } = params;
  const searchParams = new URLSearchParams();
  searchParams.append('reference_genome_id', queryGenomeId); // <-- difference from fetchAlignments
  searchParams.append('query_genome_id', referenceGenomeId); // <-- another difference from fetchAlignments
  searchParams.append('viewport', `${regionName}:${start}-${end}`);
  const queryString = decodeURIComponent(searchParams.toString());
  const url = `${endpoint}?${queryString}`;
  const data: Alignment[] = await fetch(url).then(response => response.json());
  return data;
};

const combineAlignments = (arr1: Alignment[], arr2: Alignment[]) => {
  const arr1Ids = new Set(arr1.map(({id}) => id));

  for (const item of arr2) {
    if (!arr1Ids.has(item.id)) {
      arr1.push(item);
    }
  }

  arr1.sort((a1, a2) => a1.reference.start - a2.reference.start);
  return arr1;
};


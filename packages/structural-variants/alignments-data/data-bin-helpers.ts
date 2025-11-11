import { DEFAULT_BIN_SIZE } from './constants';


export const createBins = ({
  start,
  end,
  binSize = DEFAULT_BIN_SIZE
}: {
  start: number;
  end: number;
  binSize?: number;
}) => {
  const binsStart = getBinStartForPosition(start, binSize);
  const binsEnd = getBinEndForPosition(end, binSize);

  const binBoundaries: { start: number; end: number }[] = [];

  for (let i = binsStart; i < binsEnd; i += binSize) {
    binBoundaries.push({
      start: i,
      end: i + binSize - 1
    });
  }

  return binBoundaries;
};


export const getBinStartForPosition = (position: number, binSize: number) => {
  if (position < 1) {
    // this should never happen
    throw new Error(
      'Feature coordinates can only be represented with positive integers'
    );
  }

  if (position % binSize === 0) {
    // A bin starts at (k * binSize + 1) and ends at (k+1) * binSize;
    // for example, for default bin size, first bin is 1 to 1_000_000
    // Therefore, if the passed position happens to be an exact multiple of binSize,
    // it belongs in the bin immediately preceding binSize.
    position -= 1;
  }

  return Math.floor(position / binSize) * binSize + 1;
};

export const getBinEndForPosition = (position: number, binSize: number) => {
  return Math.ceil(position / binSize) * binSize;
};

export const createBinKey = ({
  start,
  end
}: {
  start: number;
  end: number;
}) => {
  return `${start}-${end}`;
};

export const combineLoadingLocations = (locations: Array<{ start: number; end: number; }>) => {
  const sortedLocations = locations.toSorted((loc1, loc2) => loc1.start - loc2.start);

  const combinedLocations: typeof locations = [];

  for (const location of sortedLocations) {
    const lastCombinedLocation = combinedLocations.at(-1);
    if (!lastCombinedLocation) {
      combinedLocations.push(location);
    } else if (lastCombinedLocation.end === location.start - 1) {
      // grow the size of the last location
      lastCombinedLocation.end = location.end;
    } else {
      // add a new location
      combinedLocations.push(location);
    }
  }

  return combinedLocations;
};
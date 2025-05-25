import type {
  GeneInRegionOverview,
  RegulatoryFeature
} from '../types/regionOverview';
import type {
  InputData
} from '../types/inputData';

/**
 * The purpose of this helper is to accept data returned
 * by the Regulation team's region-of-interest api,
 * and to calculate from it the tracks to be displayed in the visualisation.
 *
 * For some features (e.g. regulatory features), the api has an opinion
 * about which track to place them in. For others (e.g. genes), the decision
 * is entirely up to the client.
 *
 * When distributing features, such as genes, across tracks,
 * the helper needs to make sure that features, or their labels,
 * do not overlap with each other.
 */

type Params = {
  data: InputData;
  start: number;
  end: number;
};

export type GeneInTrack = {
  data: GeneInRegionOverview;
};

export type GeneTrack = GeneInTrack[];

export type FeatureTracks = ReturnType<typeof prepareFeatureTracks>;

export const prepareFeatureTracks = (params: Params) => {
  const filteredDataBins = pickBins(params);
  const data: InputData = {
    ...params.data,
    bins: filteredDataBins
  };

  const geneTracks = prepareGeneTracks({
    data,
    start: params.start,
    end: params.end
  });
  const regulatoryFeatureTracks = prepareRegulatoryFeatureTracks({
    data,
    start: params.start,
    end: params.end
  });

  return {
    geneTracks,
    regulatoryFeatureTracks
  };
};

const pickBins = (params: Params) => {
  const { start, end } = params;
  const filteredBins: Params['data']['bins'] = {};

  for (const [binKey, binValue] of Object.entries(params.data.bins)) {
    const { binStart, binEnd } = parseBinKey(binKey);

    if (start > binStart && start < binEnd || end > binStart && end < binEnd) {
      filteredBins[binKey] = binValue;
    }
  }

  return filteredBins;
};

const parseBinKey = (key: string) => {
  const regex = /(?<start>\d+)-(?<end>\d+)/;
  const { start: binStartStr, end: binEndStr } = regex.exec(key).groups;
  const binStart = parseInt(binStartStr);
  const binEnd = parseInt(binEndStr);
  return { binStart, binEnd };
};

const prepareGeneTracks = (params: {
  data: InputData;
  start: number;
  end: number;
}) => {
  const { data, start, end } = params;
  let filteredGenes: GeneInRegionOverview[] = [];

  const binEntries = [...Object.entries(data.bins)];

  for (let i = 0; i < binEntries.length; i++) {
    const [, binValue] = binEntries[i];
    const prevBinKey = i > 0 ? binEntries[i - 1][0] : null;

    for (const gene of binValue.genes) {
      if (isFeatureInsideSelection({
        feature: gene,
        start,
        end
      })) {
        if (!prevBinKey) {
          filteredGenes.push(gene);
        } else {
          // remember that a gene that spans a bin border is saved into both bins;
          // so make sure to avoid duplication of genes when selecting them from the bins
          const { binEnd: prevBinEnd } = parseBinKey(prevBinKey);
          if (gene.start < prevBinEnd) {
            // gene has already been selected
            continue;
          } else {
            filteredGenes.push(gene);
          }
        }
      }
    }
  }

  const forwardStrandTracks: GeneTrack[] = [];
  const reverseStrandTracks: GeneTrack[] = [];

  for (const gene of filteredGenes) {
    const geneTracks =
      gene.strand === 'forward' ? forwardStrandTracks : reverseStrandTracks;

    const geneForTrack = prepareGeneForTrack(gene);
    let shouldAddNewTrack = true;

    for (const track of geneTracks) {
      if (canAddGeneToTrack(track, gene)) {
        track.push(geneForTrack);
        shouldAddNewTrack = false;
        break;
      }
    }

    if (shouldAddNewTrack) {
      geneTracks.push([geneForTrack]);
    }
  }

  return {
    forwardStrandTracks,
    reverseStrandTracks
  };
};

const canAddGeneToTrack = (track: GeneTrack, gene: GeneInRegionOverview) => {
  for (const geneInTrack of track) {
    if (areOverlappingGenes(gene, geneInTrack.data)) {
      return false;
    }
  }

  return true;
};

const areOverlappingGenes = (
  gene1: GeneInRegionOverview,
  gene2: GeneInRegionOverview
) => {
  return (
    (gene1.start >= gene2.start && gene1.start <= gene2.end) ||
    (gene2.start >= gene1.start && gene2.start <= gene1.end)
  );
};

const prepareGeneForTrack = (gene: GeneInRegionOverview): GeneInTrack => {
  return {
    data: gene
  };
};

const prepareRegulatoryFeatureTracks = (params: {
  data: InputData;
  start: number;
  end: number;
}) => {
  const { data, start, end } = params;
  const { regulatory_feature_types: featureTypesMap } = data;
  let filteredFeatures: RegulatoryFeature[] = [];

  for (const dataBin of Object.values(data.bins)) {
    for (const feature of dataBin.regulatory_features) {
      if (isFeatureInsideSelection({
        feature,
        start,
        end
      })) {
        filteredFeatures.push(feature);
      }
    }
  }

  let featureTracks: RegulatoryFeature[][] = [];

  for (const feature of filteredFeatures) {
    const trackIndex = featureTypesMap[feature.feature_type]?.track_index;

    if (typeof trackIndex !== 'number') {
      // this should not happen
      continue;
    }

    const track = featureTracks[trackIndex];

    if (!track) {
      featureTracks[trackIndex] = [feature];
    } else {
      track.push(feature);
    }
  }

  // just in case: make sure there are no empty indices in the tracks array
  featureTracks = featureTracks.filter((track) => !!track);
  return featureTracks;
};

// same logic for genes and regulatory features
// (the only consideration is that regulatory features may have extended start or end)
const isFeatureInsideSelection = (params: {
  feature: {
    start: number;
    end: number;
    extended_start?: number;
    extended_end?: number;
  };
  start?: number;
  end?: number;
}) => {
  const { feature, start, end } = params;

  // if start and/or end are not provided, consider feature to be part of selection
  if (!start || !end) {
    return true;
  }

  const isExtendedStartInsideSelection = feature.extended_start
    ? feature.extended_start > start && feature.extended_start < end
    : false;
  const isExtendedEndInsideSelection = feature.extended_end
    ? feature.extended_end > start && feature.extended_end < end
    : false;
  const isFeatureStartInsideSelection =
    feature.start > start && feature.start < end;
  const isFeatureEndInsideSelection = feature.end > start && feature.end < end;
  // for features that fill the viewport and have start/end hanging outside
  const isOverhangingFeature =
    ((feature.extended_start && feature.extended_start < start) ||
      feature.start < start) &&
    ((feature.extended_end && feature.extended_end > end) || feature.end > end);

  return (
    isExtendedStartInsideSelection ||
    isExtendedEndInsideSelection ||
    isFeatureStartInsideSelection ||
    isFeatureEndInsideSelection ||
    isOverhangingFeature
  );
};
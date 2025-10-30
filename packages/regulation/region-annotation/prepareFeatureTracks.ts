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
  const { data } = params;

  const geneTracks = prepareGeneTracks({ data });
  const regulatoryFeatureTracks = prepareRegulatoryFeatureTracks({ data });

  return {
    geneTracks,
    regulatoryFeatureTracks
  };
};


const prepareGeneTracks = (params: {
  data: InputData;
}) => {
  const { data } = params;
  const forwardStrandTracks: GeneTrack[] = [];
  const reverseStrandTracks: GeneTrack[] = [];

  for (const gene of data.genes) {
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
}) => {
  const { data } = params;
  const { regulatory_feature_types: featureTypesMap } = data;

  let featureTracks: RegulatoryFeature[][] = [];

  for (const feature of data.regulatory_features) {
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
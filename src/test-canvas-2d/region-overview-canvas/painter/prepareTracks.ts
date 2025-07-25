import type { RegionOverviewData } from '../regionOverviewCanvas';
import type { GeneInRegionOverview, RegulatoryFeature, RegulatoryFeatureMetadata } from '../../../shared/types/regionOverview';

type Params = {
  data: RegionOverviewData;
};

export type GeneInTrack = {
  data: GeneInRegionOverview;
};

export type GeneTrack = GeneInTrack[];

export type FeatureTracks = ReturnType<typeof prepareFeatureTracks>;

const prepareFeatureTracks = (params: Params) => {
  const geneTracks = prepareGeneTracks(params.data);
  const regulatoryFeatureTracks = prepareRegulatoryFeatureTracks(params.data);

  return {
    geneTracks,
    regulatoryFeatureTracks
  };
};

const prepareGeneTracks = (params: {
  genes: GeneInRegionOverview[];
}) => {
  const { genes } = params;

  const forwardStrandTracks: GeneTrack[] = [];
  const reverseStrandTracks: GeneTrack[] = [];

  for (const gene of genes) {
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
  regulatory_features: RegulatoryFeature[];
  regulatory_feature_types: Record<string, RegulatoryFeatureMetadata>;
}) => {
  const {
    regulatory_features,
    regulatory_feature_types
  } = params;
  let featureTracks: RegulatoryFeature[][] = [];

  for (const feature of regulatory_features) {
    const trackIndex = regulatory_feature_types[feature.feature_type]?.track_index;

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
  featureTracks = featureTracks.filter((item) => !!item);
  return featureTracks;
};


export default prepareFeatureTracks;

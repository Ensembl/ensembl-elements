import {
  GENE_TRACKS_TOP_OFFSET,
  GENE_TRACK_HEIGHT,
  REGULATORY_FEATURE_TRACKS_TOP_OFFSET,
  REGULATORY_FEATURE_TRACK_HEIGHT,
  RULER_HEIGHT
} from './constants';

import { type FeatureTracks } from './prepareFeatureTracks';

export const getImageHeightAndTopOffsets = (featureTracks: FeatureTracks) => {
  const { geneTracks, regulatoryFeatureTracks } = featureTracks;
  const { forwardStrandTracks, reverseStrandTracks } = geneTracks;

  const geneTracksTopOffset = RULER_HEIGHT + GENE_TRACKS_TOP_OFFSET;

  const strandDividerTopOffset =
    geneTracksTopOffset +
    forwardStrandTracks.length * GENE_TRACK_HEIGHT +
    0.5 * GENE_TRACK_HEIGHT;

  const regulatoryFeatureTracksTopOffset =
    strandDividerTopOffset +
    GENE_TRACK_HEIGHT +
    reverseStrandTracks.length * GENE_TRACK_HEIGHT +
    REGULATORY_FEATURE_TRACKS_TOP_OFFSET;

  const imageHeight =
    regulatoryFeatureTracksTopOffset +
    regulatoryFeatureTracks.length * REGULATORY_FEATURE_TRACK_HEIGHT
    + RULER_HEIGHT;

  const bottomRulerTopOffset = imageHeight - RULER_HEIGHT;

  return {
    geneTracksTopOffset,
    strandDividerTopOffset,
    regulatoryFeatureTracksTopOffset,
    bottomRulerTopOffset,
    imageHeight
  };
};
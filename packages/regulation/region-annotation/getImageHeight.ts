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

  const forwardStrandGeneTrackOffsets = forwardStrandTracks.map((_, index) => {
    return geneTracksTopOffset + index * GENE_TRACK_HEIGHT;
  });

  const strandDividerTopOffset =
    geneTracksTopOffset +
    forwardStrandTracks.length * GENE_TRACK_HEIGHT +
    0.5 * GENE_TRACK_HEIGHT;

  const reverseStrandGeneTrackOffsets = reverseStrandTracks.map((_, index) => {
    return strandDividerTopOffset + GENE_TRACK_HEIGHT + geneTracksTopOffset + index * GENE_TRACK_HEIGHT;
  });

  const regulatoryFeatureTracksTopOffset =
    strandDividerTopOffset +
    GENE_TRACK_HEIGHT +
    reverseStrandTracks.length * GENE_TRACK_HEIGHT +
    REGULATORY_FEATURE_TRACKS_TOP_OFFSET;

  const regulatoryFeatureTrackOffsets = regulatoryFeatureTracks.map((_, index) => {
    return regulatoryFeatureTracksTopOffset + index * REGULATORY_FEATURE_TRACK_HEIGHT;
  });

  const imageHeight =
    regulatoryFeatureTracksTopOffset +
    regulatoryFeatureTracks.length * REGULATORY_FEATURE_TRACK_HEIGHT
    + RULER_HEIGHT;

  const bottomRulerTopOffset = imageHeight - RULER_HEIGHT;

  return {
    geneTracksTopOffset,
    forwardStrandGeneTrackOffsets,
    reverseStrandGeneTrackOffsets,
    strandDividerTopOffset,
    regulatoryFeatureTracksTopOffset,
    regulatoryFeatureTrackOffsets,
    bottomRulerTopOffset,
    imageHeight
  };
};
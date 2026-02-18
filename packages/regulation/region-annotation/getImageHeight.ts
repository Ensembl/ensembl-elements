import {
  GENE_TRACKS_TOP_OFFSET,
  GENE_TRACK_HEIGHT,
  MIN_GENE_TRACKS_COUNT,
  REGULATORY_FEATURE_TRACKS_TOP_OFFSET,
  REGULATORY_FEATURE_TRACK_HEIGHT,
  RULER_HEIGHT
} from './constants';

import { type FeatureTracks } from './prepareFeatureTracks';

export const getImageHeightAndTopOffsets = (featureTracks: FeatureTracks) => {
  const { geneTracks, regulatoryFeatureTracks } = featureTracks;
  const { forwardStrandTracks, reverseStrandTracks } = geneTracks;

  const geneTracksTopOffset = RULER_HEIGHT + GENE_TRACKS_TOP_OFFSET;

  // make sure there is space for at least 3 gene tracks for the forward strand
  const forwardStrandGeneTracksCount = Math.max(forwardStrandTracks.length, MIN_GENE_TRACKS_COUNT);
  const forwardStrandGeneTrackOffsets = [...Array(forwardStrandGeneTracksCount)]
    .map((_, index) => {
      return geneTracksTopOffset + index * GENE_TRACK_HEIGHT;
    });

  const strandDividerTopOffset =
    geneTracksTopOffset +
    forwardStrandGeneTracksCount * GENE_TRACK_HEIGHT +
    0.5 * GENE_TRACK_HEIGHT;

  // make sure there is space for at least 3 gene tracks for the reverse strand
  const reverseStrandGeneTracksCount = Math.max(reverseStrandTracks.length, MIN_GENE_TRACKS_COUNT);
  const reverseStrandGeneTrackOffsets = [...Array(reverseStrandGeneTracksCount)]
    .map((_, index) => {
      return strandDividerTopOffset
        + GENE_TRACK_HEIGHT
        + index * GENE_TRACK_HEIGHT;
    });

  const regulatoryFeatureTracksTopOffset =
    strandDividerTopOffset +
    GENE_TRACK_HEIGHT +
    reverseStrandGeneTracksCount * GENE_TRACK_HEIGHT +
    REGULATORY_FEATURE_TRACKS_TOP_OFFSET;

  // make sure there is space for at least 3 tracks of regulatory features
  const regulatoryFeatureTracksCount = Math.max(regulatoryFeatureTracks.length, 3);
  const regulatoryFeatureTrackOffsets = [...Array(regulatoryFeatureTracksCount)]
    .map((_, index) => {
      return regulatoryFeatureTracksTopOffset + index * REGULATORY_FEATURE_TRACK_HEIGHT;
    });

  const imageHeight =
    regulatoryFeatureTracksTopOffset +
    regulatoryFeatureTracksCount * REGULATORY_FEATURE_TRACK_HEIGHT
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
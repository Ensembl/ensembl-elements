import {
  GENE_TRACKS_TOP_OFFSET,
  GENE_TRACK_HEIGHT,
  MIN_GENE_TRACKS_COUNT,
  REGULATORY_FEATURE_TRACKS_TOP_OFFSET,
  REGULATORY_FEATURE_TRACK_HEIGHT,
  RULER_HEIGHT,
  MIN_EMPTY_PLOT_HEIGHT
} from './constants';

import { type FeatureTracks } from './prepareFeatureTracks';

export const getImageHeightAndTopOffsets = ({
  tracks,
  showGenes = true,
  showRegulatoryFeatures = true,
  showTss = true
}: {
  tracks: FeatureTracks;
  showGenes?: boolean;
  showRegulatoryFeatures?: boolean;
  showTss?: boolean;
}) => {
  const { geneTracks, regulatoryFeatureTracks } = tracks;
  const { forwardStrandTracks, reverseStrandTracks } = geneTracks;

  // TSS extends 2 px from the gene, plus a 12 px arm and 3 px arrowhead half-height.
  // Reserve the allowance even in empty viewports while TSS display is enabled.
  const reclaimedTssPadding = showTss ? 0 : 17;
  const regulatoryFeatureTracksCount = showRegulatoryFeatures ? regulatoryFeatureTracks.length : 0;
  const geneTracksTopOffset = showGenes
    ? RULER_HEIGHT + GENE_TRACKS_TOP_OFFSET - reclaimedTssPadding
    : RULER_HEIGHT;

  // make sure there is space for at least 2 gene tracks for the forward strand
  const forwardStrandGeneTracksCount = showGenes
    ? Math.max(forwardStrandTracks.length, MIN_GENE_TRACKS_COUNT)
    : 0;
  const forwardStrandGeneTrackOffsets = [...Array(forwardStrandGeneTracksCount)]
    .map((_, index) => {
      return geneTracksTopOffset + index * GENE_TRACK_HEIGHT;
    });

  const strandDividerTopOffset =
    geneTracksTopOffset +
    forwardStrandGeneTracksCount * GENE_TRACK_HEIGHT +
    (showGenes ? 0.5 * GENE_TRACK_HEIGHT : 0);

  // make sure there is space for at least 2 gene tracks for the reverse strand
  const reverseStrandGeneTracksCount = showGenes
    ? Math.max(reverseStrandTracks.length, MIN_GENE_TRACKS_COUNT)
    : 0;
  const reverseStrandGeneTrackOffsets = [...Array(reverseStrandGeneTracksCount)]
    .map((_, index) => {
      return strandDividerTopOffset
        + GENE_TRACK_HEIGHT
        + index * GENE_TRACK_HEIGHT;
    });

  const regulatoryFeatureTracksTopOffset = showGenes
    ? strandDividerTopOffset +
      GENE_TRACK_HEIGHT +
      reverseStrandGeneTracksCount * GENE_TRACK_HEIGHT +
      REGULATORY_FEATURE_TRACKS_TOP_OFFSET - reclaimedTssPadding
    : RULER_HEIGHT + (regulatoryFeatureTracksCount ? REGULATORY_FEATURE_TRACKS_TOP_OFFSET : 0);

  const regulatoryFeatureTrackOffsets = [...Array(regulatoryFeatureTracksCount)]
    .map((_, index) => {
      return regulatoryFeatureTracksTopOffset + index * REGULATORY_FEATURE_TRACK_HEIGHT;
    });

  const imageHeight = !showGenes && regulatoryFeatureTracksCount === 0
    ? 2 * RULER_HEIGHT + MIN_EMPTY_PLOT_HEIGHT
    : regulatoryFeatureTracksTopOffset +
      regulatoryFeatureTracksCount * REGULATORY_FEATURE_TRACK_HEIGHT +
      RULER_HEIGHT;

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

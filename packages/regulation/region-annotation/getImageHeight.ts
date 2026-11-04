import {
  GENE_TRACKS_TOP_OFFSET,
  GENE_TRACK_HEIGHT,
  MIN_GENE_TRACKS_COUNT,
  REGULATORY_FEATURE_TRACKS_TOP_OFFSET,
  REGULATORY_FEATURE_TRACK_HEIGHT,
  RULER_HEIGHT
} from './constants';

import { type FeatureTracks } from './prepareFeatureTracks';

export const getImageHeightAndTopOffsets = ({
  tracks
}: {
  tracks: FeatureTracks;
}) => {
  const { geneTracks, regulatoryFeatureTracks } = tracks;
  const { forwardStrandTracks = [], reverseStrandTracks = [] } = geneTracks ?? {};

  // TSS extends 2 px from the gene, plus a 12 px arm and 3 px arrowhead half-height.
  const hasTss = (tracks: typeof forwardStrandTracks) =>
    tracks.some(track => track.some(gene => (gene.data.tss?.length ?? 0) > 0));
  const reclaimedForwardTssPadding = hasTss(forwardStrandTracks) ? 0 : 17;
  const reclaimedReverseTssPadding = hasTss(reverseStrandTracks) ? 0 : 17;
  const geneTracksTopOffset = geneTracks
    ? RULER_HEIGHT + GENE_TRACKS_TOP_OFFSET - reclaimedForwardTssPadding
    : RULER_HEIGHT;

  // make sure there is space for at least 2 gene tracks for the forward strand
  const forwardStrandGeneTracksCount = geneTracks
    ? Math.max(forwardStrandTracks.length, MIN_GENE_TRACKS_COUNT)
    : 0;
  const forwardStrandGeneTrackOffsets = [...Array(forwardStrandGeneTracksCount)]
    .map((_, index) => {
      return geneTracksTopOffset + index * GENE_TRACK_HEIGHT;
    });

  const strandDividerTopOffset =
    geneTracksTopOffset +
    forwardStrandGeneTracksCount * GENE_TRACK_HEIGHT +
    (geneTracks ? 0.5 * GENE_TRACK_HEIGHT : 0);

  // make sure there is space for at least 2 gene tracks for the reverse strand
  const reverseStrandGeneTracksCount = geneTracks
    ? Math.max(reverseStrandTracks.length, MIN_GENE_TRACKS_COUNT)
    : 0;
  const reverseStrandGeneTrackOffsets = [...Array(reverseStrandGeneTracksCount)]
    .map((_, index) => {
      return strandDividerTopOffset
        + GENE_TRACK_HEIGHT
        + index * GENE_TRACK_HEIGHT;
    });

  const regulatoryFeatureTracksTopOffset = geneTracks
    ? strandDividerTopOffset +
      GENE_TRACK_HEIGHT +
      reverseStrandGeneTracksCount * GENE_TRACK_HEIGHT +
      REGULATORY_FEATURE_TRACKS_TOP_OFFSET - reclaimedReverseTssPadding
    : RULER_HEIGHT + (regulatoryFeatureTracks.length ? REGULATORY_FEATURE_TRACKS_TOP_OFFSET : 0);

  const regulatoryFeatureTracksCount = regulatoryFeatureTracks.length;
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

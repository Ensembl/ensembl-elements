import { TrackSummary as GenomeBrowserTrackSummary } from '../genome-browser/types/genome-browser';

export type TrackPositions = {
  genomeBrowserTop: {
    offsetTop: number;
    height: number;
    tracks: GenomeBrowserTrackSummary[];
  },
  genomeBrowserBottom: {
    offsetTop: number;
    height: number;
    tracks: GenomeBrowserTrackSummary[];
  },
  variantAlignments: {
    offsetTop: number;
    height: number;
  }
};


export type TrackSummary = {
  id: string; // track id
  offset: number; // y-offset (in pixels) from the top of the component
  height: number;
};


export const initialTrackPositions: TrackPositions = {
  genomeBrowserTop: {
    offsetTop: 0,
    height: 0,
    tracks: []
  },
  genomeBrowserBottom: {
    offsetTop: 0,
    height: 0,
    tracks: []
  },
  variantAlignments: {
    offsetTop: 0,
    height: 0
  }
};

export const haveTrackPositionsChanged = (positions: TrackPositions, prevPositions: TrackPositions) => {
  return JSON.stringify(positions) !== JSON.stringify(prevPositions);
};

export const updateGenomeBrowserTrackSummaries = ({
  trackPositions,
  trackSummaries,
  isAlt
}: {
  trackPositions: TrackPositions;
  trackSummaries: GenomeBrowserTrackSummary[];
  isAlt: boolean;
}) => {
  trackPositions = structuredClone(trackPositions);
  trackSummaries = trackSummaries.toSorted((track1, track2) => track1.offset - track2.offset);

  if (isAlt) {
    trackPositions.genomeBrowserBottom.tracks = trackSummaries;
  } else {
    trackPositions.genomeBrowserTop.tracks = trackSummaries;
  }
  return trackPositions;
}


/**
 * Change track summaries from the format they arrive in from the genome browser
 * into the format to be broadcast of the sv-browser component
 */
const getReshapedTrackSummaries = ({
  trackPositions,
  isAlt
}: {
  trackPositions: TrackPositions;
  isAlt?: boolean;
}) => {
  const topOffset = isAlt ? trackPositions.genomeBrowserBottom.offsetTop : 0;
  const trackSummaries = isAlt
    ? trackPositions.genomeBrowserBottom.tracks
    : trackPositions.genomeBrowserTop.tracks;
  return trackSummaries.map(track => ({
    id: track['switch-id'],
    offset: topOffset + track.offset,
    height: track.height
  }));
}


/**
 * Although the sv-browser component currently consists of two genome browser instances
 * and a component between the two; this should probably remain an implementation detail
 * that does not need to leak out from the component.
 */
export const createOutgoingTrackSummaries = (trackPositions: TrackPositions): TrackSummary[] => {
  const referenceGenomeTracks = getReshapedTrackSummaries({
    trackPositions
  });
  const altGenomeTracks = getReshapedTrackSummaries({
    trackPositions,
    isAlt: true
  });
  const alignmentsTrack = {
    id: 'alignments',
    offset: trackPositions.variantAlignments.offsetTop,
    height: trackPositions.variantAlignments.height
  };

  return [...referenceGenomeTracks, alignmentsTrack, ...altGenomeTracks];
};
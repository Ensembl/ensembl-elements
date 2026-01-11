import { TrackSummary as GenomeBrowserTrackSummary } from '../genome-browser/types/genome-browser';

export type TrackPositions = {
  genomeBrowserTop: {
    offsetTop: number;
    height: number;
    tracks: TrackSummary[];
  },
  genomeBrowserBottom: {
    offsetTop: number;
    height: number;
    tracks: TrackSummary[];
  },
  variantAlignments: {
    offsetTop: number;
    height: number;
  }
};


type TrackSummary = {
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
  const topOffset = isAlt ? trackPositions.genomeBrowserBottom.offsetTop : 0;
  const updatedTrackSummaries = createSummariesForGenomeBrowserTracks({
    trackSummaries,
    offset: topOffset
  });
  if (isAlt) {
    trackPositions.genomeBrowserBottom.tracks = updatedTrackSummaries;
  } else {
    trackPositions.genomeBrowserTop.tracks = updatedTrackSummaries;
  }
  return trackPositions;
}

export const createSummariesForGenomeBrowserTracks = (payload: {
  trackSummaries: GenomeBrowserTrackSummary[];
  offset: number;
}) => {
  const { trackSummaries, offset } = payload;
  return trackSummaries.toSorted((track1, track2) => track1.offset - track2.offset).map(track => ({
    id: track['switch-id'],
    offset: offset + track.offset,
    height: track.height
  }));
}


/**
 * Although the sv-browser component currently consists of two genome browser instances
 * and a component between the two; this should probably remain an implementation detail
 * that does not leak out from the component.
 * 
 */
export const createOutgoingTrackSummaries = (trackPositions: TrackPositions): TrackSummary[] => {
  const referenceGenomeTracks = trackPositions.genomeBrowserTop.tracks;
  const altGenomeTracks = trackPositions.genomeBrowserBottom.tracks;
  const alignmentsTrack = {
    id: 'alignments',
    offset: trackPositions.variantAlignments.offsetTop,
    height: trackPositions.variantAlignments.height
  };

  return [...referenceGenomeTracks, alignmentsTrack, ...altGenomeTracks];
};
export type HistoneMetadata = {
  peak_type: 'gapped' | 'narrow';
  label: string; // arbitrary string
  color: string; // hex color
};

export type HistoneMetadataMap = Record<string, HistoneMetadata>;

export type TrackMetadata = {
  histone: HistoneMetadataMap;
};

/**
 * Data for a single track.
 * The `epigenome_ids` field contains ids of base epigenomes
 * used to collect data for this track. It is an array, because
 * base epigenomes may be combined together, when the data is requested)
 */
export type TrackData = {
  epigenome_ids: string[];
  open_chromatin: {
    signal: Array<OpenChromatinSignal>;
    peaks: Array<OpenChromatinPeak>;
  };
  histones: {
    [key: string]: HistoneNarrowPeak[] | HistoneGappedPeak[];
  };
};

type OpenChromatinSignal = {
  start: number; // start (Ensembl genomic coordinate)
  end: number; // end (Ensembl genomic coordinate)
  value: number; // value (an integer between 1 and 9)
};

type OpenChromatinPeak = {
  start: number; // start (Ensembl genomic coordinate)
  end: number; // end (Ensembl genomic coordinate)
};

type HistoneNarrowPeak = {
  start: number; // start (Ensembl genomic coordinate)
  end: number; // end (Ensembl genomic coordinate)
};

/**
 * The purpose of 'block starts' and 'block sizes' is the same as in a .bed file.
 * They describe data to draw rectangles whose left x coordinate corresponds to a block start,
 * and whose width corresponds to a block end.
 */
export type HistoneGappedPeak = {
  start: number;
  end: number;
  block_count: number; // this is kinda superfluous; it is the same as the length of 'block_starts' or 'block_sizes'
  block_starts: number[];
  block_sizes: number[];
};


/* EVENTS */

export type TrackPositionPayload = {
  id: string[]; // list of ids of epigenomes whose data is rendered in the track
  y: number; // vertical offset from the top edge of the component
  height: number; // height of the track
};

export type TrackPositionsPayload = TrackPositionPayload[];


// export type EpigenomeActivityResponse = {
//   track_metadata: EpigenomeActivityMetadata;
//   track_data: TrackData[];
// };
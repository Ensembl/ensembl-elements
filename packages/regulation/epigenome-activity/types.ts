export type TrackLegendItem = {
  data_type: 'signal' | 'narrow_peaks' | 'gapped_peaks';
  label: string;
  fill_color: string;
  stroke_color?: string;
  legend_index: number;
};

export type ActivityTrackMetadata = {
  label: string;
  default_view_mode: 'expanded' | 'squished';
  render_style: 'signal_with_peak_outlines' | 'solid_peaks' | 'gapped_peaks';
  track_index: number;
  legend_items: TrackLegendItem[];
};

export type TrackMetadata = Record<string, ActivityTrackMetadata>;

export type ActivityTrack = {
  track_type: string;
  data: {
    source_epigenome_ids: string[];
    signal?: SignalInterval[];
    narrow_peaks?: NarrowPeak[];
    gapped_peaks?: GappedPeak[];
  };
};

/** One requested epigenome group, including groups without available tracks. */
export type TrackData = {
  epigenome_ids: string[];
  tracks: ActivityTrack[];
};

export type RegionActivityResponse = {
  groups: TrackData[];
  track_metadata: TrackMetadata;
};

type SignalInterval = {
  start: number; // start (Ensembl genomic coordinate)
  end: number; // end (Ensembl genomic coordinate)
  value: number; // value (an integer between 1 and 9)
};

type NarrowPeak = {
  start: number; // start (Ensembl genomic coordinate)
  end: number; // end (Ensembl genomic coordinate)
};

/**
 * The purpose of 'block starts' and 'block sizes' is the same as in a .bed file.
 * They describe data to draw rectangles whose left x coordinate corresponds to a block start,
 * and whose width corresponds to a block end.
 */
type GappedPeak = {
  start: number;
  end: number;
  block_count: number; // this is kinda superfluous; it is the same as the length of 'block_starts' or 'block_sizes'
  block_starts: number[];
  block_sizes: number[];
};


export type SelectedLocation = {
  start: number;
  end: number;
};


/* EVENTS */

export type TrackPositionPayload = {
  id: string[]; // list of ids of epigenomes whose data is rendered in the track
  y: number; // vertical offset from the top edge of the component
  height: number; // height of the track
};

export type TrackPositionsPayload = TrackPositionPayload[];


export type TrackPositionsChangeEvent = CustomEvent<TrackPositionsPayload>;
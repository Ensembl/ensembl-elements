export type GenomeBrowserConfig = {
  backend_url: string;
  target_element: HTMLElement;
};

export type TrackSummary = {
  type: 'track';
  ['switch-id']: string;
  offset: number;
  height: number;
};

export type TrackSummaryPayload = {
  summary: TrackSummary[];
};

export type TrackSummaryEventDetail = {
  type: 'track-summary',
  genome_id: string,
  payload: TrackSummaryPayload;
};

type HotspotVariety = {
  type: string;
  [key: string]: unknown | undefined;
}

export type HotspotPayload = {
  x: number;
  y: number;
  content: unknown[];
  // Note: genome browser sends floats in the hotspot-area below.
  // Might be worth updating the genome browser to always send rounded integers
  'hotspot-area': {
    bottom: number;
    left: number;
    right: number;
    top: number;
  };
  variety: HotspotVariety[];
};

export type HotspotEventDetail = {
  type: 'hotspot',
  genome_id: string,
  payload: HotspotPayload;
};

export type LocationChangePayload = {
  start: number;
  end: number;
};
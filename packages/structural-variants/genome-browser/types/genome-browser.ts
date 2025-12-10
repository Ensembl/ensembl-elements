export type GenomeBrowserConfig = {
  backend_url: string;
  target_element: HTMLElement;
};

type TrackSummaryEntry = {
  type: string;
  ['switch-id']: string;
  offset: number;
  height: number;
};

export type TrackSummaryPayload = {
  summary: TrackSummaryEntry[];
};

export type HotspotPayload = {
  x: number;
  y: number;
  content: object[];
  variety: object[];
};

export type GBMessagePayload = {
  genome: string;
  payload: TrackSummaryPayload | HotspotPayload;
};

export type LocationChangePayload = {
  start: number;
  end: number;
};
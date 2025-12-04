export type GenomeBrowserConfig = {
  backend_url: string;
  target_element: HTMLElement;
};

export type PointerPosition = {
  x: number;
  y: number;
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
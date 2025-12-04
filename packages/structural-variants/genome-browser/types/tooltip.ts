import { PointerPosition } from './genome-browser.ts';

export type GeneMetadata = {
  type: 'gene';
  symbol?: string;
  name?: string;
  designation?: string;
  versioned_id: string;
  unversioned_id: string;
  gene_biotype?: string;
  track: string;
  strand: string;
};

export type TranscriptMetadata = {
  type: 'transcript';
  symbol?: string;
  name?: string;
  gene_id?: string;
  versioned_id: string;
  unversioned_id: string;
  transcript_biotype?: string;
  track: string;
  strand: string;
};

export type HotspotContent = {
  data: object[];
  metadata: GeneMetadata | TranscriptMetadata;
};

export type HotspotPayload = {
  x: number;
  y: number;
  content: HotspotContent[];
  variety: object[];
};

export type TooltipState = {
  contentItems: HotspotContent[];
  pointer: PointerPosition;
};

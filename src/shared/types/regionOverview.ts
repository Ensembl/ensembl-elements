type ForwardOrReverseStrand = 'forward' | 'reverse';
type Strand = 'forward' | 'reverse' | 'independent';

type Region = {
  name: string;
  length: number;
  coordinate_system: string; // <-- e.g. 'chromosome'
};

export type GeneInRegionOverview = {
  symbol?: string;
  stable_id: string;
  unversioned_stable_id: string;
  name?: {
    value: string;
    source?: string;
    accession?: string;
    url?: string;
  };
  biotype: string;
  start: number;
  end: number;
  strand: ForwardOrReverseStrand;
  representative_transcript: RepresentativeTranscriptInRegionOverview;
  tss: TranscriptionStartSite[];
  merged_exons: ExonInRegionOverview[];
  cds_counts: OverlappingCDSFragment[];
};

type RepresentativeTranscriptInRegionOverview = {
  exons: ExonInRegionOverview[];
  cds: CDSFragment[];
};

export type ExonInRegionOverview = {
  start: number;
  end: number;
};

// Section of a CDS within an exon
export type CDSFragment = {
  start: number;
  end: number;
};

type TranscriptionStartSite = {
  position: number;
};

/**
 * This segment represents an intersection of a given number of exons from different transcripts
 * that are within the coding sequence of that transcript.
 * The `count` field tells how many exons within a CDS are intersecting in this location.
 */
export type OverlappingCDSFragment = {
  start: number;
  end: number;
  count: number;
};

export type RegulatoryFeature = {
  id: string;
  feature_type: string; // promoter, enhancer, open_chromatin_region, CTCF_binding_site, etc. – Regulation doesn't want client to be aware of specific values
  start: number;
  end: number;
  strand: Strand;
  extended_start?: number; // <-- may have the same value as start
  extended_end?: number; // <-- may have the same value as end
  associated_genes: string[];
};

export type RegulatoryFeatureMetadata = {
  label: string; // <-- human-readable label
  description?: string; // if there is any extra information to go along with the label
  color: string; // <-- a hexadecimal colour string
  track_index: number; // <-- where to display a feature relative to others; 0-based
};

export type OverviewRegion = {
  region: Region; // <-- top-level region, such as chromosome
  locations: {
    start: number;
    end: number;
  }[]; // <-- identifies parts of the region that will be included in the diagram
  genes: GeneInRegionOverview[];
  regulatory_features: {
    feature_types: Record<string, RegulatoryFeatureMetadata>;
    data: RegulatoryFeature[];
  };
};

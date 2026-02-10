export const GENE_TRACKS_TOP_OFFSET = 40;
export const GENE_HEIGHT = 8;
export const GENE_LABEL_HEIGHT = 10;
export const GENE_TRACK_HEIGHT = GENE_HEIGHT + GENE_LABEL_HEIGHT + 3;

export const REGULATORY_FEATURE_TRACKS_TOP_OFFSET = 38;

export const REGULATORY_FEATURE_HEIGHT = 8;
export const REGULATORY_FEATURE_CORE_HEIGHT = 8;
export const REGULATORY_FEATURE_EXTENT_HEIGHT = 4;
export const REGULATORY_FEATURE_TRACK_HEIGHT = REGULATORY_FEATURE_HEIGHT + 10;

export const MAX_SLICE_LENGTH_FOR_DETAILED_VIEW = 3_000_000;

export const RULER_HEIGHT = 15;

export const COLORS = {
  gene: '#0099ff', // Ensembl brand blue colour
  geneFocused: '#1b2c39', // Ensembl black colour
  geneStrandDivider: '#ccd3d8', // a shade of grey outside the Ensembl palette
  rulerTick: '#d4d9df', // medium-light-grey
  rulerLabel: '#1b2c39', // Ensembl black colour
  transcriptionStartSite: '#1b2c39', // Ensembl black colour
  regulatoryFeatureUnfocused: '#e5eaf0', // Light grey; same colour that is used during location selection
  geneLabel: '#6f8190' // Ensembl dark grey
} as const;

export type Colors = Record<keyof typeof COLORS, string>;
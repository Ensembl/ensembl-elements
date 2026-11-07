export const OPEN_CHROMATIN_SIGNAL_HEIGHT = 8;
export const OPEN_CHROMATIN_SIGNAL_OFFSET_TOP = 2;

export const OPEN_CHROMATIN_PEAK_HEIGHT = 10;
export const OPEN_CHROMATIN_PEAK_OFFSET_TOP = 1;

export const NARROW_PEAK_OFFSET_TOP = 4;
export const NARROW_PEAK_HEIGHT = 2;

export const GAPPED_PEAK_OFFSET_TOP = 4;
export const GAPPED_PEAK_BLOCK_HEIGHT = 2;
export const GAPPED_PEAK_CONNECTOR_HEIGHT = 1;

export const COLORS = {
  openChromatinLow: '#f1f1f1',
  openChromatinHigh: '#474747',
  openChromatinPeak: '#1b2c39', // Ensembl black colour
};

export type Colors = Record<keyof typeof COLORS, string>;
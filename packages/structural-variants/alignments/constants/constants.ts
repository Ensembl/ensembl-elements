export const RULER_HEIGHT = 12;
export const ALIGNMENT_AREA_HEIGHT = 135;
export const IMAGE_HEIGHT = ALIGNMENT_AREA_HEIGHT + 2 * RULER_HEIGHT;
export const VARIANT_HEIGHT = 6;

export const STRUCTURAL_VARIANT_LENGTH_CUTOFF = 50; // variant length (extent) at which it is considered a structural variant

export const COLORS = {
  alignment: '#0099ff', // Ensembl blue
  deletion: '#d90000', // Ensembl red
  insertion: '#5a7ee3', // a new kind of blue (not in Ensembl palette)
  inversion: '#f8c041', // Ensembl dark yellow
};
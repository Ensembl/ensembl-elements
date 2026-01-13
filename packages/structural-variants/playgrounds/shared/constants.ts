export const REFERENCE_GENOME_ID = '4c07817b-c7c5-463f-8624-982286bc4355';
export const ALT_GENOME_ID = '27be510b-c431-434c-a6f5-158d8c138507';
export const REFERENCE_TRACKS = ['sv-gene', '950a71e1-5229-459c-822f-d104506d24e8'];
export const ALT_TRACKS = ['sv-gene'];

export const INITIAL_VIEWPORT = {
  regionName: '7',
  start: 64_000_000,
  end: 68_000_000,
  regionLength: 160_567_428
};

export const ENDPOINTS = {
  genomeBrowser: 'https://dev-2020.ensembl.org/api/browser/data',
  alignments: 'https://dev-2020.ensembl.org/api/structural-variants/alignments',
  variants: 'https://dev-2020.ensembl.org/api/structural-variants/variants'
};
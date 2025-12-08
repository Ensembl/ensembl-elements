export const REFERENCE_GENOME_ID = '4c07817b-c7c5-463f-8624-982286bc4355';
export const ALT_GENOME_ID = 'a7335667-93e7-11ec-a39d-005056b38ce3';
export const REFERENCE_TRACKS = ['sv-gene', '950a71e1-5229-459c-822f-d104506d24e8'];
export const ALT_TRACKS = ['sv-gene', 'a8691c70-7d68-4322-937d-938affb1b4ea'];

export const INITIAL_VIEWPORT = {
  regionName: '1',
  start: 142_500_000,
  end: 145_500_000,
  regionLength: 248_956_422
};

export const GENOME_BROWSER_ENDPOINT = 'https://dev-2020.ensembl.org/api/browser/data';
export const ALIGNMENT_ENDPOINTS = {
  alignments: 'https://dev-2020.ensembl.org/api/structural-variants/alignments',
  variants: 'https://dev-2020.ensembl.org/api/structural-variants/variants'
};
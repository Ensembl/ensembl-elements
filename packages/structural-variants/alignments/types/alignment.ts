type Strand = 'forward' | 'reverse';

export type Alignment = {
  id: string;
  reference: {
    region_name: string;
    start: number;
    strand: Strand;
    length: number;
  },
  target: {
    region_name: string;
    start: number;
    strand: Strand;
    length: number;
  }
}
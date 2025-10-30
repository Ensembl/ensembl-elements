import type { GeneInRegionOverview } from './regionOverview';

export type GeneClickPayload = {
  x: number;
  y: number;
  featureType: 'gene';
  data: {
    stableId: GeneInRegionOverview['stable_id'];
    unversionedStableId: GeneInRegionOverview['unversioned_stable_id'];
    symbol: GeneInRegionOverview['symbol'];    
    biotype: GeneInRegionOverview['biotype'];
    regionName: string;
    start: GeneInRegionOverview['start'];
    end: GeneInRegionOverview['end'];
    strand: GeneInRegionOverview['strand'];
  };
};

export type FeatureClickPayload =
  | GeneClickPayload;
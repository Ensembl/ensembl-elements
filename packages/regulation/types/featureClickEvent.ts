import type { GeneInRegionOverview, RegulatoryFeature } from './regionOverview';

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

export type RegulatoryFeatureClickPayload = {
  x: number;
  y: number;
  featureType: 'regulatory-feature';
  data: Omit<RegulatoryFeature, 'associated_genes'> & {
    regionName: string;
  };
};

export type FeatureClickPayload =
  | GeneClickPayload
  | RegulatoryFeatureClickPayload;
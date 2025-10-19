/**
 * In order to avoid the need to iterate over the whole length of the region when looking for features,
 * features are stored in 1-megabase 'bins'.
 */

import type {
  GeneInRegionOverview,
  RegulatoryFeature,
  RegulatoryFeatureMetadata
} from './regionOverview';

export type InputData = {
  genes: GeneInRegionOverview[];
  regulatory_features: RegulatoryFeature[];
  regulatory_feature_types: Record<string, RegulatoryFeatureMetadata>;
};

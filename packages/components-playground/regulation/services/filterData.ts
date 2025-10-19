import {
  type OverviewRegion
} from '@ensembl/ensembl-regulation/region-overview';

export const pickData = ({
  data,
  start,
  end
}: {
  data: OverviewRegion;
  start: number;
  end: number;
}) => {
  const genes = data.genes.filter(gene => gene.start <= end && gene.end >= start);
  const regulatory_features = data.regulatory_features.data
    .filter(feature => feature.start <= end && feature.end >= start);

  return {
    genes,
    regulatory_features,
    regulatory_feature_types: data.regulatory_features.feature_types
  };
};
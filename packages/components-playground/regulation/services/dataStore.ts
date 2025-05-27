import {
  dataStoreHelpers,
  type OverviewRegion,
  type GeneInRegionOverview,
  type RegulatoryFeature,
  type  RegulatoryFeatureMetadata,
} from '@ensembl/ensembl-regulation';

import chromosome1Data from '../data/chr1-data.json';

const CHROMOSOME_1_LENGTH = 248_956_422;

type DataBin = {
  genes: GeneInRegionOverview[];
  regulatory_features: RegulatoryFeature[];
};

type Store = {
  bins: Record<string, DataBin>;
  regulatory_feature_types: Record<string, RegulatoryFeatureMetadata>;
};

const store: Store = {
  bins: {},
  regulatory_feature_types: {}
};

const {
  createBins,
  createBinKey
} = dataStoreHelpers;

const populateStore = () => {
  const data = chromosome1Data as OverviewRegion;
  const slice = {
    start: 1,
    end: CHROMOSOME_1_LENGTH
  };
  store.regulatory_feature_types = data.regulatory_features.feature_types;
  store.bins = distributeAcrossBins({ slice, data });
};

const distributeAcrossBins = ({
  slice,
  data
}: {
  slice: { start: number; end: number };
  data: {
    genes: GeneInRegionOverview[];
    regulatory_features: {
      data: RegulatoryFeature[];
    }
  };
}) => {
  const { start, end } = slice;
  const {
    genes,
    regulatory_features: { data: regulatoryFeatures }
  } = data;

  const bins = createBins({ start, end });
  const binsMap = bins.reduce(
    (obj, { start, end }) => {
      const key = createBinKey({ start, end });
      obj[key] = { genes: [], regulatory_features: [] };
      return obj;
    },
    {} as Store['bins']
  );

  for (const gene of genes) {
    const binsForGene = createBins({
      start: gene.start,
      end: gene.end
    });
    const binKeysForGene = binsForGene
      .map(bin => createBinKey({ start: bin.start, end: bin.end }));
    for (const key of binKeysForGene) {
      binsMap[key].genes.push(gene);
    }
  }

  for (const regFeature of regulatoryFeatures) {
    const binsForFeature = createBins({
      start: regFeature.start,
      end: regFeature.end
    });
    const binKeysForFeature = binsForFeature
      .map(bin => createBinKey({ start: bin.start, end: bin.end }));
    for (const key of binKeysForFeature) {
      binsMap[key].regulatory_features.push(regFeature);
    }
  }

  return binsMap;
};


populateStore();

export default store;

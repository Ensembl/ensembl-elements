import { Hono } from 'hono';
import { BigBed, type Feature } from '@gmod/bbi';
import path from 'node:path';

import { parseViewportString } from './helpers.ts';

const filePath = path.resolve(import.meta.dirname, '../data/variant-grch38_hgvs3-details.bb');

const variants = new Hono();

variants.get('/', async (c) => {
  const viewportString = c.req.query('viewport');

  const bigBed = new BigBed({
    path: filePath
  });

  if (!viewportString) {
    throw 'Missing query';
  }

  const { regionName, start, end } = parseViewportString(viewportString);

  const featuresFromFile = await bigBed.getFeatures(regionName, start, end);
  const features = featuresFromFile.map(feature => prepareFeatureData({
    regionName,
    feature: feature as Feature & { rest: string }
  }));

  return c.json(features);
});

const prepareFeatureData = ({ regionName, feature }: {
  regionName: string;
  feature: {
    chromId: number;
    start: number;
    end: number;
    rest: string;
  }
}) => {
  const [variantName, variantType] = feature.rest.split('\t');

  return {
    name: variantName,
    type: variantType,
    location: {
      region_name: regionName,
      start: feature.start,
      end: feature.end,
    }
  };
};

export default variants;
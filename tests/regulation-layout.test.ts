import assert from 'node:assert/strict';
import { test } from 'node:test';
import { prepareFeatureTracks } from '../packages/regulation/region-annotation/prepareFeatureTracks';
import { getImageHeightAndTopOffsets } from '../packages/regulation/region-annotation/getImageHeight';
import type { InputData } from '../packages/regulation/types/inputData';
import type { GeneInRegionOverview } from '../packages/regulation/types/regionOverview';

const gene = (strand: 'forward' | 'reverse', tss?: { position: number }[]): GeneInRegionOverview => ({
  stable_id: strand,
  unversioned_stable_id: strand,
  biotype: 'protein_coding',
  start: 100,
  end: 200,
  strand,
  ...(tss === undefined ? {} : { tss }),
  representative_transcript: { exons: [], cds: [] },
  merged_exons: [],
  cds_counts: []
});
const layout = (data: InputData) => getImageHeightAndTopOffsets({
  tracks: prepareFeatureTracks({ data, start: 1, end: 1000 })
});
const metadata = (track_index: number) => ({ label: 'Feature', color: '#000', track_index });

test('omitted sections leave only the two rulers', () => {
  const result = layout({});
  assert.equal(result.imageHeight, 30);
  assert.deepEqual(result.forwardStrandGeneTrackOffsets, []);
  assert.deepEqual(result.reverseStrandGeneTrackOffsets, []);
  assert.deepEqual(result.regulatoryFeatureTrackOffsets, []);
  assert.equal(result.strandDividerTopOffset, 15);
});

test('supplied empty genes reserve minimum lanes; omission hides them', () => {
  const result = layout({ genes: [] });
  assert.equal(result.forwardStrandGeneTrackOffsets.length, 2);
  assert.equal(result.reverseStrandGeneTrackOffsets.length, 2);
  assert.ok(result.imageHeight > layout({}).imageHeight);
});

test('TSS padding follows each strand independently, including omitted TSS', () => {
  const withTss = (forward: boolean, reverse: boolean) => layout({
    genes: [gene('forward', forward ? [{ position: 100 }] : undefined),
      gene('reverse', reverse ? [{ position: 100 }] : [])]
  });
  const both = withTss(true, true);
  const forward = withTss(true, false);
  const reverse = withTss(false, true);
  const neither = withTss(false, false);
  assert.equal(both.imageHeight - neither.imageHeight, 34);
  assert.equal(both.imageHeight - forward.imageHeight, 17);
  assert.equal(both.imageHeight - reverse.imageHeight, 17);
  assert.equal(both.geneTracksTopOffset, forward.geneTracksTopOffset);
  assert.equal(both.geneTracksTopOffset - reverse.geneTracksTopOffset, 17);
  assert.equal(both.imageHeight, 205.5);
});

test('regulatory metadata reserves selected lanes even without features', () => {
  const data: InputData = { regulatory_features: [], regulatory_feature_types: {
    a: metadata(4), b: metadata(4), c: metadata(9)
  } };
  assert.deepEqual(layout(data).regulatoryFeatureTrackOffsets, [35, 53]);
  assert.equal(layout(data).imageHeight, 86);
  assert.deepEqual(layout({ ...data, regulatory_feature_types: { b: metadata(4) } })
    .regulatoryFeatureTrackOffsets, [35]);
  assert.deepEqual(layout({ ...data, regulatory_feature_types: {} }).regulatoryFeatureTrackOffsets, []);
  assert.deepEqual(layout({ regulatory_feature_types: data.regulatory_feature_types })
    .regulatoryFeatureTrackOffsets, []);
});

test('regulatory rows start after the complete gene section', () => {
  const genes = [gene('forward', [{ position: 100 }]), gene('reverse', [{ position: 100 }])];
  const genesOnly = layout({ genes });
  const combined = layout({ genes, regulatory_features: [], regulatory_feature_types: { a: metadata(0) } });
  assert.equal(combined.imageHeight - genesOnly.imageHeight, 18);
  assert.deepEqual(combined.forwardStrandGeneTrackOffsets, genesOnly.forwardStrandGeneTrackOffsets);
  assert.deepEqual(combined.reverseStrandGeneTrackOffsets, genesOnly.reverseStrandGeneTrackOffsets);
});

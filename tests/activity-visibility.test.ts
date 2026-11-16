import assert from 'node:assert/strict';
import { test } from 'node:test';
import { scaleLinear } from 'd3';
import { getActivityLayout } from '../packages/regulation/epigenome-activity/layout';
import { prepareActivityDataForDisplay } from '../packages/regulation/epigenome-activity/prepare-data';
import { renderTrack } from '../packages/regulation/epigenome-activity/render-track';
import type { TrackMetadata, TrackData, TrackVisibility } from '../packages/regulation/epigenome-activity/types';

const metadata: TrackMetadata = {
  open: { label: 'Open', default_view_mode: 'expanded', render_style: 'signal_with_peak_outlines', track_index: 0, legend_items: [] }
};
for (let i = 0; i < 5; i++) metadata[`peak${i}`] = {
  label: `Peak ${i}`, default_view_mode: 'squished', render_style: i % 2 ? 'gapped_peaks' : 'solid_peaks',
  track_index: i + 1, legend_items: []
};
const groups: TrackData[] = [
  { epigenome_ids: ['one'], tracks: [{ track_type: 'open', data: { source_epigenome_ids: ['one'], signal: [{start: 1, end: 10, value: 9}], narrow_peaks: [{start: 1, end: 10}] } }] },
  { epigenome_ids: ['empty'], tracks: [] }
];
const prepare = (visibility: TrackVisibility = {}) => prepareActivityDataForDisplay({
  tracks: groups, trackMetadata: metadata, trackVisibility: visibility,
  location: {start: 1, end: 100}, scale: scaleLinear().domain([0, 100]).range([0, 100])
});

test('packs enabled solid and gapped assays in metadata order, independent of availability', () => {
  assert.equal(getActivityLayout(metadata).rowHeight, 44);
  assert.deepEqual(getActivityLayout(metadata).offsets, { open: 0, peak0: 15, peak1: 21, peak2: 27, peak3: 33, peak4: 39 });
  const layout = getActivityLayout(metadata, {peak1: {gapped_peaks: false}});
  assert.equal(layout.rowHeight, 38);
  assert.deepEqual(layout.offsets, {open: 0, peak0: 15, peak2: 21, peak3: 27, peak4: 33});
  assert.deepEqual(getActivityLayout(Object.fromEntries(Object.entries(metadata).reverse())), getActivityLayout(metadata));
});

test('toggles signal and outlines independently and removes their slot only when both are hidden', () => {
  const signals = prepare({open: {narrow_peaks: false}})[0].tracks[0];
  const peaks = prepare({open: {signal: false}})[0].tracks[0];
  assert.ok(signals.render_style === 'signal_with_peak_outlines');
  assert.ok(peaks.render_style === 'signal_with_peak_outlines');
  assert.equal(signals.signals.length, 1);
  assert.equal(signals.peaks.length, 0);
  assert.equal(peaks.signals.length, 0);
  assert.equal(peaks.peaks.length, 1);
  assert.equal(renderTrack({trackData: signals, offsetTop: 0, colors: null}).length, 1);
  assert.equal(renderTrack({trackData: peaks, offsetTop: 0, colors: null}).length, 1);
  const layout = getActivityLayout(metadata, {open: {signal: false, narrow_peaks: false}});
  assert.equal(layout.offsets.peak0, 4);
  assert.equal(layout.rowHeight, 33);
});

test('retains empty groups and minimum labelled rows without modifying supplied data', () => {
  const before = structuredClone(groups);
  const hidden = Object.fromEntries(Object.keys(metadata).map(key => [key, {signal: false, narrow_peaks: false, gapped_peaks: false}]));
  assert.deepEqual(prepare(hidden), groups.map(group => ({epigenome_ids: group.epigenome_ids, tracks: []})));
  assert.equal(getActivityLayout(metadata, hidden).rowHeight, 32);
  assert.equal(getActivityLayout(metadata, hidden, 40).rowHeight, 40);
  assert.deepEqual(groups, before);
  assert.deepEqual(prepare()[1].tracks, []);
});

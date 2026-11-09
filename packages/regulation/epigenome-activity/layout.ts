import {
  OPEN_CHROMATIN_SIGNAL_OFFSET_TOP, OPEN_CHROMATIN_SIGNAL_HEIGHT,
  OPEN_CHROMATIN_PEAK_OFFSET_TOP, OPEN_CHROMATIN_PEAK_HEIGHT,
  NARROW_PEAK_OFFSET_TOP, NARROW_PEAK_HEIGHT,
  GAPPED_PEAK_OFFSET_TOP, GAPPED_PEAK_BLOCK_HEIGHT
} from './constants';
import type { TrackMetadata, TrackVisibility } from './types';

export type ActivityLayout = {
  rowHeight: number;
  offsets: Record<string, number>;
};

/** Layout depends on enabled assays, not on the availability of regional data. */
export const getActivityLayout = (
  metadata: TrackMetadata,
  visibility: TrackVisibility = {},
  minimumRowHeight = 32
): ActivityLayout => {
  const offsets: Record<string, number> = {};
  let bottom = 0;
  for (const [type, track] of Object.entries(metadata).sort(([, a], [, b]) => a.track_index - b.track_index)) {
    const visible = visibility[type];
    switch (track.render_style) {
      case 'signal_with_peak_outlines': {
        const signal = visible?.signal !== false;
        const peaks = visible?.narrow_peaks !== false;
        if (!signal && !peaks) break;
        offsets[type] = bottom;
        bottom += Math.max(
          signal ? OPEN_CHROMATIN_SIGNAL_OFFSET_TOP + OPEN_CHROMATIN_SIGNAL_HEIGHT : 0,
          peaks ? OPEN_CHROMATIN_PEAK_OFFSET_TOP + OPEN_CHROMATIN_PEAK_HEIGHT : 0
        );
        break;
      }
      case 'solid_peaks':
        if (visible?.narrow_peaks === false) break;
        offsets[type] = bottom + NARROW_PEAK_OFFSET_TOP;
        bottom = offsets[type] + NARROW_PEAK_HEIGHT;
        break;
      case 'gapped_peaks':
        if (visible?.gapped_peaks === false) break;
        offsets[type] = bottom + GAPPED_PEAK_OFFSET_TOP;
        bottom = offsets[type] + GAPPED_PEAK_BLOCK_HEIGHT;
        break;
    }
  }
  return { rowHeight: Math.max(minimumRowHeight, bottom + 3), offsets };
};

import type { ScaleLinear } from 'd3';

import { toZeroBased } from '../helpers/toZeroBased';

import type { ActivityTrack, ActivityTrackMetadata, TrackData, TrackMetadata } from './types';

type InputParams = {
  tracks: TrackData[];
  trackMetadata: TrackMetadata;
  location: {
    start: number;
    end: number;
  };
  scale: ScaleLinear<number, number>;
};

type PreparedSignal = {
  x: number;
  width: number;
  value: number;
};

type PreparedPeak = {
  x: number;
  width: number;
};

type PreparedGappedPeak = {
  id: string;
  blocks: PreparedPeak[];
  connectors: PreparedPeak[];
};

type PreparedTrackBase = {
  track_type: string;
  label: string;
  source_epigenome_ids: string[];
};

export type PreparedTrack = PreparedTrackBase & (
  | { render_style: 'signal_with_peak_outlines'; signals: PreparedSignal[]; peaks: PreparedPeak[] }
  | { render_style: 'solid_peaks'; peaks: PreparedPeak[]; color: string; order: number }
  | { render_style: 'gapped_peaks'; peaks: PreparedGappedPeak[]; color: string; order: number }
);

export type TrackDataForDisplay = {
  epigenome_ids: string[];
  tracks: PreparedTrack[];
};

export const prepareActivityDataForDisplay = (
  params: InputParams
): TrackDataForDisplay[] => {
  const preparedTracks = params.tracks.map((track) =>
    prepareSingleTrackData({
      metadata: params.trackMetadata,
      track,
      location: params.location,
      scale: params.scale
    })
  );

  return preparedTracks;
};

const prepareSingleTrackData = (params: {
  metadata: TrackMetadata;
  track: TrackData;
  location: InputParams['location'];
  scale: InputParams['scale'];
}): TrackDataForDisplay => {
  const orderedMetadata = Object.entries(params.metadata)
    .sort(([, a], [, b]) => a.track_index - b.track_index);
  const peakTypes = orderedMetadata
    .filter(([, metadata]) => metadata.render_style !== 'signal_with_peak_outlines')
    .map(([type]) => type);
  const tracks: PreparedTrack[] = [];

  for (const [trackType, metadata] of orderedMetadata) {
    const track = params.track.tracks.find(item => item.track_type === trackType);
    if (!track) continue;

    const base = {
      track_type: trackType,
      label: metadata.label,
      source_epigenome_ids: track.data.source_epigenome_ids
    };
    const input = { track, location: params.location, scale: params.scale };
    switch (metadata.render_style) {
      case 'signal_with_peak_outlines':
        tracks.push({
          ...base,
          render_style: metadata.render_style,
          signals: prepareSignals(input),
          peaks: prepareNarrowPeaks(input)
        });
        break;
      case 'solid_peaks':
        tracks.push({
          ...base,
          render_style: metadata.render_style,
          order: peakTypes.indexOf(trackType),
          color: metadata.legend_items.find(item => item.data_type === 'narrow_peaks')?.fill_color ?? 'currentColor',
          peaks: prepareNarrowPeaks(input)
        });
        break;
      case 'gapped_peaks':
        tracks.push({
          ...base,
          render_style: metadata.render_style,
          order: peakTypes.indexOf(trackType),
          color: metadata.legend_items.find(item => item.data_type === 'gapped_peaks')?.fill_color ?? 'currentColor',
          peaks: prepareGappedPeaks({ ...input, metadata })
        });
        break;
    }
  }

  return { epigenome_ids: params.track.epigenome_ids, tracks };
};

const prepareSignals = ({
  track,
  location,
  scale
}: {
  track: ActivityTrack;
  location: InputParams['location'];
  scale: InputParams['scale'];
}) => {
  const signals = track.data.signal ?? [];
  const result: PreparedSignal[] = [];

  for (const signal of signals) {
    // exclude the signals that are outside of the viewport
    if (signal.end < location.start || signal.start > location.end) {
      continue;
    }

    const signalStart = Math.max(location.start, signal.start);
    const signalEnd = Math.min(location.end, signal.end);
    const signalValue = signal.value;

    const signalX = scale(toZeroBased(signalStart));
    const signalWidth = scale(signalEnd) - signalX;

    result.push({
      x: signalX,
      width: signalWidth,
      value: signalValue
    });
  }

  return result;
};

const prepareNarrowPeaks = ({
  track,
  location,
  scale
}: {
  track: ActivityTrack;
  location: InputParams['location'];
  scale: InputParams['scale'];
}) => {
  const peaks = track.data.narrow_peaks ?? [];

  const result: PreparedPeak[] = [];

  for (const peak of peaks) {
    // exclude the data that is outside of the viewport
    if (peak.end < location.start || peak.start > location.end) {
      continue;
    }

    const peakStart = Math.max(location.start, peak.start);
    const peakEnd = Math.min(location.end, peak.end);

    const peakX = scale(toZeroBased(peakStart));
    const peakWidth = scale(peakEnd) - peakX;

    if (!peakWidth) {
      continue;
    }

    const trackPeakData = {
      x: peakX,
      width: peakWidth
    };

    result.push(trackPeakData);
  }

  return result;
};

const prepareGappedPeaks = ({
  metadata,
  track,
  location,
  scale
}: {
  metadata: ActivityTrackMetadata;
  track: ActivityTrack;
  location: InputParams['location'];
  scale: InputParams['scale'];
}) => {
  const result: PreparedGappedPeak[] = [];

  for (const peak of track.data.gapped_peaks ?? []) {
    // exclude the data that is outside of the viewport
    if (
      peak.end < location.start ||
      peak.start > location.end
    ) {
      continue;
    }

    const blocks: PreparedGappedPeak['blocks'] = [];
    const connectors: PreparedGappedPeak['connectors'] = [];

    for (let i = 0; i < peak.block_starts.length; i++) {
      const blockRelativeStart = peak.block_starts[i];
      const blockStart = Math.max(
        peak.start + blockRelativeStart,
        location.start
      );
      const blockSize = peak.block_sizes[i];
      const blockEnd = Math.min(
        peak.start + blockRelativeStart + blockSize - 1,
        location.end
      );

      // exclude the data that is outside of the viewport
      if (blockStart > location.end || blockEnd < location.start) {
        continue;
      }

      const blockX = scale(toZeroBased(blockStart));
      const blockWidth = scale(blockEnd) - blockX;

      if (!blockWidth) {
        continue;
      }

      const block = {
        x: blockX,
        width: blockWidth
      };

      const previousBlock = blocks.at(-1);
      if (previousBlock) {
        const previousBlockEnd = previousBlock.x + previousBlock.width;
        const connector = {
          x: previousBlockEnd,
          width: block.x - previousBlockEnd
        };
        if (connector.width) {
          connectors.push(connector);
        }
      }

      blocks.push(block);
    }

    // if no blocks were added to the blocks array in the for-loop above,
    // because their width approximates 0, add a single 1px block at the start of the peak
    if (blocks.length === 0) {
      const block = {
        x: scale(toZeroBased(peak.start)),
        width: 1
      };
      blocks.push(block);
    }

    // Due to conversion from genomic coordinates to image coordinates,
    // it is possible for some of the blocks or connectors to have identical x and width.
    // Such identical blocks and connectors are filtered out below.
    const filteredBlocks = blocks
      .toSorted((block1, block2) => {
        if (block1.x === block2.x) {
          return block1.width - block2.width;
        } else {
          return block1.x - block2.x;
        }
      })
      .filter((block, index, arr) => {
        if (index < arr.length - 1) {
          const nextBlock = arr[index + 1];
          if (block.x === nextBlock.x && block.width === nextBlock.width) {
            return false;
          }
        }
        return true;
      });

    const filteredConnectors = connectors
      .toSorted((c1, c2) => {
        if (c1.x === c2.x) {
          return c1.width - c2.width;
        } else {
          return c1.x - c2.x;
        }
      })
      .filter((connector, index, arr) => {
        if (index < arr.length - 1) {
          const nextConnector = arr[index + 1];
          if (
            connector.x === nextConnector.x &&
            connector.width === nextConnector.width
          ) {
            return false;
          }
        }
        return true;
      });

    const peakLabel = metadata.label;
    const peakId = `gapped-peak-${peakLabel}-${blocks.map((block) => `${block.x}-${block.width}`)}`;

    const trackPeakData = {
      id: peakId,
      blocks: filteredBlocks,
      connectors: filteredConnectors,
    } as const;

    result.push(trackPeakData);
  }

  const cleanedUpPeaks: typeof result = [];
  const seenGappedPeakIds = new Set<string>();

  for (const peak of result) {
    if (seenGappedPeakIds.has(peak.id)) {
      continue;
    }
    seenGappedPeakIds.add(peak.id);
    cleanedUpPeaks.push(peak);
  }

  return cleanedUpPeaks;
};
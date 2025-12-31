import { svg } from 'lit';
import { repeat } from 'lit/directives/repeat.js';
import { scaleLinear, interpolateHcl } from 'd3';

import {
  OPEN_CHROMATIN_SIGNAL_HEIGHT,
  OPEN_CHROMATIN_SIGNAL_OFFSET_TOP,
  OPEN_CHROMATIN_PEAK_OFFSET_TOP,
  OPEN_CHROMATIN_PEAK_HEIGHT,
  HISTONE_NARROW_PEAK_OFFSET_TOP,
  HISTONE_NARROW_PEAK_HEIGHT,
  HISTONE_GAPPED_PEAK_OFFSET_TOP,
  HISTONE_GAPPED_PEAK_BLOCK_HEIGHT,
  HISTONE_GAPPED_PEAK_CONNECTOR_HEIGHT
} from './constants';

import type { TrackDataForDisplay } from './prepare-data';

export const renderOpenChromatinSignals = ({
  trackData,
  offsetTop
}: {
  trackData: TrackDataForDisplay;
  offsetTop: number;
}) => {
  return trackData.openChromatin.signals.map((signal) => {
    return svg`
      <rect
        x=${signal.x}
        y=${offsetTop + OPEN_CHROMATIN_SIGNAL_OFFSET_TOP}
        width=${signal.width}
        height=${OPEN_CHROMATIN_SIGNAL_HEIGHT}
        fill=${getSignalColor(signal.value)}
      />
    `;
  });
};

export const renderOpenChromatinPeaks = ({
  trackData,
  offsetTop
}: {
  trackData: TrackDataForDisplay;
  offsetTop: number;
}) => {
  return trackData.openChromatin.peaks.map(peak => {
    return svg`
      <rect
        x=${peak.x}
        y=${offsetTop + OPEN_CHROMATIN_PEAK_OFFSET_TOP}
        width=${peak.width}
        height=${OPEN_CHROMATIN_PEAK_HEIGHT}
        data-type="open-chromatin-peak"
        stroke="black"
        fill="none"
      />
    `;
  });
};

export const renderHistoneNarrowPeaks = ({
  trackData,
  offsetTop
}: {
  trackData: TrackDataForDisplay;
  offsetTop: number;
}) => {
  return trackData.histones.narrowPeaks.map(peak => {
    const order = peak.order;
    const trackOffsetTop = offsetTop;
    const peakOffsetTop =
      trackOffsetTop +
      OPEN_CHROMATIN_PEAK_HEIGHT +
      HISTONE_NARROW_PEAK_OFFSET_TOP +
      order * (HISTONE_NARROW_PEAK_HEIGHT + HISTONE_NARROW_PEAK_OFFSET_TOP);

    return svg`
      <rect
        x=${peak.x}
        y=${peakOffsetTop}
        width=${peak.width}
        height=${HISTONE_NARROW_PEAK_HEIGHT}
        data-type="histone-narrow-peak"
        data-order=${order}
        data-track-offset-top=${trackOffsetTop}
        fill=${peak.color}
      />
    `;
  });
};

export const renderHistoneGappedPeaks = ({
  trackData,
  offsetTop: trackOffsetTop
}: {
  trackData: TrackDataForDisplay;
  offsetTop: number;
}) => {
  // calculate the additional distance from the top based on how many narrow peaks have been rendered
  const narrowPeakTracksCount = trackData.histones.narrowPeaks.reduce((acc, peak) => {
    return Math.max(acc, peak.order);
  }, 0);

  return trackData.histones.gappedPeaks.map(peak => {
    const offsetTop =
      trackOffsetTop +
      OPEN_CHROMATIN_PEAK_HEIGHT +
      HISTONE_NARROW_PEAK_OFFSET_TOP +
      narrowPeakTracksCount * (HISTONE_NARROW_PEAK_HEIGHT + HISTONE_NARROW_PEAK_OFFSET_TOP) +
      HISTONE_GAPPED_PEAK_OFFSET_TOP +
      peak.order * (HISTONE_GAPPED_PEAK_BLOCK_HEIGHT + HISTONE_GAPPED_PEAK_OFFSET_TOP);
    
    const connectorOffsetTop = offsetTop + HISTONE_GAPPED_PEAK_BLOCK_HEIGHT / 2;

    const blocks = peak.blocks.map((block) => {
      return svg`
        <rect
          x=${block.x}
          y=${offsetTop}
          width=${block.width}
          height=${HISTONE_GAPPED_PEAK_BLOCK_HEIGHT}
          data-type="histone-gapped-peak-block"
          fill=${peak.color}
        />      
      `;
    });

    const connectors = peak.connectors.map((connector) => {
      return svg `
        <line
          x1=${connector.x}
          x2=${connector.x + connector.width}
          y1=${connectorOffsetTop}
          y2=${connectorOffsetTop}
          strokeWidth=${HISTONE_GAPPED_PEAK_CONNECTOR_HEIGHT}
          stroke=${peak.color}
          strokeDasharray="1"
        /> 
      `;
    });

    return [blocks, connectors];
  });
};

const signalColorScale = scaleLinear<string>()
  .domain([1, 9])
  .range(['#f1f1f1', '#474747'])
  .interpolate(interpolateHcl);

const getSignalColor = (value: number) => {
  return signalColorScale(value);
};
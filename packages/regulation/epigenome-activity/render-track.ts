import { svg } from 'lit';
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
  HISTONE_GAPPED_PEAK_CONNECTOR_HEIGHT,
  COLORS,
  type Colors
} from './constants';

import type { TrackDataForDisplay } from './prepare-data';

type PathResult = ReturnType<typeof svg>;

export const renderOpenChromatinSignals = ({
  trackData,
  offsetTop,
  colors
}: {
  trackData: TrackDataForDisplay;
  offsetTop: number;
  colors: Partial<Colors> | null;
}): PathResult[] => {
  const colorFrom = colors?.openChromatinLow ?? COLORS.openChromatinLow;
  const colorTo = colors?.openChromatinHigh ?? COLORS.openChromatinHigh;
  const colorScale = createSignalColorScale({
    colorFrom,
    colorTo
  });

  const pathsByValue = new Map<number, string[]>();
  for (const signal of trackData.openChromatin.signals) {
    const currentPaths = pathsByValue.get(signal.value) ?? [];
    currentPaths.push(
      rectToPath({
        x: signal.x,
        y: offsetTop + OPEN_CHROMATIN_SIGNAL_OFFSET_TOP,
        width: signal.width,
        height: OPEN_CHROMATIN_SIGNAL_HEIGHT
      })
    );
    pathsByValue.set(signal.value, currentPaths);
  }

  return [...pathsByValue.entries()].map(([value, paths]) => {
      return svg`
        <path
          d=${paths.join(' ')}
          fill=${colorScale(value)}
          data-type="open-chromatin-signal"
          data-value=${value}
        />
      `;
    });
};

export const renderOpenChromatinPeaks = ({
  trackData,
  offsetTop,
  colors
}: {
  trackData: TrackDataForDisplay;
  offsetTop: number;
  colors: Partial<Colors> | null;
}): PathResult[] => {
  const strokeColor = colors?.openChromatinPeak ?? COLORS.openChromatinPeak;
  const paths = trackData.openChromatin.peaks.map(peak =>
    rectToPath({
      x: peak.x,
      y: offsetTop + OPEN_CHROMATIN_PEAK_OFFSET_TOP,
      width: peak.width,
      height: OPEN_CHROMATIN_PEAK_HEIGHT
    })
  );

  if (paths.length === 0) {
    return [];
  }

  return [
    svg`
      <path
        d=${paths.join(' ')}
        stroke=${strokeColor}
        fill="none"
        data-type="open-chromatin-peak"
      />
    `
  ];
};

export const renderHistoneNarrowPeaks = ({
  trackData,
  offsetTop
}: {
  trackData: TrackDataForDisplay;
  offsetTop: number;
}): PathResult[] => {
  const pathsByColor = new Map<string, string[]>();

  for (const peak of trackData.histones.narrowPeaks) {
    const peakOffsetTop =
      offsetTop +
      OPEN_CHROMATIN_PEAK_HEIGHT +
      HISTONE_NARROW_PEAK_OFFSET_TOP +
      peak.order * (HISTONE_NARROW_PEAK_HEIGHT + HISTONE_NARROW_PEAK_OFFSET_TOP);

    const currentPaths = pathsByColor.get(peak.color) ?? [];
    currentPaths.push(
      rectToPath({
        x: peak.x,
        y: peakOffsetTop,
        width: peak.width,
        height: HISTONE_NARROW_PEAK_HEIGHT
      })
    );
    pathsByColor.set(peak.color, currentPaths);
  }

  return [...pathsByColor.entries()].map(([color, paths]) => {
    return svg`
      <path
        d=${paths.join(' ')}
        fill=${color}
        data-type="histone-narrow-peak"
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
}): PathResult[] => {
  // calculate the additional distance from the top based on how many narrow peaks have been rendered
  const narrowPeakTracksCount = trackData.histones.narrowPeaks.reduce((acc, peak) => {
    return Math.max(acc, peak.order);
  }, 0);

  const blocksByColor = new Map<string, string[]>();
  const connectorsByColor = new Map<string, string[]>();

  for (const peak of trackData.histones.gappedPeaks) {
    const offsetTop =
      trackOffsetTop +
      OPEN_CHROMATIN_PEAK_HEIGHT +
      HISTONE_NARROW_PEAK_OFFSET_TOP +
      narrowPeakTracksCount * (HISTONE_NARROW_PEAK_HEIGHT + HISTONE_NARROW_PEAK_OFFSET_TOP) +
      HISTONE_GAPPED_PEAK_OFFSET_TOP +
      peak.order * (HISTONE_GAPPED_PEAK_BLOCK_HEIGHT + HISTONE_GAPPED_PEAK_OFFSET_TOP);

    const connectorOffsetTop = offsetTop + HISTONE_GAPPED_PEAK_BLOCK_HEIGHT / 2;

    const blockPaths = blocksByColor.get(peak.color) ?? [];
    for (const block of peak.blocks) {
      blockPaths.push(
        rectToPath({
          x: block.x,
          y: offsetTop,
          width: block.width,
          height: HISTONE_GAPPED_PEAK_BLOCK_HEIGHT
        })
      );
    }
    blocksByColor.set(peak.color, blockPaths);

    const connectorPaths = connectorsByColor.get(peak.color) ?? [];
    for (const connector of peak.connectors) {
      connectorPaths.push(
        lineToPath({
          x1: connector.x,
          x2: connector.x + connector.width,
          y: connectorOffsetTop
        })
      );
    }
    connectorsByColor.set(peak.color, connectorPaths);
  }

  return [
    ...[...blocksByColor.entries()].map(([color, paths]) => {
      return svg`
        <path
          d=${paths.join(' ')}
          fill=${color}
          data-type="histone-gapped-peak-block"
        />
      `;
    }),
    ...[...connectorsByColor.entries()].map(([color, paths]) => {
      return svg`
        <path
          d=${paths.join(' ')}
          stroke-width=${HISTONE_GAPPED_PEAK_CONNECTOR_HEIGHT}
          stroke=${color}
          stroke-dasharray="1"
          fill="none"
          data-type="histone-gapped-peak-connector"
        />
      `;
    })
  ];
};

const rectToPath = ({
  x,
  y,
  width,
  height
}: {
  x: number;
  y: number;
  width: number;
  height: number;
}) => {
  return `M ${x} ${y} h ${width} v ${height} h ${-width} Z`;
};

const lineToPath = ({
  x1,
  x2,
  y
}: {
  x1: number;
  x2: number;
  y: number;
}) => {
  return `M ${x1} ${y} H ${x2}`;
};

const createSignalColorScale = ({
  colorFrom,
  colorTo
}: {
  colorFrom: string;
  colorTo: string;
}) => {
  return scaleLinear<string>()
    .domain([1, 9])
    .range([colorFrom, colorTo])
    .interpolate(interpolateHcl);
};

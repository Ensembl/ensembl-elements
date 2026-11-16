import { svg } from 'lit';
import { scaleLinear, interpolateHcl } from 'd3';

import {
  OPEN_CHROMATIN_SIGNAL_HEIGHT,
  OPEN_CHROMATIN_SIGNAL_OFFSET_TOP,
  OPEN_CHROMATIN_PEAK_OFFSET_TOP,
  OPEN_CHROMATIN_PEAK_HEIGHT,
  NARROW_PEAK_HEIGHT,
  GAPPED_PEAK_BLOCK_HEIGHT,
  GAPPED_PEAK_CONNECTOR_HEIGHT,
  COLORS,
  type Colors
} from './constants';

import type { PreparedTrack } from './prepare-data';

type PathResult = ReturnType<typeof svg>;

export const renderTrack = ({ trackData, offsetTop, colors }: {
  trackData: PreparedTrack;
  offsetTop: number;
  colors: Partial<Colors> | null;
}): PathResult[] => {
  switch (trackData.render_style) {
    case 'signal_with_peak_outlines':
      return [
        ...renderSignals({ trackData, offsetTop, colors }),
        ...renderPeakOutlines({ trackData, offsetTop, colors })
      ];
    case 'solid_peaks':
      return renderNarrowPeaks({ trackData, offsetTop });
    case 'gapped_peaks':
      return renderGappedPeaks({ trackData, offsetTop });
  }
};

export const renderSignals = ({
  trackData,
  offsetTop,
  colors
}: {
  trackData: Extract<PreparedTrack, { render_style: 'signal_with_peak_outlines' }>;
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
  for (const signal of trackData.signals) {
    const currentPaths = pathsByValue.get(signal.value) ?? [];
    currentPaths.push(
      rectToPath({
        x: signal.x,
        y: offsetTop + trackData.offsetTop + OPEN_CHROMATIN_SIGNAL_OFFSET_TOP,
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

export const renderPeakOutlines = ({
  trackData,
  offsetTop,
  colors
}: {
  trackData: Extract<PreparedTrack, { render_style: 'signal_with_peak_outlines' }>;
  offsetTop: number;
  colors: Partial<Colors> | null;
}): PathResult[] => {
  const strokeColor = colors?.openChromatinPeak ?? COLORS.openChromatinPeak;
  const paths = trackData.peaks.map(peak =>
    rectToPath({
      x: peak.x,
      y: offsetTop + trackData.offsetTop + OPEN_CHROMATIN_PEAK_OFFSET_TOP,
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

export const renderNarrowPeaks = ({
  trackData,
  offsetTop
}: {
  trackData: Extract<PreparedTrack, { render_style: 'solid_peaks' }>;
  offsetTop: number;
}): PathResult[] => {
  const pathsByColor = new Map<string, string[]>();

  for (const peak of trackData.peaks) {
    const peakOffsetTop = offsetTop + trackData.offsetTop;

    const currentPaths = pathsByColor.get(trackData.color) ?? [];
    currentPaths.push(
      rectToPath({
        x: peak.x,
        y: peakOffsetTop,
        width: peak.width,
        height: NARROW_PEAK_HEIGHT
      })
    );
    pathsByColor.set(trackData.color, currentPaths);
  }

  return [...pathsByColor.entries()].map(([color, paths]) => {
    return svg`
      <path
        d=${paths.join(' ')}
        fill=${color}
        data-type="narrow-peak"
      />
    `;
  });
};

export const renderGappedPeaks = ({
  trackData,
  offsetTop: trackOffsetTop
}: {
  trackData: Extract<PreparedTrack, { render_style: 'gapped_peaks' }>;
  offsetTop: number;
}): PathResult[] => {
  const blocksByColor = new Map<string, string[]>();
  const connectorsByColor = new Map<string, string[]>();

  for (const peak of trackData.peaks) {
    const offsetTop = trackOffsetTop + trackData.offsetTop;

    const connectorOffsetTop = offsetTop + GAPPED_PEAK_BLOCK_HEIGHT / 2;

    const blockPaths = blocksByColor.get(trackData.color) ?? [];
    for (const block of peak.blocks) {
      blockPaths.push(
        rectToPath({
          x: block.x,
          y: offsetTop,
          width: block.width,
          height: GAPPED_PEAK_BLOCK_HEIGHT
        })
      );
    }
    blocksByColor.set(trackData.color, blockPaths);

    const connectorPaths = connectorsByColor.get(trackData.color) ?? [];
    for (const connector of peak.connectors) {
      connectorPaths.push(
        lineToPath({
          x1: connector.x,
          x2: connector.x + connector.width,
          y: connectorOffsetTop
        })
      );
    }
    connectorsByColor.set(trackData.color, connectorPaths);
  }

  return [
    ...[...blocksByColor.entries()].map(([color, paths]) => {
      return svg`
        <path
          d=${paths.join(' ')}
          fill=${color}
          data-type="gapped-peak-block"
        />
      `;
    }),
    ...[...connectorsByColor.entries()].map(([color, paths]) => {
      return svg`
        <path
          d=${paths.join(' ')}
          stroke-width=${GAPPED_PEAK_CONNECTOR_HEIGHT}
          stroke=${color}
          stroke-dasharray="1"
          fill="none"
          data-type="gapped-peak-connector"
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

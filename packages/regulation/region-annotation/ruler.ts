import { svg } from 'lit';
import type { ScaleLinear } from 'd3';

import { RULER_HEIGHT } from './constants';

export const renderRuler = ({
  scale,
  offsetTop
}: {
  scale: ScaleLinear<number, number>;
  offsetTop: number;
}) => {
  const ticksCount = 5; // this could potentially be dynamically changed based on viewport width 
  const prettyTicks = scale.ticks(ticksCount);
  const numberFormatter = new Intl.NumberFormat("en-GB");

  const tickElements = prettyTicks.map(tick => renderLabelledTick({
    coord: tick,
    scale,
    offsetTop,
    numberFormatter
  }));

  const width = scale.range()[1];

  return svg`
    <g
      style="font-weight: 300; font-family: 'IBM Plex Mono', 'Liberation Mono', Courier, monospace"
    >
      ${tickElements}
      <rect
        width=${width}
        height=${RULER_HEIGHT}
        y=${offsetTop}
        fill="transparent"
        data-type="ruler"
        data-selector-trigger="true"
      />
    </g>
  `;
}

const renderLabelledTick = ({
  coord,
  scale,
  offsetTop,
  numberFormatter
}: {
  coord: number
  scale: ScaleLinear<number, number>;
  offsetTop: number;
  numberFormatter: Intl.NumberFormat;
}) => {
  const x = scale(coord);
  const y1 = offsetTop;
  const y2 = y1 + RULER_HEIGHT;
  const tickThickness = 2;

  const labelX = x + tickThickness + 1;
  const labelY = y2 - 3;

  const tickColor = '#d4d9de';
  const textColor = 'black';
  const label = numberFormatter.format(coord);

  return svg`
    <line
      x1=${x}
      x2=${x}
      y1=${y1}
      y2=${y2}
      stroke-width=${tickThickness}
      stroke=${tickColor}
    />
    <text
      x=${labelX}
      y=${labelY}
      fill=${textColor}
      font-size="10"
      style="user-select: none;"
    >${label}</text>
  `;
};

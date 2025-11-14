import { svg } from 'lit';
import type { ScaleLinear } from 'd3';

import { RULER_HEIGHT } from '../constants/constants';

const formatter = new Intl.NumberFormat('en-US');

export const renderRuler = ({
  scale,
  offsetTop
}: {
  scale: ScaleLinear<number, number>;
  offsetTop: number;
}) => {
  const ticksCount = 5; // this could potentially be dynamically changed based on viewport width 
  const prettyTicks = scale.ticks(ticksCount);

  const tickElements = prettyTicks.map(tick => renderLabelledTick({
    coord: tick,
    scale,
    offsetTop
  }));

  return svg`
    <g>
      ${tickElements}
    </g>
  `;
}

const renderLabelledTick = ({
  coord,
  scale,
  offsetTop
}: {
  coord: number
  scale: ScaleLinear<number, number>;
  offsetTop: number;
}) => {
  const x = scale(coord);
  const y1 = offsetTop;
  const y2 = y1 + RULER_HEIGHT;
  const tickThickness = 1;

  const labelX = x + tickThickness + 1;
  const labelY = y2 - 3;

  const tickColor = '#d4d9de';
  const textColor = '#333';

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
      font-size=${RULER_HEIGHT - 3}
      font-family="'IBM Plex Mono', sans-serif"
      font-weight="300"
    >${formatter.format(coord)}</text>
  `;
};
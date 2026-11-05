import { svg } from 'lit';
import type { ScaleLinear } from 'd3';

import { RULER_HEIGHT, type Colors } from './constants';

export const renderRuler = ({
  scale,
  offsetTop,
  colors,
  rootElement
}: {
  scale: ScaleLinear<number, number>;
  offsetTop: number;
  colors: Colors;
  rootElement: HTMLElement;
}) => {
  const width = scale.range()[1];
  const numberFormatter = new Intl.NumberFormat("en-GB");
  const prettyTicks = getTicks({
    scale,
    numberFormatter,
    rootElement
  });

  const tickElements = prettyTicks.map(tick => renderLabelledTick({
    coord: tick,
    scale,
    offsetTop,
    numberFormatter,
    colors
  }));

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

const getTicks = ({
  scale,
  numberFormatter,
  rootElement
}: {
  scale: ScaleLinear<number, number>;
  rootElement: HTMLElement;
  numberFormatter: Intl.NumberFormat;
}) => {
  const width = scale.range()[1];
  const textMeasuringCanvas = document.createElement('canvas');
  const canvasContext = textMeasuringCanvas.getContext('2d') as CanvasRenderingContext2D;
  const styles = window.getComputedStyle(rootElement);

  const fontSize = styles.fontSize;

  canvasContext.font = `${fontSize} "IBM Plex Mono"`;

  // variable names minTicksCount and maxTicksCount below are a convenient lie;
  // in fact, d3 will generate uniformly-spaced ticks in the number *approximately equal* to the count
  const minTicksCount = 1;
  const maxTicksCount = 5;
  const minimumLabelGap = 20;

  let prettyTicks: number[] = [];

  for (let ticksCount = maxTicksCount; ticksCount >= minTicksCount; ticksCount--) {
    prettyTicks = scale.ticks(ticksCount);
    const allTickLabelsString = prettyTicks.reduce((acc, tick) => {
      const label = numberFormatter.format(tick);
      return acc + label;
    }, '');
    const tickLabelsWidth = canvasContext.measureText(allTickLabelsString).width;
    const combinedLabelsGapWidth = minimumLabelGap * (ticksCount - 1);
    if (width >= tickLabelsWidth + combinedLabelsGapWidth) {
      return prettyTicks;
    }
  }

  return prettyTicks;
};

const renderLabelledTick = ({
  coord,
  scale,
  offsetTop,
  numberFormatter,
  colors
}: {
  coord: number
  scale: ScaleLinear<number, number>;
  offsetTop: number;
  numberFormatter: Intl.NumberFormat;
  colors: Colors;
}) => {
  const x = scale(coord);
  const y1 = offsetTop;
  const y2 = y1 + RULER_HEIGHT;
  const tickThickness = 2;

  const labelX = x + tickThickness + 1;
  const labelY = y2 - 3;

  const tickColor = colors.rulerTick;
  const textColor = colors.rulerLabel;
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

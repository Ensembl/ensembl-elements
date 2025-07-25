import { html, css, LitElement } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { scaleLinear, type ScaleLinear } from 'd3';

import ViewportController from './viewportController';
import paintCanvas from './painter/painter';

import type { GeneInRegionOverview, RegulatoryFeature, RegulatoryFeatureMetadata } from '../../shared/types/regionOverview';

export type RegionOverviewData = {
  // start: number; // <-- genomic start
  // end: number; // <-- genomic end
  genes: GeneInRegionOverview[];
  regulatory_features: RegulatoryFeature[];
  regulatory_feature_types: Record<string, RegulatoryFeatureMetadata>;
};

@customElement('region-overview-canvas')
export class RegionOverviewCanvas extends LitElement {
  static styles = css`
    :host {
      display: block;
      height: 300px;
    }

    canvas {
      width: 100%;
      height: 100%;
      border: 1px dashed black;
    }
  `;

  // genomic start
  @property({ type: Number })
  start = 0;

  // genomic end
  @property({ type: Number })
  end = 0;

  @property({ type: Object })
  data: RegionOverviewData | null = null;

  @query('canvas')
  canvas: HTMLCanvasElement;

  scale: ScaleLinear<number, number> | null = null;

  firstUpdated(): void {
    const { width: canvasDomWidth, height: canvasDomHeight } = this.canvas.getBoundingClientRect();

    this.canvas.width = canvasDomWidth * devicePixelRatio;
    this.canvas.height = canvasDomHeight * devicePixelRatio;

    this.scale = scaleLinear().domain([
      this.start,
      this.end
    ]).rangeRound([
      0,
      this.canvas.width
    ]);

    new ViewportController(this);

    paintCanvas({
      canvas: this.canvas,
      data: this.data,
      scale: this.scale
    });
  }

  updated() {
    this.scale = scaleLinear().domain([
      this.start,
      this.end
    ]).rangeRound([
      0,
      this.canvas.width
    ]);

    paintCanvas({
      canvas: this.canvas,
      data: this.data,
      scale: this.scale
    });
  }

  render() {
    return html`
      <canvas></canvas>
    `;
  }
}

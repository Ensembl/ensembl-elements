import { html, css, LitElement, type PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { scaleLinear, type ScaleLinear } from 'd3';
import { yieldToMain } from '@ensembl/ensembl-elements-helpers';

import { prepareFeatureTracks, type FeatureTracks } from './prepareFeatureTracks';
import { getImageHeightAndTopOffsets } from './getImageHeight';
import { renderGeneTracks } from './geneTracks';
import { renderRegulatoryFeatureTracks } from './regulatoryFeatureTracks';

import draggableViewport from './draggableViewport';

import ViewportController from './viewportController';

import type { GeneInRegionOverview, RegulatoryFeature, RegulatoryFeatureMetadata } from '../types/regionOverview';
import type { InputData } from '../types/inputData';

export type RegionOverviewData = {
  // start: number; // <-- genomic start
  // end: number; // <-- genomic end
  genes: GeneInRegionOverview[];
  regulatory_features: RegulatoryFeature[];
  regulatory_feature_types: Record<string, RegulatoryFeatureMetadata>;
};

@customElement('ens-reg-region-overview')
export class RegionOverview extends LitElement {
  static styles = css`
    :host {
      display: block;
      border: 1px dotted black;
    }

    svg {
      width: 100%;
    }

    .interactive-area {
      cursor: pointer;
    }
  `;

  @property({ type: String })
  regionName: string = '';

  // genomic start
  @property({ type: Number })
  start = 0;

  // genomic end
  @property({ type: Number })
  end = 0;

  @property({ type: Number })
  regionLength = 0;

  @property({ type: Object })
  data: InputData | null = null;

  @state()
  featureTracks: FeatureTracks | null = null;

  @state()
  imageWidth = 0;

  scale: ScaleLinear<number, number> | null = null;

  constructor() {
    super();
    new ViewportController(this);
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.observeHostSize();
  }

  willUpdate(changedProperties: PropertyValues) {
    if (
      changedProperties.has('data') ||
      changedProperties.has('start') ||
      changedProperties.has('end')
    ) {
      if (!this.data || !this.start || !this.end) {
        return;
      }

      this.featureTracks = prepareFeatureTracks({
        data: this.data,
        start: this.start,
        end: this.end
      });

      this.scale = scaleLinear().domain([
        this.start,
        this.end
      ]).rangeRound([
        0,
        this.imageWidth
      ]);
    }

    if (changedProperties.has('imageWidth')) {
      this.scale = scaleLinear().domain([
        this.start,
        this.end
      ]).rangeRound([
        0,
        this.imageWidth
      ]);
    }
  }

  async scheduleUpdate(): Promise<void> {
    await yieldToMain();
    super.scheduleUpdate();
  }

  observeHostSize = () => {
    const resizeObserver = new ResizeObserver((entries) => {
      const [hostElementEntry] = entries;
      const { width: hostWidth } = hostElementEntry.contentRect;
      this.imageWidth = hostWidth;
    });

    resizeObserver.observe(this);
  }

  handleClick = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.dataset.feature) {
      e.stopPropagation();

      const payload = {
        x: e.clientX,
        y: e.clientY,
        featureType: target.dataset.featureType as string,
        data: JSON.parse(target.dataset.feature)
      };
      const event = new CustomEvent('ens-reg-feature-click', {
        detail: payload,
        bubbles: true,
        composed: true
      });

      this.dispatchEvent(event);
    }
  }

  render() {
    if (!this.imageWidth || !this.scale || !this.featureTracks) {
      return;
    }

    const {
      imageHeight,
      regulatoryFeatureTracksTopOffset
    } = getImageHeightAndTopOffsets(this.featureTracks);

    // - remember that we have two scales: one for immediate viewport; the other for three viewports
    // - draw gene tracks
    // - draw regulatory feature tracks
    // - draw container for translating image contents

    return html`
      <svg
        viewBox="0 0 ${this.imageWidth} ${imageHeight}"
        style="width: 100%; height: ${imageHeight}px;"
        @click=${this.handleClick}
      >
        <g>
          ${draggableViewport()}
          ${this.renderGeneTracks()}
          ${this.renderRegulatoryFeatureTracks({
            offsetTop: regulatoryFeatureTracksTopOffset
          })}
        </g>
      </svg>
      <slot name="tooltip"></slot>
    `;
  }

  renderGeneTracks() {
    if (!this.featureTracks || !this.scale) {
      return;
    }

    const { geneTracks } = this.featureTracks;
    return renderGeneTracks({
      scale: this.scale,
      tracks: geneTracks,
      start: this.start,
      regionName: this.regionName,
      end: this.end,
      width: this.imageWidth
    })
  }

  renderRegulatoryFeatureTracks({
    offsetTop
  }: {
    offsetTop: number;
  }) {
    if (!this.featureTracks || !this.data || !this.scale) {
      return;
    }

    const { regulatoryFeatureTracks } = this.featureTracks;
    return renderRegulatoryFeatureTracks({
      tracks: regulatoryFeatureTracks,
      featureTypes: this.data.regulatory_feature_types,
      scale: this.scale,
      offsetTop
    });
  }

}
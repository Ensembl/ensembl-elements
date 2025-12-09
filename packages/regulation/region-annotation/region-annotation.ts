import { html, css, LitElement, type PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { scaleLinear, type ScaleLinear } from 'd3';
import { yieldToMain } from '@ensembl/ensembl-elements-helpers';

import { prepareFeatureTracks, type FeatureTracks } from './prepareFeatureTracks';
import { getImageHeightAndTopOffsets } from './getImageHeight';
import { renderGeneTracks } from './geneTracks';
import { renderRegulatoryFeatureTracks } from './regulatoryFeatureTracks';
import { renderRuler } from './ruler';
import { areaSelection } from './selection/area-selection-directive';
import { unselectedBackgroundFilter } from './selection/unselected-background-directive';
import { COLORS, type Colors } from './constants';

import ViewportController from './viewportController';
import AreaSelectionController from './selection/area-selection-controller';

import type { GeneInRegionOverview, RegulatoryFeature, RegulatoryFeatureMetadata } from '../types/regionOverview';
import type { InputData } from '../types/inputData';

export type RegionOverviewData = {
  genes: GeneInRegionOverview[];
  regulatory_features: RegulatoryFeature[];
  regulatory_feature_types: Record<string, RegulatoryFeatureMetadata>;
};

type CalculatedTrackPositions = {
  genesForwardStrand: number[];
  genesReverseStrand: number[];
  genesStrandDivider: number;
  regulatoryFeatures: number[];
};

@customElement('ens-reg-region-overview')
export class RegionOverview extends LitElement {
  static styles = css`
    :host {
      display: block;
      border: 1px dotted black;
    }

    svg {
      display: block;
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

  @property({ type: Object })
  colors: Partial<Colors> | null = null;

  @property({ type: String })
  focusGeneId: string | null = null;

  @property({ type: String })
  focusRegulatoryFeatureId: string | null = null;

  @state()
  featureTracks: FeatureTracks | null = null;

  @state()
  imageWidth = 0;

  scale: ScaleLinear<number, number> | null = null;
  areaSelection: AreaSelectionController;

  #calculatedTrackPositions: CalculatedTrackPositions | null = null;

  constructor() {
    super();
    new ViewportController(this);
    this.areaSelection = new AreaSelectionController(this);
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

  #onTrackPositionsCalculated(positions: ReturnType<typeof getImageHeightAndTopOffsets>) {
    const newPositions = {
      genesForwardStrand: positions.forwardStrandGeneTrackOffsets,
      genesReverseStrand: positions.reverseStrandGeneTrackOffsets,
      genesStrandDivider: positions.strandDividerTopOffset,
      regulatoryFeatures: positions.regulatoryFeatureTrackOffsets
    }
    if (!this.#calculatedTrackPositions) {
      this.#calculatedTrackPositions = newPositions;
      this.#reportCalculatedTrackPositions();
    } else if (JSON.stringify(newPositions) !== JSON.stringify(this.#calculatedTrackPositions)) {
      this.#calculatedTrackPositions = newPositions;
      this.#reportCalculatedTrackPositions();
    }
  }

  #reportCalculatedTrackPositions() {
    const event = new CustomEvent('ens-reg-track-positions', {
      detail: this.#calculatedTrackPositions as CalculatedTrackPositions,
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(event);
  }

  #getColors() {
    return {
      ...COLORS,
      ...this.colors
    };
  }

  render() {
    if (!this.imageWidth || !this.scale || !this.featureTracks) {
      return;
    }

    const calculatedHeightsAndOffsets = getImageHeightAndTopOffsets(this.featureTracks);
    const {
      imageHeight,
      geneTracksTopOffset,
      bottomRulerTopOffset,
      regulatoryFeatureTracksTopOffset,
      strandDividerTopOffset
    } = calculatedHeightsAndOffsets;
    this.#onTrackPositionsCalculated(calculatedHeightsAndOffsets); // as a side effect, report calculated track positions
    const colors = this.#getColors();

    return html`
      <svg
        viewBox="0 0 ${this.imageWidth} ${imageHeight}"
        style="width: 100%; height: ${imageHeight}px;"
        @click=${this.handleClick}
      >
        ${unselectedBackgroundFilter()}
        <g filter="url(#unselected-background)">
          ${renderRuler({
            scale: this.scale,
            offsetTop: 0,
            colors
          })}
          ${this.renderGeneTracks({
            offsetTop: geneTracksTopOffset,
            strandDividerTopOffset,
            colors
          })}
          ${this.renderRegulatoryFeatureTracks({
            offsetTop: regulatoryFeatureTracksTopOffset
          })}
          ${renderRuler({
            scale: this.scale,
            offsetTop: bottomRulerTopOffset,
            colors
          })}
          ${areaSelection()}
        </g>
      </svg>
      <slot name="tooltip"></slot>
    `;
  }

  renderGeneTracks({
    offsetTop,
    strandDividerTopOffset,
    colors
  }: {
    offsetTop: number;
    strandDividerTopOffset: number;
    colors: Colors;
  }) {
    if (!this.featureTracks || !this.scale) {
      return;
    }

    const { geneTracks } = this.featureTracks;

    return renderGeneTracks({
      offsetTop,
      scale: this.scale,
      tracks: geneTracks,
      start: this.start,
      regionName: this.regionName,
      end: this.end,
      focusGeneId: this.focusGeneId,
      strandDividerTopOffset,
      width: this.imageWidth,
      colors
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
    const colors = this.#getColors();

    return renderRegulatoryFeatureTracks({
      tracks: regulatoryFeatureTracks,
      featureTypes: this.data.regulatory_feature_types,
      scale: this.scale,
      regionName: this.regionName,
      focusRegulatoryFeatureId: this.focusRegulatoryFeatureId,
      offsetTop
    });
  }

}


declare global {
  interface HTMLElementTagNameMap {
    'ens-reg-region-overview': RegionOverview;
  }
}
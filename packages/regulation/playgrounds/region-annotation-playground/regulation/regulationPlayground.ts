import { html, css, LitElement} from 'lit';
import { customElement, state, property } from 'lit/decorators.js';

// not using the RegionOverview class directly,
// but importing it so that the component gets initialized
import '@ensembl/ensembl-regulation/region-overview';
import '@ensembl/ensembl-elements-common/components/popup/popup.js';
import '@ensembl/ensembl-elements-common/components/text-button/text-button.ts';
import './zoomButtons';

import { pickData } from './services/filterData';
import chromosome1Data from './data/chr1-data.json';

import type { OverviewRegion, RegionOverview } from '@ensembl/ensembl-regulation/region-overview';
import type { FeatureClickPayload, GeneClickPayload, RegulatoryFeatureClickPayload } from '../../../types/featureClickEvent';

import '@ensembl/ensembl-elements-common/styles/fonts.css';

// length of chromosome 1
const CHROMOSOME_LENGTH = 248956422;

// A five-megabase viewport into chromosome 1
// const INITIAL_START = 60_000_000;
// const INITIAL_END = 65_000_000;
const INITIAL_START = 1_168_656;
const INITIAL_END = 1_262_112;

// A location on chromosome 1 that has two features (promoter and enhancer) next to one another
// Useful to make sure:
// - There is no empty space between the features when they are rendered
// - The extended start / extended end is taken into account when feature is rendered into view
// const INITIAL_START = 609382;
// const INITIAL_END = 609403;


@customElement('regulation-playground')
export class RegulationPlayground extends LitElement {
  static styles = css`
    .grid {
      display: grid;
      grid-template-columns: [left] 150px [middle] 1fr [right] 150px;
      margin-top: 2em;
    }

    ens-reg-region-annotation {
      grid-column: middle;
    }

    ens-reg-zoom-buttons {
      align-self: start;
    }
  `;

  @state()
  start = INITIAL_START;

  @state()
  end = INITIAL_END;

  @state()
  focusRegulatoryFeatureIds: string[] = [];

  @state()
  clickedFeatureData: FeatureClickPayload | null = null;

  #onViewportChange = (event: CustomEvent) => {
    const { start, end } = event.detail;
    this.start = start;
    this.end = end;
  }

  #onTrackPositionsChange = (event: CustomEvent) => {
    console.log('track positions:', event.detail);
  }

  #onFeatureClick = (event: Event) => {
    const payload = (event as CustomEvent<FeatureClickPayload>).detail;
    this.clickedFeatureData = payload;
  }

  #onFeatureFocus(event: CustomEvent<FeatureClickPayload>) {
    const payload = event.detail;
    if (payload.featureType === 'regulatory-feature') {
      const featureIdsSet = new Set(this.focusRegulatoryFeatureIds);
      const featureId = payload.data.id;
      if (featureIdsSet.has(featureId)) {
        featureIdsSet.delete(featureId);
        this.focusRegulatoryFeatureIds = [...featureIdsSet];
      } else {
        this.focusRegulatoryFeatureIds = [...featureIdsSet, featureId];
      }
    }
    this.clickedFeatureData = null;
  }

  #renderTooltip = (payload: FeatureClickPayload) => {
    const { x: clientX, y: clientY } = payload;

    // TODO: there should be a helper function for creating a virtual element from mouse click coords
    const virtualEl = {
      getBoundingClientRect() {
        return {
          width: 0,
          height: 0,
          x: clientX,
          y: clientY,
          top: clientY,
          left: clientX,
          right: clientX,
          bottom: clientY
        };
      },
    };

    return html`
      <ens-popup
        @ens-popup-click-outside=${() => this.clickedFeatureData = null}
        .anchor=${virtualEl}
      >
        <ens-reg-region-overview-popup-content
          @feature-focus=${this.#onFeatureFocus}
          .data=${payload}
        ></ens-reg-region-overview-popup-content>
      </ens-popup>
    `;
  }

  render() {
    const data = pickData({
      data: chromosome1Data as OverviewRegion,
      start: this.start,
      end: this.end
    });
    const tooltipData = this.clickedFeatureData;

    return html`
      <h1>This should test region overview rendering using svg</h1>
      <div class="grid">
        <div>
          ${this.start}-${this.end}
        </div>
        <div>
          <ens-reg-region-annotation
            @viewport-change=${this.#onViewportChange}
            @ens-reg-track-positions=${this.#onTrackPositionsChange}
            @ens-reg-feature-click=${this.#onFeatureClick}
            .start=${this.start}
            .end=${this.end}
            .regionName=${"1"}
            .focusRegulatoryFeatureIds=${this.focusRegulatoryFeatureIds}
            .regionLength=${CHROMOSOME_LENGTH}
            .data=${data}>
          </ens-reg-region-annotation>
          ${ tooltipData && this.#renderTooltip(tooltipData) }
        </div>
        <ens-reg-zoom-buttons
          .start=${this.start}
          .end=${this.end}
          .regionLength=${CHROMOSOME_LENGTH}
          @viewport-change=${this.#onViewportChange}
        ></ens-reg-zoom-buttons>
      </div>
    `;
  }
}


@customElement('ens-reg-region-overview-popup-content')
export class RegionOverviewPopupContent extends LitElement {

  static styles = css`
    .light {
      font-weight: var(--font-weight-light);
    }

    .row span + span {
      margin-left: 1ch;
    }

    .row .extra-margin-left {
      margin-left: 2.5ch;
    }

    button {

    }
  `

  @property({ type: Object })
  data: FeatureClickPayload | null = null

  #onFeatureFocusClick() {
    const event = new CustomEvent<FeatureClickPayload>('feature-focus', { detail: this.data as FeatureClickPayload });
    this.dispatchEvent(event);
  }

  render() {
    if (!this.data) {
      return null;
    }

    return this.#prepareTooltipContent();
  }

  #renderNoInfo() {
    return html`
      <p>No information about this feature</p>
    `;
  }

  #prepareTooltipContent = () => {
    if (this.data?.featureType === 'gene') {
      return this.#prepareGeneContent(this.data.data);
    } else if (this.data?.featureType === 'regulatory-feature') {
      return this.#prepareRegFeatureContent(this.data.data);
    }

    return this.#renderNoInfo();
  }

  #prepareGeneContent = (gene: GeneClickPayload['data']) => {
    const geneSymbolAndId = gene.symbol ? html`
      <span>${gene.symbol}</span>
      <span>${gene.stableId}</span>
    ` :
    html`
      <span>${gene.stableId}</span>
    `;

    return html`
      <div class="row">
        <span class="light">Gene </span>
        <span>${geneSymbolAndId}</span>
      </div>
      <div class="row">
        <span class="light">Biotype </span>
        <span>${gene.biotype}</span>
      </div>
      <div class="row">
        <span>${gene.strand} strand</span>
        <span class="extra-margin-left">${gene.regionName}:${gene.start}-${gene.end}</span>
      </div>
    `;
  }

  #prepareRegFeatureContent = (feature: RegulatoryFeatureClickPayload['data']) => {
    const featureType = feature.feature_type;

    return html`
      <div class="row">
        <span>${featureType}</span>
        <span>${feature.id}</span>
      </div>
      <ens-text-button @click=${this.#onFeatureFocusClick}>
        Toggle focus
      </ens-text-button>
    `;
  }
}
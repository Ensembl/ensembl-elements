import { html, css, render, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import '@ensembl/ensembl-elements-common/components/popup/popup.js';

import type { FeatureClickPayload, GeneClickPayload } from '../types/featureClickEvent';
import type { RegionOverview } from './index';

@customElement('ens-reg-region-overview-popup-injector')
export class RegionOverviewPopupInjector extends LitElement {
  
  static styles = css`
    :host {
      display: block;
    }
  `

  connectedCallback() {
    super.connectedCallback();

    this.#setListeners();
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    this.#removeListeners();
  }

  #setListeners = () => {
    this.addEventListener('ens-reg-feature-click', this.#handleFeatureClick);
    this.addEventListener('ens-popup-click-outside', this.#handleOutsideClick);
  }

  #removeListeners = () => {
    this.removeEventListener('ens-reg-feature-click', this.#handleFeatureClick);
    this.removeEventListener('ens-popup-click-outside', this.#handleOutsideClick);
  }

  #handleFeatureClick = (event: Event) => {
    const element = event.target as RegionOverview; // the event will be emitted by the `ens-reg-region-overview` component
    const payload = (event as CustomEvent<FeatureClickPayload>).detail;

    const tooltip = this.#renderTooltip(payload);

    const slot = element.shadowRoot!.querySelector('slot[name="tooltip"]') as HTMLElement;
    const x = render(tooltip, slot);
    console.log('clicked feature', payload);
  }

  #handleOutsideClick = (event: Event) => {
    const [ target ] = event.composedPath() as HTMLElement[];
    const slot = target.parentElement as HTMLElement;
    render(null, slot);
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
        .anchor=${virtualEl}
      >
        <ens-reg-region-overview-popup-content
          .data=${payload}
        ></ens-reg-region-overview-popup-content>
      </ens-popup>
    `;
  }


  render() {
    return html`<slot></slot>`;
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
  `

  @property({ type: Object })
  data: FeatureClickPayload | null = null


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
}
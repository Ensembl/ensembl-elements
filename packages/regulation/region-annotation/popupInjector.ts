import { html, css, render, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';

import '@ensembl/ensembl-elements-common/components/popup/popup.js';

import type { FeatureClickPayload } from '../types/featureClickEvent';
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

  #handleFeatureClick = (event: CustomEvent<FeatureClickPayload>) => {
    const element = event.target as RegionOverview; // the event will be emitted by the `ens-reg-region-overview` component
    const payload = event.detail;

    const tooltip = this.#renderTooltip(payload);

    const slot = element.shadowRoot.querySelector('slot[name="tooltip"]') as HTMLElement;
    render(tooltip, slot);
  }

  #handleOutsideClick = (event: Event) => {
    const [ target ] = event.composedPath() as HTMLElement[];
    const slot = target.parentElement;
    render(null, slot);
  }

  #prepareTooltipContent = () => {
    return html`
      <p>This is the content of the tooltip</p>
    `;
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

    const tooltipContent = this.#prepareTooltipContent();

    return html`
      <ens-popup
        .anchor=${virtualEl}
      >
        ${ tooltipContent }
      </ens-popup>
    `;
  }


  render() {
    return html`<slot></slot>`;
  }

}
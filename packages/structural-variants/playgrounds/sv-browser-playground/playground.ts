import { html, css, LitElement } from 'lit';
import { customElement, state } from 'lit/decorators.js';

import '../../sv-browser/sv-browser';
import '../../nav-buttons/nav-buttons';

import type { ViewportChangePayload } from '../../sv-browser/sv-browser';
import type { VariantClickPayload } from '../../alignments/types/variant';

import '@ensembl/ensembl-elements-common/styles/custom-properties.css';

import { REFERENCE_GENOME_ID, ALT_GENOME_ID, REFERENCE_TRACKS, ALT_TRACKS, ENDPOINTS, INITIAL_VIEWPORT } from '../shared/constants';
import { GBMessagePayload } from '../../genome-browser/types/genome-browser';

@customElement('sv-browser-playground')
export class SvBrowserPlayground extends LitElement {
  static styles = css`
    :host {
      display: block;
      padding: 1rem;
    }

    .controls-wrapper {
      display: flex;
      justify-content: flex-end;
      padding-right: 1.5rem;
      margin-bottom: 1rem;
    }

    .variant-message {
      margin-top: 1.5rem;
      padding-left: 0.5rem;
      min-height: 1.5rem;
      font-size: 0.95rem;
      color: #3d4551;
    }
  `;

  @state()
  regionName = INITIAL_VIEWPORT.regionName;

  @state()
  start = INITIAL_VIEWPORT.start;

  @state()
  end = INITIAL_VIEWPORT.end;

  @state()
  altStart = 0;

  @state()
  altEnd = 0;

  onViewportChange = (event: CustomEvent<ViewportChangePayload>) => {
    const payload = event.detail || {};

    if(payload.reference) {
      this.start = payload.reference.start;
      this.end = payload.reference.end;
    }
    if(payload.alt) {
      this.altStart = payload.alt.start;
      this.altEnd = payload.alt.end;
    }
  }

  onVariantClick = (event: CustomEvent<VariantClickPayload>) => {
    const { detail: { variantName, variantType, variantStart, variantEnd } } = event;
    const numberFormatter = new Intl.NumberFormat('en-GB');
    const messageContainer = this.shadowRoot!.querySelector('.click-message');
    const start = numberFormatter.format(parseInt(variantStart));
    const end = numberFormatter.format(parseInt(variantEnd));
    const message = `Last clicked variant: ${variantName}, ${variantType} (${this.regionName}:${start}-${end})`;
    if (messageContainer) {
      messageContainer.textContent = message;
    }
  }

  onHotspotClick = (event: CustomEvent<GBMessagePayload>) => {
    const { detail: { genome, payload } } = event;
    const messageContainer = this.shadowRoot!.querySelector('.click-message');
    const message = `Tooltip for ${genome}: ${JSON.stringify(payload)}`;
    if (messageContainer) {
      messageContainer.textContent = message;
    }
  }

  render() {
    const altStart = this.altStart || this.start;
    const altEnd = this.altEnd || this.end;

    return html`
      <div class="controls-wrapper">
        <ens-sv-nav-buttons
          @viewport-change=${this.onViewportChange}
          .start=${this.start}
          .end=${this.end}
          .altStart=${altStart}
          .altEnd=${altEnd}
          .regionLength=${INITIAL_VIEWPORT.regionLength}
        ></ens-sv-nav-buttons>
      </div>
      <ens-sv-browser
        .referenceTracks=${REFERENCE_TRACKS}
        .altTracks=${ALT_TRACKS}
        .referenceGenomeId=${REFERENCE_GENOME_ID}
        .altGenomeId=${ALT_GENOME_ID}
        .regionName=${this.regionName}
        .regionLength=${INITIAL_VIEWPORT.regionLength}
        .start=${this.start}
        .end=${this.end}
        .altStart=${altStart}
        .altEnd=${altEnd}
        .endpoints=${ENDPOINTS}
        @viewport-change=${this.onViewportChange}
        @variant-click=${this.onVariantClick}
        @hotspot-message=${this.onHotspotClick}
      ></ens-sv-browser>
      <div class="click-message"></div>
    `;
  }
}

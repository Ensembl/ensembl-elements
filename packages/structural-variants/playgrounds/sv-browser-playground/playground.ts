import { html, css, LitElement } from 'lit';
import { customElement, state } from 'lit/decorators.js';

import '../../sv-browser/sv-browser';
import '../shared/control-buttons';

import type { ViewportChangePayload } from '../shared/control-buttons';
import type { PositionChangePayload } from '../../genome-browser/types/viewport';
import type { VariantClickPayload } from '../../alignments/types/variant';

import '@ensembl/ensembl-elements-common/styles/custom-properties.css';

import { REFERENCE_GENOME_ID, ALT_GENOME_ID, REFERENCE_TRACKS, ALT_TRACKS, GENOME_BROWSER_ENDPOINT, ALIGNMENT_ENDPOINTS, INITIAL_VIEWPORT } from '../shared/constants';

@customElement('sv-browser-playground')
export class SvBrowserPlayground extends LitElement {
  static styles = css`
    :host {
      display: block;
      padding: 1rem;
    }

    .controls-wrapper {
      display: flex;
      justify-content: space-between;
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
    const payload = event.detail;

    this.start = payload.reference.start;
    this.end = payload.reference.end;
    this.altStart = payload.alt.start;
    this.altEnd = payload.alt.end;
  }

  onLocationUpdated = (event: CustomEvent) => {
    const {
      reference: { start: refStart, end: refEnd },
      alt: { start: altStart, end: altEnd }
    } = event.detail;
    this.start = refStart;
    this.end = refEnd;
    this.altStart = altStart;
    this.altEnd = altEnd;
  }

  onVariantClicked = (event: CustomEvent<VariantClickPayload>) => {
    const { detail: { variantName, variantType, variantStart, variantEnd } } = event;
    const numberFormatter = new Intl.NumberFormat('en-GB');
    const messageContainer = this.shadowRoot!.querySelector('.variant-message');
    const start = numberFormatter.format(parseInt(variantStart));
    const end = numberFormatter.format(parseInt(variantEnd));
    const message = `Last clicked variant: ${variantName}, ${variantType} (${this.regionName}:${start}-${end})`;
    if (messageContainer) {
      messageContainer.textContent = message;
    }
  }

  onReferencePositionChange = (event: CustomEvent<PositionChangePayload>) => {
    const detail = event.detail;
    if (!detail) {
      return;
    }
    this.start = detail.start;
    this.end = detail.end;
  }

  onAltPositionChange = (event: CustomEvent<PositionChangePayload>) => {
    const detail = event.detail;
    if (!detail) {
      return;
    }
    this.altStart = detail.start;
    this.altEnd = detail.end;
  }

  render() {
    const altStart = this.altStart || this.start;
    const altEnd = this.altEnd || this.end;

    return html`
      <div class="controls-wrapper">
        <control-buttons
          @viewport-change=${this.onViewportChange}
          .start=${this.start}
          .end=${this.end}
          .altStart=${altStart}
          .altEnd=${altEnd}
          .regionLength=${INITIAL_VIEWPORT.regionLength}
        ></control-buttons>
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
        .endpoints=${ALIGNMENT_ENDPOINTS}
        .genomeBrowserEndpoint=${GENOME_BROWSER_ENDPOINT}
        @location-updated=${this.onLocationUpdated}
        @variant-clicked=${this.onVariantClicked}
        @reference-position-change=${this.onReferencePositionChange}
        @alt-position-change=${this.onAltPositionChange}
      ></ens-sv-browser>
      <div class="variant-message"></div>
    `;
  }
}

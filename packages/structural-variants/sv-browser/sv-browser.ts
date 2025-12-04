import { html, css, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import '../alignments/variant-alignments';
import '../genome-browser/genome-browser';

import type { VariantClickPayload } from '../alignments/types/variant';
import type { PositionChangePayload } from '../genome-browser/types/viewport';
import type { Endpoints } from '../alignments/variant-alignments';

@customElement('ens-sv-browser')
export class EnsSvBrowser extends LitElement {
  static styles = css`
    :host {
      display: block;
      border: 1px dashed #d0d4da;
      border-radius: 4px;
      padding: 1rem;
      margin: 1rem 0;
      background: #fff;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    ens-sv-genome-browser {
      border-top: 1px solid #eef0f3;
      border-bottom: 1px solid #eef0f3;
      padding-top: 1rem;
      padding-bottom: 1rem;
    }
  `;

  @property({ type: Array })
  referenceTracks: string[] = [];

  @property({ type: Array })
  altTracks: string[] = [];

  @property({ type: String })
  referenceGenomeId: string | null = null;

  @property({ type: String })
  altGenomeId: string | null = null;

  @property({ type: String })
  regionName = '';

  @property({ type: Number })
  regionLength = Infinity;

  @property({ type: Number })
  start = 0;

  @property({ type: Number })
  end = 0;

  @property({ type: Number })
  altStart = 0;

  @property({ type: Number })
  altEnd = 0;

  @property({ type: Object })
  endpoints: Endpoints | null = null;

  @property({ type: String })
  genomeBrowserEndpoint = '/api/browser/data';

  #bubbleEvent = (name: string, detail: unknown) => {
    this.dispatchEvent(new CustomEvent(name, {
      detail,
      bubbles: true,
      composed: true
    }));
  };

  #onLocationUpdated = (event: CustomEvent) => {
    this.#bubbleEvent('location-updated', event.detail);
  };

  #onVariantClicked = (event: CustomEvent<VariantClickPayload>) => {
    this.#bubbleEvent('variant-clicked', event.detail);
  };

  #onReferenceBrowserPositionChange = (event: CustomEvent<PositionChangePayload>) => {
    this.#bubbleEvent('reference-position-change', event.detail);
  };

  #onAltBrowserPositionChange = (event: CustomEvent<PositionChangePayload>) => {
    this.#bubbleEvent('alt-position-change', event.detail);
  };

  render() {
    const altStart = this.altStart || this.start;
    const altEnd = this.altEnd || this.end;

    return html`
    <ens-sv-genome-browser
      .tracks=${this.referenceTracks}
      .genomeId=${this.referenceGenomeId}
      .regionName=${this.regionName}
      .regionLength=${this.regionLength}
      .start=${this.start}
      .end=${this.end}
      .endpoint=${this.genomeBrowserEndpoint}
      @position-change=${this.#onReferenceBrowserPositionChange}
    ></ens-sv-genome-browser>
    <ens-sv-alignments
      .referenceGenomeId=${this.referenceGenomeId}
      .altGenomeId=${this.altGenomeId}
      .regionName=${this.regionName}
      .regionLength=${this.regionLength}
      .start=${this.start}
      .end=${this.end}
      .altStart=${altStart}
      .altEnd=${altEnd}
      .endpoints=${this.endpoints}
      @location-updated=${this.#onLocationUpdated}
      @variant-clicked=${this.#onVariantClicked}
      ></ens-sv-alignments>
    <ens-sv-genome-browser
      .tracks=${this.altTracks}
      .genomeId=${this.altGenomeId}
      .regionName=${this.regionName}
      .regionLength=${this.regionLength}
      .start=${altStart}
      .end=${altEnd}
      .endpoint=${this.genomeBrowserEndpoint}
      @position-change=${this.#onAltBrowserPositionChange}
    ></ens-sv-genome-browser>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ens-sv-browser': EnsSvBrowser;
  }
}

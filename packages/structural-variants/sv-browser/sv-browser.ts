import { html, css, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import '../alignments/variant-alignments';
import '../genome-browser/genome-browser';
import { LocationChangePayload } from '../genome-browser';

export type ViewportChangePayload = {
  reference?: LocationChangePayload,
  alt?: LocationChangePayload
};

export type Endpoints = {
  variants: string;
  alignments: string;
  genomeBrowser: string;
};

@customElement('ens-sv-browser')
export class EnsSvBrowser extends LitElement {
  static styles = css`
    :host {
      display: block;
      border: 1px dashed #d0d4da;
      border-radius: 4px;
      margin: 1rem 0;
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
  endpoints!: Endpoints;

  private syncViewport(reference?: LocationChangePayload, alt?: LocationChangePayload) {
    if (reference) {
      this.start = reference.start;
      this.end = reference.end;
    }
    if (alt) {
      this.altStart = alt.start;
      this.altEnd = alt.end;
    }
  };

  private onLocationChange = (event: CustomEvent<ViewportChangePayload>) => {
    const { reference, alt } = event.detail ?? {};
    this.syncViewport(reference, alt);
  };

  private onReferenceLocationChange = (event: CustomEvent<LocationChangePayload>) => {
    this.syncViewport(event.detail, undefined);
  };

  private onAltLocationChange = (event: CustomEvent<LocationChangePayload>) => {
    this.syncViewport(undefined, event.detail);
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
      .endpoint=${this.endpoints.genomeBrowser}
      @location-change=${this.onReferenceLocationChange}
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
      @location-change=${this.onLocationChange}
      ></ens-sv-alignments>
    <ens-sv-genome-browser
      .tracks=${this.altTracks}
      .genomeId=${this.altGenomeId}
      .regionName=${this.regionName}
      .regionLength=${this.regionLength}
      .start=${altStart}
      .end=${altEnd}
      .endpoint=${this.endpoints.genomeBrowser}
      @location-change=${this.onAltLocationChange}
    ></ens-sv-genome-browser>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ens-sv-browser': EnsSvBrowser;
  }
}

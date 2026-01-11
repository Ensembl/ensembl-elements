import { html, css, LitElement } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';

import '../alignments/variant-alignments';
import '../genome-browser/genome-browser';

import {
  initialTrackPositions,
  updateGenomeBrowserTrackSummaries,
  haveTrackPositionsChanged,
  createOutgoingTrackSummaries
} from './track-summaries';

import type { LocationChangePayload } from '../genome-browser';
import type { TrackSummaryEventDetail, HotspotEventDetail } from '../genome-browser/types/genome-browser';

export type ViewportChangePayload = {
  reference: LocationChangePayload,
  alt: LocationChangePayload
};

export type Endpoints = {
  variants: string;
  alignments: string;
  genomeBrowser: string;
};

type GenomeBrowserMessage =
  | TrackSummaryEventDetail
  | HotspotEventDetail;

@customElement('ens-sv-browser')
export class StructuralVariantsBrowser extends LitElement {
  static styles = css`
    :host {
      display: block;
      container-type: inline-size; // to make the width of the genome browser defined by the width of the host component
      border: 1px dashed #d0d4da;
      border-radius: 4px;
    }

    ens-sv-genome-browser {
      width: 100cqw;
    }
  `;

  @property({ type: Array })
  referenceTracks: string[] = [];

  @property({ type: Array })
  altTracks: string[] = [];

  @property({ type: String })
  referenceGenomeId: string = '';

  @property({ type: String })
  altGenomeId: string = '';

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

  @property({ type: Number })
  altRegionLength = Infinity;

  @property({ type: Object })
  endpoints!: Endpoints;

  @query('ens-sv-genome-browser:first-of-type')
  genomeBrowserTop!: HTMLElement;

  @query('ens-sv-genome-browser:nth-of-type(2)')
  genomeBrowserBottom!: HTMLElement;

  @query('ens-sv-alignments')
  variantAlignmentsElement!: HTMLElement;

  #hostElementHeight = 0;

  #trackPositions = structuredClone(initialTrackPositions);

  protected firstUpdated() {
    const resizeObserver = new ResizeObserver((entries) => {
      const [hostElementEntry] = entries;
      const { height: hostHeight } = hostElementEntry.contentRect;
      const storedHostHeight = this.#hostElementHeight;
      if (hostHeight !== storedHostHeight) {
        this.#recordChildrenPositions();
        this.#reportTrackPositions();
        this.#hostElementHeight = hostHeight;
      }
    });

    resizeObserver.observe(this);    
  }

  #recordChildrenPositions() {
    const genomeBrowserTopBoundingRect = this.genomeBrowserTop!.getBoundingClientRect();
    const genomeBrowserBottomBoundingRect = this.genomeBrowserBottom!.getBoundingClientRect();
    const alignmentsBoundingRect = this.variantAlignmentsElement!.getBoundingClientRect();
    this.#trackPositions.genomeBrowserTop.height = genomeBrowserTopBoundingRect.height;
    this.#trackPositions.variantAlignments.offsetTop = genomeBrowserTopBoundingRect.height;
    this.#trackPositions.variantAlignments.height = alignmentsBoundingRect.height;
    this.#trackPositions.genomeBrowserBottom.offsetTop = this.#trackPositions.variantAlignments.offsetTop
      + this.#trackPositions.variantAlignments.height;
    this.#trackPositions.genomeBrowserBottom.height = genomeBrowserBottomBoundingRect.height;
  }

  #reportTrackPositions() {
    const trackSummaries = createOutgoingTrackSummaries(this.#trackPositions);
    const event = new CustomEvent('track-positions', {
      detail: trackSummaries,
      composed: true
    });
    this.dispatchEvent(event);
  }

  #syncViewport(payload: {
    reference?: LocationChangePayload;
    alt?: LocationChangePayload;
    eventName: string;
  }) {
    const { reference, alt, eventName } = payload;
    if (!eventName.endsWith('-end')) {
      if (reference) {
        this.start = reference.start;
        this.end = reference.end;
      }
      if (alt) {
        this.altStart = alt.start;
        this.altEnd = alt.end;
      }
    }
    const detail: ViewportChangePayload = {
      reference: {
        start: this.start,
        end: this.end
      },
      alt: {
        start: this.altStart || this.start,
        end: this.altEnd || this.end
      }
    };

    const outgoingEventName = eventName.endsWith('-end') ? 'viewport-change-end' : 'viewport-change';
    const event = new CustomEvent<ViewportChangePayload>(outgoingEventName, {
      detail,
      bubbles: true,
      composed: true
    });

    this.dispatchEvent(event);
  };

  #onViewportChange = (event: CustomEvent<ViewportChangePayload>) => {
    event.stopPropagation();
    const { reference, alt } = event.detail ?? {};
    this.#syncViewport({ reference, alt, eventName: event.type });
  };

  #onReferenceLocationChange = (event: CustomEvent<LocationChangePayload>) => {
    event.stopPropagation();
    this.#syncViewport({ reference: event.detail, eventName: event.type });
  };

  #onAltLocationChange = (event: CustomEvent<LocationChangePayload>) => {
    event.stopPropagation();
    this.#syncViewport({ alt: event.detail, eventName: event.type });
  };

  #onReferenceGenomeBrowserMessage = (event: CustomEvent<GenomeBrowserMessage>) => {
    this.#onGenomeBrowserMessage({ event, isAlt: false });
  }

  #onAltGenomeBrowserMessage = (event: CustomEvent<GenomeBrowserMessage>) => {
    this.#onGenomeBrowserMessage({ event, isAlt: true });
  }

  #onGenomeBrowserMessage = (params: { event: CustomEvent<GenomeBrowserMessage>, isAlt: boolean }) => {
    const { event, isAlt } = params;
    const message = event.detail;
    if (message.type === 'track-summary') {
      const updatedTrackPositions = updateGenomeBrowserTrackSummaries({
        trackPositions: this.#trackPositions,
        trackSummaries: message.payload.summary,
        isAlt: params.isAlt
      });

      if (haveTrackPositionsChanged(updatedTrackPositions, this.#trackPositions)) {
        this.#trackPositions = updatedTrackPositions;
        this.#reportTrackPositions();
      }
    }
  }

  render() {
    if (!this.referenceGenomeId || !this.altGenomeId) {
      console.error('One or both genome uuids missing!');
      return;
    }

    const altStart = this.altStart;
    const altEnd = this.altEnd;

    return html`
    <ens-sv-genome-browser
      .tracks=${this.referenceTracks}
      .genomeId=${this.referenceGenomeId}
      .regionName=${this.regionName}
      .regionLength=${this.regionLength}
      .start=${this.start}
      .end=${this.end}
      .endpoint=${this.endpoints.genomeBrowser}
      @location-change=${this.#onReferenceLocationChange}
      @location-change-end=${this.#onReferenceLocationChange}
      @genome-browser-message=${this.#onReferenceGenomeBrowserMessage}
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
      .altRegionLength=${this.altRegionLength}
      .endpoints=${this.endpoints}
      @viewport-change=${this.#onViewportChange}
      @viewport-change-end=${this.#onViewportChange}
      ></ens-sv-alignments>
    <ens-sv-genome-browser
      .tracks=${this.altTracks}
      .genomeId=${this.altGenomeId}
      .regionName=${this.regionName}
      .regionLength=${this.regionLength}
      .start=${altStart}
      .end=${altEnd}
      .endpoint=${this.endpoints.genomeBrowser}
      @location-change=${this.#onAltLocationChange}
      @location-change-end=${this.#onAltLocationChange}
      @genome-browser-message=${this.#onAltGenomeBrowserMessage}
    ></ens-sv-genome-browser>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ens-sv-browser': StructuralVariantsBrowser;
  }
}

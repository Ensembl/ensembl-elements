import { html, css, LitElement, type PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import { DataService } from '../alignments-data/data-service';
import { getStepBasedInterval } from '../alignments-data/request-interval-helpers';

import './variant-alignments-image';

import type { Variant } from './types/variant';
import type { Alignment } from './types/alignment';
import type { InputData as VariantAlignmentsData } from './variant-alignments-image';

export type Endpoints = {
  variants: string;
  alignments: string;
};

/**
 * The purpose of this component is to fetch and provide data to ens-sv-alignments
 */

@customElement('ens-sv-alignments')
export class VariantAlignments extends LitElement {

  static styles = css`
    :host {
      display: block;
    }
  `

  // uuid of the reference genome
  @property({ type: String })
  referenceGenomeId: string | null = null;

  // uuid of the genome that is being compared to the reference
  @property({ type: String })
  altGenomeId: string | null = null;

  // genomic start on the reference genome region
  @property({ type: Number })
  start = 0;

  // genomic end on the reference genome region
  @property({ type: Number })
  end = 0;

  // name of the reference genome region
  @property({ type: String })
  regionName = '';

  // length of the reference genome region
  @property({ type: Number })
  regionLength = 0;

  // genomic start on the alternative genome region
  @property({ type: Number })
  altStart = 0;

  // genomic end on the alternative genome region
  @property({ type: Number })
  altEnd = 0;

  @property({ type: Object })
  endpoints: Endpoints | null = null;

  @state()
  data!: VariantAlignmentsData;

  #variantDataService: ReturnType<typeof createVariantDataService> | null = null;
  #refToAltAlignmentsDataService: ReturnType<typeof createAlignmentsDataService> | null = null;
  #altToRefAlignmentsDataService: ReturnType<typeof createAlignmentsDataService> | null = null;

  willUpdate(changedProperties: PropertyValues) {
    if (
      changedProperties.has('referenceGenomeId') ||
      changedProperties.has('altGenomeId') || 
      changedProperties.has('regionName')
    ) {
      this.#setDataServices();
    }
    if (
      changedProperties.has('start') ||
      changedProperties.has('end') || 
      changedProperties.has('altStart') ||
      changedProperties.has('altEnd')
    ) {
      this.#onLocationUpdated();
    }
  }

  #onLocationUpdated = () => {
    this.#fetchData();
  }

  #setDataServices() {
    if (
      !this.referenceGenomeId ||
      !this.altGenomeId ||
      !this.regionName
    ) {
      return;
    }

    // Setting up alignments data services
    this.#refToAltAlignmentsDataService = createAlignmentsDataService({
      referenceGenomeId: this.referenceGenomeId,
      altGenomeId: this.altGenomeId,
      regionName: this.regionName,
      endpoint: this.endpoints!.alignments as string,
      isReference: true
    });
    this.#altToRefAlignmentsDataService = createAlignmentsDataService({
      referenceGenomeId: this.referenceGenomeId,
      altGenomeId: this.altGenomeId,
      regionName: this.regionName,
      endpoint: this.endpoints!.alignments as string,
      isReference: false
    });

    // Setting up variants data service
    this.#variantDataService = createVariantDataService({
      referenceGenomeId: this.referenceGenomeId,
      altGenomeId: this.altGenomeId,
      endpoint: this.endpoints!.variants as string,
      regionName: this.regionName
    });
  }

  #fetchData = async () => {
    const alignmentsData = await this.#fetchAlignmentsData();
    const variantsData = await this.#fetchVariantsData();

    this.data = {
      alignments: alignmentsData,
      variants: variantsData
    };

    if (
      !this.altStart &&
      !this.altEnd
    ) {
      this.#getInitialAltSequenceCoords();
    }
  }

  #fetchVariantsData = async () => {
    if (!this.#variantDataService) {
      return [];
    }

    const { start, end } = this.#getStandardInterval({
      start: this.start,
      end: this.end
    });

    return await this.#variantDataService.get({
      start,
      end,
    });
  }

  #fetchAlignmentsData = async () => {
    if (!this.#refToAltAlignmentsDataService || !this.#altToRefAlignmentsDataService) {
      return [];
    }

    const { start: refStart, end: refEnd } = this.#getStandardInterval({
      start: this.start,
      end: this.end
    });

    const refToAltAlignments = await this.#refToAltAlignmentsDataService.get({
      start: refStart,
      end: refEnd
    });

    // TODO: add altToRef alignments; remember to use altStart and altEnd for start and end
    let altToRefAlignments: Alignment[] = [];

    if (this.altStart && this.altEnd) {
      const { start: altStart, end: altEnd } = this.#getStandardInterval({
        start: this.altStart,
        end: this.altEnd
      });

      altToRefAlignments = await this.#altToRefAlignmentsDataService.get({
        start: altStart,
        end: altEnd
      });
    }

    return [...refToAltAlignments, ...altToRefAlignments]
      .sort((a, b) => a.reference.start - b.reference.start);
  }

  #getStandardInterval(params: {
    start: number;
    end: number;
  }) {
    return getStepBasedInterval({...params, step: 1_000_000});
  }

  #getInitialAltSequenceCoords() {
    const data = this.data;

    if (!data) {
      return;
    }

    let genomicStart: number = 0;
    const { alignments } = data;

    for (const alignment of alignments) {
      const altStart = alignment.alt.start;

      if (!genomicStart || altStart < genomicStart) {
        genomicStart = altStart;
      }
    }

    const viewportGenomicDistance = this.end - this.start + 1;

    this.altStart = genomicStart;
    this.altEnd = genomicStart + viewportGenomicDistance;

    const eventData = {
      reference: {
        start: this.start,
        end: this.end
      },
      alt: {
        start: this.altStart,
        end: this.altEnd
      }
    }

    const viewportUpdateEvent = new CustomEvent('viewport-change-end', {
      bubbles: true,
      composed: true,
      detail: eventData
    });
    this.dispatchEvent(viewportUpdateEvent);
  };

  render() {
    return html`
      <ens-sv-alignments-image
        .start=${this.start}
        .end=${this.end}
        .altStart=${this.altStart}
        .altEnd=${this.altEnd}
        .regionLength=${Infinity}
        .regionName=${this.regionName}
        .data=${this.data}
      ></ens-sv-alignments-image>
    `;
  }

}


const createVariantDataService = (params: {
  referenceGenomeId: string;
  altGenomeId: string;
  regionName: string;
  endpoint: string
}) => {
  const { referenceGenomeId, altGenomeId, regionName, endpoint } = params;
  const getVariantId = (variant: Variant) => variant.name;
  const getVariantStart = (variant: Variant) => variant.location.start;
  const getVariantEnd = (variant: Variant) => variant.location.end;

  const dataService = new DataService<Variant, {
    start: number;
    end: number;
  }>({
    loader: async (params) => {
      const { start, end } = params;
      const searchParams = new URLSearchParams();
      searchParams.append('reference_genome_id', referenceGenomeId);
      searchParams.append('alt_genome_id', altGenomeId);
      searchParams.append('viewport', `${regionName}:${start}-${end}`);
      const queryString = decodeURIComponent(searchParams.toString()); // do not escape the colon in the viewport
      const url = `${endpoint}?${queryString}`;
      const data = await fetch(url).then(response => response.json());
      return data;
    },
    getFeatureId: getVariantId,
    getFeatureStart: getVariantStart,
    getFeatureEnd: getVariantEnd
  });

  return dataService;
};

const createAlignmentsDataService = (params: {
  referenceGenomeId: string;
  altGenomeId: string;
  regionName: string;
  endpoint: string;
  isReference: boolean;
}) => {
  const { referenceGenomeId, altGenomeId, regionName, endpoint, isReference } = params;
  const getAlignmentStart = isReference ? getRefToAltAlignmentStart : getAltToRefAlignmentStart;
  const getAlignmentEnd = isReference ? getRefToAltAlignmentEnd : getAltToRefAlignmentEnd;

  const dataService = new DataService<Alignment, {
    start: number;
    end: number;
  }>({
    loader: async (params) => {
      const { start, end } = params;
      const searchParams = new URLSearchParams();
      const viewportParamName = isReference ? 'reference_viewport' : 'alt_viewport';
      searchParams.append('reference_genome_id', referenceGenomeId);
      searchParams.append('alt_genome_id', altGenomeId);
      searchParams.append(viewportParamName, `${regionName}:${start}-${end}`);
      const queryString = decodeURIComponent(searchParams.toString());
      const url = `${endpoint}?${queryString}`;
      const data: Alignment[] = await fetch(url).then(response => response.json());
      return data;
    },
    getFeatureStart: getAlignmentStart,
    getFeatureEnd: getAlignmentEnd
  });

  return dataService;
};

const getRefToAltAlignmentStart = (alignment: Alignment) => alignment.reference.start;
const getRefToAltAlignmentEnd = (alignment: Alignment) =>
  alignment.reference.start + alignment.reference.length - 1;

const getAltToRefAlignmentStart = (alignment: Alignment) => alignment.alt.start;
const getAltToRefAlignmentEnd = (alignment: Alignment) =>
  alignment.alt.start + alignment.alt.length - 1;

declare global {
  interface HTMLElementTagNameMap {
    'ens-sv-alignments': VariantAlignments;
  }
}
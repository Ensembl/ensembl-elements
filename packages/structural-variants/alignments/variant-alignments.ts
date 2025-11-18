import { html, css, LitElement, type PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import { DataService, AlignmentsLoader } from '../alignments-data';

import './variant-alignments-image';

import type { Variant } from './types/variant';
import type { InputData as VariantAlignmentsData } from './variant-alignments-image';

type Endpoints = {
  variants?: string;
  alignments?: string;
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

  // genomic start
  @property({ type: Number })
  start = 0;

  // genomic end
  @property({ type: Number })
  end = 0;

  @property({ type: Number })
  regionLength = 0;

  // genomic start
  @property({ type: Number })
  alignmentAltStart = 0;

  // genomic end
  @property({ type: Number })
  alignmentAltEnd = 0;

  @property({ type: String })
  regionName = '';

  @property({ type: Object })
  endpoints: Endpoints | null = null;

  @state()
  data!: VariantAlignmentsData;

  variantDataService: ReturnType<typeof createVariantDataService> | null = null;
  alignmentsDataService: AlignmentsLoader | null = null;

  connectedCallback(): void {
    super.connectedCallback();
    this.#fetchData();
  }

  willUpdate(changedProperties: PropertyValues) {
    if (
      changedProperties.has('start') ||
      changedProperties.has('end') || 
      changedProperties.has('alignmentAltStart') ||
      changedProperties.has('alignmentAltEnd')
    ) {
      this.#onLocationUpdated();
    }
  }

  #onLocationUpdated = () => {
    this.#fetchData();
  }

  #fetchData = async () => {
    const alignmentsData = await this.#fetchAlignmentsData();
    const variantsData = await this.#fetchVariantsData();

    this.data = {
      alignments: alignmentsData,
      variants: variantsData
    };

    if (
      !this.alignmentAltStart &&
      !this.alignmentAltEnd
    ) {
      this.#getInitialAltSequenceCoords();
    }
  }

  #fetchVariantsData = async () => {
    if (!this.referenceGenomeId || !this.altGenomeId) {
      return [];
    }
    if (!this.variantDataService) {
      this.variantDataService = createVariantDataService({
        genomeId: this.referenceGenomeId,
        endpoint: this.endpoints?.variants
      });
    }

    return await this.variantDataService.get({
      regionName: this.regionName,
      start: this.start,
      end: this.end,
    });
  }

  #fetchAlignmentsData = async () => {
    if (!this.alignmentsDataService) {
      this.alignmentsDataService = new AlignmentsLoader({
        endpoint: this.endpoints?.alignments
      });
    } if (!this.referenceGenomeId || !this.altGenomeId) {
      return [];
    }

    return this.alignmentsDataService.get({
      referenceGenomeId: this.referenceGenomeId,
      altGenomeId: this.altGenomeId,
      regionName: this.regionName,
      start: this.start,
      end: this.end,
      altStart: this.alignmentAltStart,
      altEnd: this.alignmentAltEnd
    });
  }

  #getInitialAltSequenceCoords() {
    const data = this.data;

    if (!data) {
      return;
    }

    let genomicStart: number = 0;
    let genomicEnd: number = 0;
    const { alignments } = data;

    for (const alignment of alignments) {
      const altStart = alignment.alt.start;
      const altEnd = alignment.alt.start + alignment.alt.length - 1;

      if (!genomicStart || altStart < genomicStart) {
        genomicStart = altStart;
      }

      if (!genomicEnd || altEnd > genomicEnd) {
        genomicEnd = altEnd;
      }
    }

    this.alignmentAltStart = genomicStart;
    this.alignmentAltEnd = genomicEnd;
  };

  render() {
    return html`
      <ens-sv-alignments-image
        .start=${this.start}
        .end=${this.end}
        .alignmentAltStart=${this.alignmentAltStart}
        .alignmentAltEnd=${this.alignmentAltEnd}
        .regionLength=${Infinity}
        .regionName=${this.regionName}
        .data=${this.data}
      ></ens-sv-alignments-image>
    `;
  }

}


const createVariantDataService = (params: {
  genomeId: string;
  endpoint?: string
}) => {
  const { genomeId, endpoint = '/api/variants' } = params;

  const dataService = new DataService<Variant, {
    regionName: string;
    start: number;
    end: number;
  }>({
    loader: async (params) => {
      const { regionName, start, end } = params;
      const searchParams = new URLSearchParams();
      searchParams.append('genome_id', genomeId);
      searchParams.append('viewport', `${regionName}:${start}-${end}`);
      const queryString = decodeURIComponent(searchParams.toString()); // do not escape the colon in the viewport
      const url = `${endpoint}?${queryString}`;
      const data = await fetch(url).then(response => response.json());
      return data;
    },
    featureStartFieldPath: 'location.start',
    featureEndFieldPath: 'location.end',
    getFeatureId: (variant: Variant) => {
      return variant.name;
    }
  });

  return dataService;
};

declare global {
  interface HTMLElementTagNameMap {
    'ens-sv-alignments': VariantAlignments;
  }
}
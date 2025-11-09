import { html, css, LitElement, type PropertyValues } from 'lit';
import { customElement, state } from 'lit/decorators.js';

import { DataService, AlignmentsLoader } from '../alignments-data';

import '../alignments/variant-alignments';
import './control-buttons';

import type { InputData as VariantAlignmentsData } from '../alignments/variant-alignments';
import type { Variant, VariantClickPayload } from '../alignments/types/variant';
import type { ViewportChangePayload } from './control-buttons';

import '@ensembl/ensembl-elements-common/styles/custom-properties.css';

// a location on chromosome 1 that has some features
// const INITIAL_START = 1;
// const INITIAL_END = 1_000_000;

// const INITIAL_START = 1;
// const INITIAL_END = 80_000;

const INITIAL_REGION_NAME = '1';
const INITIAL_START = 142_500_000;
const INITIAL_END = 145_500_000;

@customElement('alignments-playground')
export class StructuralVariantsPlayground extends LitElement {
  static styles = css`
    .controls-wrapper {
      display: flex;
      justify-content: space-between;
      padding-right: 1.5rem;
      margin-top: 1rem;
      margin-bottom: 0.6rem;
    }

    .variant-message {
      margin-top: 2rem;
      padding-left: 2rem;
    }
  `;

  @state()
  regionName = INITIAL_REGION_NAME;

  @state()
  start = INITIAL_START;

  @state()
  end = INITIAL_END;

  // genomic end
  @state()
  alignmentTargetStart = 0;

  // genomic end
  @state()
  alignmentTargetEnd = 0;

  @state()
  data!: VariantAlignmentsData;

  variantDataService: ReturnType<typeof createVariantDataService> | null = null;
  alignmentsDataService: AlignmentsLoader | null = null;

  connectedCallback(): void {
    this.fetchData();
    super.connectedCallback();
  }

  willUpdate(changedProperties: PropertyValues) {
    if (
      changedProperties.has('data') &&
      !this.alignmentTargetStart &&
      !this.alignmentTargetEnd
    ) {
      this.#getInitialTargetSequenceCoords();
    }
  }

  fetchData = async () => {
    const alignmentsData = await this.fetchAlignmentsData();
    const variantsData = await this.fetchVariantsData();


    this.data = {
      alignments: alignmentsData,
      variants: variantsData
    };
  }

  fetchVariantsData = async () => {
    if (!this.variantDataService) {
      this.variantDataService = createVariantDataService();
    }

    return await this.variantDataService.get({
      regionName: '1',
      start: this.start,
      end: this.end,
    });
  }

  fetchAlignmentsData = async () => {
    if (!this.alignmentsDataService) {
      this.alignmentsDataService = new AlignmentsLoader();
    }

    return this.alignmentsDataService.get({
      regionName: this.regionName,
      start: this.start,
      end: this.end,
      targetStart: this.alignmentTargetStart,
      targetEnd: this.alignmentTargetEnd
    });
  }

  // onRegionChange = (event: CustomEvent<RegionChangePayload>) => {
  //   this.regionName = event.detail.regionName;
  //   this.variantDataService = null;
  //   this.alignmentsDataService = null;
  //   this.start = INITIAL_START;
  //   this.end = INITIAL_END;
  //   this.alignmentTargetStart = 0;
  //   this.alignmentTargetEnd = 0;

  //   this.fetchData();
  // }

  onViewportChange = (event: CustomEvent<ViewportChangePayload>) => {
    const payload = event.detail;

    this.start = payload.reference.start;
    this.end = payload.reference.end;
    this.alignmentTargetStart = payload.target.start;
    this.alignmentTargetEnd = payload.target.end;

    this.fetchData();
  }

  onLocationUpdated = (event: CustomEvent) => {
    const {
      reference: { start: refStart, end: refEnd },
      target: { start: targetStart, end: targetEnd }
    } = event.detail;
    this.start = refStart;
    this.end = refEnd;
    this.alignmentTargetStart = targetStart;
    this.alignmentTargetEnd = targetEnd;

    this.fetchData();
  }

  onVariantClicked = (event: CustomEvent<VariantClickPayload>) => {
    const { detail: {
      variantName,
      variantType,
      variantStart,
      variantEnd
    }} = event;

    const numberFormatter = new Intl.NumberFormat('en-GB');
    const messageContainer = this.shadowRoot!.querySelector('.variant-message');
    const start = numberFormatter.format(parseInt(variantStart));
    const end = numberFormatter.format(parseInt(variantEnd));
    const message = `Last clicked variant: ${variantName}, ${variantType} (${this.regionName}:${start}-${end})`;
    messageContainer!.textContent = message;
  }

  render() {
    if (!this.data) {
      return null;
    }

    return html`
      <div class="controls-wrapper">
        <control-buttons
          @viewport-change=${this.onViewportChange}
          .start=${this.start}
          .end=${this.end}
          .alignmentTargetStart=${this.alignmentTargetStart}
          .alignmentTargetEnd=${this.alignmentTargetEnd}
        >
        </control-buttons>
      </div>
      <ens-sv-alignments
        @location-updated=${this.onLocationUpdated}
        @variant-clicked=${this.onVariantClicked}
        .start=${this.start}
        .end=${this.end}
        .alignmentTargetStart=${this.alignmentTargetStart}
        .alignmentTargetEnd=${this.alignmentTargetEnd}
        .regionLength=${Infinity}
        .regionName=${"1"}
        .data=${this.data}
      ></ens-sv-alignments>
      <div class="variant-message"></div>
    `;
  }

  #getInitialTargetSequenceCoords() {
    const data = this.data;

    if (!data) {
      return;
    }

    let genomicStart: number = 0;
    let genomicEnd: number = 0;
    const { alignments } = data;

    for (const alignment of alignments) {
      const targetStart = alignment.target.start;
      const targetEnd = alignment.target.start + alignment.target.length - 1;

      if (!genomicStart || targetStart < genomicStart) {
        genomicStart = targetStart;
      }

      if (!genomicEnd || targetEnd > genomicEnd) {
        genomicEnd = targetEnd;
      }
    }

    this.alignmentTargetStart = genomicStart;
    this.alignmentTargetEnd = genomicEnd;
  };

}




const createVariantDataService = () => {
  const dataService = new DataService<Variant, {
    regionName: string;
    start: number;
    end: number;
  }>({
    loader: async (params) => {
      const { regionName, start, end } = params;
      const viewportStr = `viewport=${regionName}:${start}-${end}`;
      const url = `/api/variants?${viewportStr}`;
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
import { html, css, LitElement } from 'lit';
import { customElement, state } from 'lit/decorators.js';

import '../alignments/variant-alignments';
import './control-buttons';

import type { VariantClickPayload } from '../alignments/types/variant';
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
    return html`
      <div class="controls-wrapper">
        <control-buttons
          @viewport-change=${this.onViewportChange}
          .start=${this.start}
          .end=${this.end}
          .altStart=${this.altStart}
          .altEnd=${this.altEnd}
        >
        </control-buttons>
      </div>
      <ens-sv-alignments
        @location-updated=${this.onLocationUpdated}
        @variant-clicked=${this.onVariantClicked}
        .referenceGenomeId=${"a7335667-93e7-11ec-a39d-005056b38ce3"}
        .altGenomeId=${"4c07817b-c7c5-463f-8624-982286bc4355"}
        .regionName=${"1"}
        .start=${this.start}
        .end=${this.end}
        .altStart=${this.altStart}
        .altEnd=${this.altEnd}
        .regionLength=${Infinity}
        .endpoints=${{
          alignments: '/api/alignments',
          variants: '/api/variants'
        }}
      ></ens-sv-alignments>
      <div class="variant-message"></div>
    `;
  }


}

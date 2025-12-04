import { html, css, LitElement } from 'lit';
import { customElement, state } from 'lit/decorators.js';

import '../../alignments/variant-alignments';
import '../shared/control-buttons';

import type { VariantClickPayload } from '../../alignments/types/variant';
import type { ViewportChangePayload } from '../../sv-browser/sv-browser';

import '@ensembl/ensembl-elements-common/styles/custom-properties.css';
import { REFERENCE_GENOME_ID, ALT_GENOME_ID, INITIAL_VIEWPORT, ENDPOINTS } from '../shared/constants';

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
          .regionLength=${INITIAL_VIEWPORT.regionLength}
        >
        </control-buttons>
      </div>
      <ens-sv-alignments
        @viewport-change=${this.onViewportChange}
        @variant-click=${this.onVariantClick}
        .referenceGenomeId=${REFERENCE_GENOME_ID}
        .altGenomeId=${ALT_GENOME_ID}
        .regionName=${this.regionName}
        .start=${this.start}
        .end=${this.end}
        .altStart=${this.altStart}
        .altEnd=${this.altEnd}
        .regionLength=${INITIAL_VIEWPORT.regionLength}
        .endpoints=${ENDPOINTS}
      ></ens-sv-alignments>
      <div class="variant-message"></div>
    `;
  }


}

import { html, css, LitElement} from 'lit';
import { customElement, state } from 'lit/decorators.js';

// not using the RegionOverview class directly,
// but importing it so that the component gets initialized
import '@ensembl/ensembl-regulation/region-overview';
import '@ensembl/ensembl-regulation/popup-injector';
import './zoomButtons';

import dataStore from './services/dataStore';

// a location on chromosome 1 that has some features
const INITIAL_START = 58873313;
const INITIAL_END = 59273313;
const CHROMOSOME_LENGTH = 248956422; // length of chromosome 1


@customElement('regulation-playground')
export class RegulationPlayground extends LitElement {
  static styles = css`
    .grid {
      display: grid;
      grid-template-columns: [left] 150px [middle] 1fr [right] 150px;
      margin-top: 2em;
    }

    ens-reg-region-overview {
      grid-column: middle;
    }

    ens-reg-zoom-buttons {
      align-self: start;
    }
  `;

  @state()
  start = INITIAL_START;

  @state()
  end = INITIAL_END;

  onViewportChange = (event: CustomEvent) => {
    const { start, end } = event.detail;
    this.start = start;
    this.end = end;
  }

  render() {
    const data = dataStore;

    return html`
      <h1>This should test region overview rendering using svg</h1>
      <div class="grid">
        <div>
          ${this.start}-${this.end}
        </div>
        <ens-reg-region-overview-popup-injector>
          <ens-reg-region-overview
            @viewport-change=${this.onViewportChange}
            .start=${this.start}
            .end=${this.end}
            .regionName=${"1"}
            .regionLength=${CHROMOSOME_LENGTH}
            .data=${data}>
          </ens-reg-region-overview>
        </ens-reg-region-overview-popup-injector>
        <ens-reg-zoom-buttons
          .start=${this.start}
          .end=${this.end}
          .regionLength=${CHROMOSOME_LENGTH}
          @viewport-change=${this.onViewportChange}
        ></ens-reg-zoom-buttons>
      </div>
    `;
  }
}

import { html, css, LitElement} from 'lit';
import { customElement, state } from 'lit/decorators.js';

// not using the RegionOverview class directly,
// but importing it so that the component gets initialized
import '@ensembl/ensembl-regulation/region-overview';
import '@ensembl/ensembl-regulation/popup-injector';
import './zoomButtons';

import { pickData } from './services/filterData';
import chromosome1Data from './data/chr1-data.json';

import type { OverviewRegion } from '@ensembl/ensembl-regulation/region-overview';

import '@ensembl/ensembl-elements-common/styles/fonts.css';

// length of chromosome 1
const CHROMOSOME_LENGTH = 248956422;

// A five-megabase viewport into chromosome 1
// const INITIAL_START = 60_000_000;
// const INITIAL_END = 65_000_000;
const INITIAL_START = 852_188;
const INITIAL_END = 863_869;

// A location on chromosome 1 that has two features (promoter and enhancer) next to one another
// Useful to make sure:
// - There is no empty space between the features when they are rendered
// - The extended start / extended end is taken into account when feature is rendered into view
// const INITIAL_START = 609382;
// const INITIAL_END = 609403;


@customElement('regulation-playground')
export class RegulationPlayground extends LitElement {
  static styles = css`
    .grid {
      display: grid;
      grid-template-columns: [left] 150px [middle] 1fr [right] 150px;
      margin-top: 2em;
    }

    ens-reg-region-annotation {
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

  onTrackPositionsChange = (event: CustomEvent) => {
    console.log('track positions:', event.detail);
  }

  render() {
    const data = pickData({
      data: chromosome1Data as OverviewRegion,
      start: this.start,
      end: this.end
    });

    return html`
      <h1>This should test region overview rendering using svg</h1>
      <div class="grid">
        <div>
          ${this.start}-${this.end}
        </div>
        <ens-reg-region-overview-popup-injector>
          <ens-reg-region-annotation
            @viewport-change=${this.onViewportChange}
            @ens-reg-track-positions=${this.onTrackPositionsChange}
            .start=${this.start}
            .end=${this.end}
            .regionName=${"1"}
            .regionLength=${CHROMOSOME_LENGTH}
            .data=${data}>
          </ens-reg-region-annotation>
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

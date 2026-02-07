import { html, LitElement} from 'lit';
import { customElement, state } from 'lit/decorators.js';

import { fetchEpigenomeActivityData } from './data/fetchData'; 

import '../../epigenome-activity/epigenome-activity';

import '@ensembl/ensembl-elements-common/styles/resets.css';
import '@ensembl/ensembl-elements-common/styles/fonts.css';
import '@ensembl/ensembl-elements-common/styles/global.css';
import '@ensembl/ensembl-elements-common/styles/custom-properties.css';

import type { TrackData, TrackMetadata, TrackPositionsPayload } from '../../epigenome-activity/types';


const INITIAL_START = 26_291_508;
const INITIAL_END = 26_372_680;

@customElement('epigenomes-activity-playground')
export class RegulationPlayground extends LitElement {

  @state()
  tracks: TrackData[] = [];

  @state()
  trackMetadata: TrackMetadata | null = null;

  connectedCallback() {
    super.connectedCallback();
    fetchEpigenomeActivityData({ start: INITIAL_START, end: INITIAL_END })
      .then((data) => {
        this.tracks = data.track_data;
        this.trackMetadata = data.track_metadata
      });
  }

  #onTrackPositionsChange = (event: CustomEvent<TrackPositionsPayload>) => {
    console.log('Track positions changed:', event.detail);
  }

  render() {
    return html`
      <ens-reg-epigenome-activity
        .trackMetadata=${this.trackMetadata}
        .tracks=${this.tracks}
        .start=${INITIAL_START}
        .end=${INITIAL_END}
        @track-positions-change=${this.#onTrackPositionsChange}
      ></ens-reg-epigenome-activity>
    `;
  }
}

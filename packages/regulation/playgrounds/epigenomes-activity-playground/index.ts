import { html, css, LitElement} from 'lit';
import { customElement, state } from 'lit/decorators.js';

import epigenomeActivityData from './data/activity.json';

import '../../epigenome-activity/epigenome-activity';

import '@ensembl/ensembl-elements-common/styles/resets.css';
import '@ensembl/ensembl-elements-common/styles/fonts.css';
import '@ensembl/ensembl-elements-common/styles/global.css';
import '@ensembl/ensembl-elements-common/styles/custom-properties.css';

// For location 17:63992802-64038237
const INITIAL_START = 63_992_802;
const INITIAL_END = 64_038_237;

@customElement('epigenomes-activity-playground')
export class RegulationPlayground extends LitElement {

  render() {
    const { track_data, track_metadata } = epigenomeActivityData;

    console.log('track_data', track_data);

    return html`
      <ens-reg-epigenome-activity
        .trackMetadata=${track_metadata}
        .tracks=${track_data}
        .start=${INITIAL_START}
        .end=${INITIAL_END}
      ></ens-reg-epigenome-activity>
    `;
  }
}

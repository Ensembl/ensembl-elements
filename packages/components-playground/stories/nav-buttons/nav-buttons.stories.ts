import '@ensembl/ensembl-elements-common/components/nav-buttons/button-left.js';
import '@ensembl/ensembl-elements-common/components/nav-buttons/button-right.js';
import '@ensembl/ensembl-elements-common/components/nav-buttons/button-zoom-in.js';
import '@ensembl/ensembl-elements-common/components/nav-buttons/button-zoom-out.js';
import '@ensembl/ensembl-elements-common/components/nav-buttons/nav-buttons.js';

import './nav-buttons.stories.css';


export default {
  title: 'Common/NavButtons'
};

export const IndividualButtons = () => {
  const element = document.createElement('div');
  const innerHtml = `
    <div>
      <p>
        Move left
      </p>
      <ens-nav-button-left></ens-nav-button-left>
      <ens-nav-button-left disabled></ens-nav-button-left>
    </div>
    <div>
      <p>
        Move right
      </p>
      <ens-nav-button-right></ens-nav-button-right>
      <ens-nav-button-right disabled></ens-nav-button-right>
    </div>
    <div>
      <p>
        Zoom in
      </p>
      <ens-nav-button-zoom-in></ens-nav-button-zoom-in>
      <ens-nav-button-zoom-in disabled></ens-nav-button-zoom-in>
    </div>
    <div>
      <p>
        Zoom out
      </p>
      <ens-nav-button-zoom-out></ens-nav-button-zoom-out>
      <ens-nav-button-zoom-out disabled></ens-nav-button-zoom-out>
    </div>
  `;
  element.innerHTML = innerHtml;
  return element;
};

export const FourButtons = () => {
  const element = document.createElement('div');
  const innerHtml = `
    <div>
      <p>
        Default
      </p>
      <ens-nav-buttons></ens-nav-buttons>
    </div>
    <div>
      <p>
        Some buttons disabled
      </p>
      <div class="column">
        <ens-nav-buttons disabled-move-left></ens-nav-buttons>
        <ens-nav-buttons disabled-move-right></ens-nav-buttons>
        <ens-nav-buttons disabled-zoom-out></ens-nav-buttons>
        <ens-nav-buttons disabled-zoom-in></ens-nav-buttons>
        <ens-nav-buttons disabled-move-right disabled-zoom-in></ens-nav-buttons>
      </div>
    </div>
    <div>
      <p>
        Direct button styling
      </p>
      <div>
        <ens-nav-buttons class="custom-styling"></ens-nav-buttons>
      </div>
    </div>
  `;
  element.innerHTML = innerHtml;
  return element;
};
import '@ensembl/ensembl-elements-common/components/spinner/spinner.js';

import './spinner.stories.css';

export default {
  title: 'Common/Spinner'
};

export const Default = () => {
  const element = document.createElement('div');
  const innerHtml = `
    <div>
      <div>
        <p>Default spinner</p>
        <ens-spinner></ens-spinner>
      </div>
      <div>
        <p>Cusomised size (smaller)</p>
        <ens-spinner class="small-spinner"></ens-button>
      </div>
      <div>
        <p>Cusomised size (larger), thickness, and colours</p>
        <ens-spinner class="custom-spinner"></ens-button>
      </div>
    </div>
  `;
  element.innerHTML = innerHtml;
  return element;
};
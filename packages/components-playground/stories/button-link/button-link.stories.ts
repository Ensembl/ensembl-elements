import '@ensembl/ensembl-elements-common/components/button-link/button-link.js';
import '@ensembl/ensembl-elements-common/components/button/button.js';

import './button-link.stories.css';

export default {
  title: 'Common/ButtonLink'
};

export const Default = () => {
  const element = document.createElement('div');
  const innerHtml = `
    <div class="grid">
      <span class="column-head">
        Button link
      </span>
      <span class="column-head">
        Regular button
      </span>
      <ens-button-link href="/">
        Brand
      </ens-button-link>
      <ens-button>
        Brand
      </ens-button>
      <ens-button-link href="/" variant="action">
        Action
      </ens-button-link>
      <ens-button variant="action">
        Action
      </ens-button>
      <ens-button-link href="/" disabled>
        Disabled
      </ens-button-link>
      <ens-button disabled>
        Disabled
      </ens-button>
    </div>
  `;
  element.innerHTML = innerHtml;
  return element;
};
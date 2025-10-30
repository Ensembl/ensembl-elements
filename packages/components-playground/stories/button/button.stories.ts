import '@ensembl/ensembl-elements-common/components/button/button.js';

import './button.stories.css';

export default {
  title: 'Common/Button'
};

export const Default = () => {
  const element = document.createElement('div');
  const innerHtml = `
    <div>
      <ens-button>
        Brand
      </ens-button>
      <ens-button variant="action">
        Action
      </ens-button>
      <ens-button class="custom-button">
        Customized
      </ens-button>
    </div>
  `;
  element.innerHTML = innerHtml;
  return element;
};
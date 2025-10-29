import '@ensembl/ensembl-elements-common/components/text-button/text-button.js';

import './text-button.stories.css';

export default {
  title: 'Common/Text button'
};

export const Default = () => {
  const element = document.createElement('div');
  const innerHtml = `
    <div>
      <ens-text-button>
        Text button
      </ens-text-button>
    </div>
    <div>
      <ens-text-button class="custom-button">
        Customised text button
      </ens-text-button>
    </div>
  `;
  element.innerHTML = innerHtml;
  return element;
};
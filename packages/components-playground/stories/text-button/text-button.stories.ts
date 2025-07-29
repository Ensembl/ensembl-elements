import '@ensembl/ensembl-elements-common/components/text-button/text-button.js';

export default {
  title: 'Common/Text button'
};

export const Default = () => {
  const element = document.createElement('div');
  const innerHtml = `
    <ens-text-button>
      Text button
    </ens-text-button>
  `;
  element.innerHTML = innerHtml;
  return element;
};
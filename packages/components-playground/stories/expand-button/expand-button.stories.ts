import '@ensembl/ensembl-elements-common/components/icon-buttons/expand-button/expand-button.js';

export default {
  title: 'Common/Expand button'
};

export const Default = () => {
  const element = document.createElement('div');
  const innerHtml = `
    <ens-expand-button label="This is expand button with a custom label">
    </ens-expand-button>
  `;
  element.innerHTML = innerHtml;
  return element;
};

export const Disabled = () => {
  const element = document.createElement('div');
  const innerHtml = `
    <ens-expand-button disabled>
    </ens-expand-button>
  `;
  element.innerHTML = innerHtml;
  return element;
};
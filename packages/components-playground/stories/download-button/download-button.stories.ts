import '@ensembl/ensembl-elements-common/components/icon-buttons/download-button/download-button.js';

export default {
  title: 'Common/Download button'
};

export const Default = () => {
  const element = document.createElement('div');
  const innerHtml = `
    <ens-download-button label="This is download button with a custom label">
    </ens-download-button>
  `;
  element.innerHTML = innerHtml;
  return element;
};

export const Disabled = () => {
  const element = document.createElement('div');
  const innerHtml = `
    <ens-download-button disabled>
    </ens-download-button>
  `;
  element.innerHTML = innerHtml;
  return element;
};
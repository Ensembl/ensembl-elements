import '@ensembl/ensembl-elements-common/components/icon-buttons/delete-button/delete-button.js';

export default {
  title: 'Common/Delete button'
};

export const Default = () => {
  const element = document.createElement('div');
  const innerHtml = `
    <ens-delete-button data-aria-label="This is delete button with a custom aria label">
    </ens-delete-button>
  `;
  element.innerHTML = innerHtml;
  return element;
};

export const Disabled = () => {
  const element = document.createElement('div');
  const innerHtml = `
    <ens-delete-button disabled>
    </ens-delete-button>
  `;
  element.innerHTML = innerHtml;
  return element;
};
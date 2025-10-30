import '@ensembl/ensembl-elements-common/components/icon-buttons/table-view-button/table-view-button.js';

export default {
  title: 'Common/Table view button'
};

export const Default = () => {
  const element = document.createElement('div');
  const innerHtml = `
    <ens-table-view-button label="This is table view button with a custom label">
    </ens-table-view-button>
  `;
  element.innerHTML = innerHtml;
  return element;
};

export const Disabled = () => {
  const element = document.createElement('div');
  const innerHtml = `
    <ens-table-view-button disabled>
    </ens-table-view-button>
  `;
  element.innerHTML = innerHtml;
  return element;
};
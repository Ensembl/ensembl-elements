import '@ensembl/ensembl-elements-common/embl-ebi-components/page-header/page-header.js';

export default {
  title: 'EMBL-EBI/Page header'
};

export const Default = () => {
  const element = document.createElement('div');
  const innerHtml = `
    <embl-ebi-page-header>
    </embl-ebi-page-header>
  `;
  element.innerHTML = innerHtml;
  return element;
};


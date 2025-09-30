import '@ensembl/ensembl-elements-common/embl-ebi-components/page-footer/page-footer.js';

export default {
  title: 'EMBL-EBI/Page footer'
};

export const Default = () => {
  const element = document.createElement('div');
  const innerHtml = `
    <embl-ebi-page-footer>
    </embl-ebi-page-footer>
  `;
  element.innerHTML = innerHtml;
  return element;
};


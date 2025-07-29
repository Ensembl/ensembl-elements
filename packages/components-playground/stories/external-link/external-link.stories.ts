import '@ensembl/ensembl-elements-common/components/external-link/external-link.js';

export default {
  title: 'Common/External link'
};

export const Default = () => {
  const element = document.createElement('div');
  const innerHtml = `
    <ens-external-link href="https://www.ebi.ac.uk/ena/browser/view/GCA_000001405.29">
      GCA_000001405.29
    </ens-external-link>
  `;
  element.innerHTML = innerHtml;
  return element;
};
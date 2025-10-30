import '@ensembl/ensembl-elements-common/components/external-link/external-link.js';

export default {
  title: 'Common/External link'
};

export const Another = () => {
  const element = document.createElement('div');
  const innerHtml = `
    <div>
      Checking whether there will be any problems with custom elements declaration.
    </div>
    <ens-external-link href="https://www.ebi.ac.uk/ena/browser/view/GCA_000001405.29">
      GCA_000001405.29
    </ens-external-link>
  `;
  element.innerHTML = innerHtml;
  return element;
};
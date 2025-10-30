import '@ensembl/ensembl-elements-common/components/loading-button/loading-button.js';

export default {
  title: 'Common/LoadingButton'
};

export const Default = () => {
  const element = document.createElement('div');
  const innerHtml = `
    <div>
      <ens-loading-button>
        Download
      </ens-loading-button>
    </div>
  `;
  element.innerHTML = innerHtml;
  return element;
};
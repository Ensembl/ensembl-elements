import '@ensembl/ensembl-elements-common/components/paginator/paginator.js';

export default {
  title: 'Common/Paginator'
};

export const Default = () => {
  const element = document.createElement('div');
  const innerHtml = `
    <ens-paginator current-page="2" total-pages="9"></ens-paginator>
  `;
  element.innerHTML = innerHtml;
  const paginatorElement = element.querySelector('ens-paginator');
  paginatorElement.addEventListener('ens-paginator-page-change', (event: CustomEvent<number>) => {
    const paginator = event.target as HTMLElement;
    const newPage = event.detail;
    paginator.setAttribute('current-page', `${newPage}`);
  });
  return element;
};



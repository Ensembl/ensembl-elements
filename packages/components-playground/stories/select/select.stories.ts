import '@ensembl/ensembl-elements-common/components/select/select.js';

export default {
  title: 'Common/Select'
};

export const Default = () => {
  const element = document.createElement('div');
  const innerHtml = `
    <ens-select>
      <select>
        <option value="one">One</option>
        <option value="two">Two</option>
        <option value="three">Three</option>
      </select>
    </ens-select>
  `;
  element.innerHTML = innerHtml;
  const selectElement = element.querySelector('ens-select');
  selectElement.addEventListener('change', (event: Event) => {
    console.log('heard change event', event)
  });
  return element;
};



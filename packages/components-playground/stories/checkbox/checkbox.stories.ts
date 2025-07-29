import '@ensembl/ensembl-elements-common/components/checkbox/checkbox.js';
import '@ensembl/ensembl-elements-common/components/checkbox/checkbox-only.js';

export default {
  title: 'Common/Checkbox'
};

export const Default = () => {
  const element = document.createElement('div');
  const innerHtml = `
    <div>
      <p>Checkbox with label</p>
      <ens-checkbox>
        Hello
      </ens-checkbox>
    </div>
    <div>
      <p>Checkbox without label</p>
      <ens-checkbox-only data-aria-label="Hello from checkbox one"></ens-checkbox-only>
      <ens-checkbox-only aria-label="Hello from checkbox two"></ens-checkbox-only>
    </div>
  `;
  element.innerHTML = innerHtml;
  const firstCheckbox = element.querySelector('ens-checkbox');
  firstCheckbox.addEventListener('change', () => { console.log('heard change!') })
  return element;
};







// export const Default = () => {
//   const element = document.createElement('div');
//   const innerHtml = `
//     <ens-checkbox>
//       <label>
//         <input type="checkbox" />
//         Hello
//       </label>
//     </ens-checkbox>
//   `;
//   element.innerHTML = innerHtml;
//   return element;
// };
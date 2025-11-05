import '@ensembl/ensembl-elements-common/components/checkbox/checkbox.js';
import '@ensembl/ensembl-elements-common/components/checkbox/checkbox-only.js';

import '@ensembl/ensembl-elements-common/components/button/button.js';

import { EnsCheckbox } from '@ensembl/ensembl-elements-common/components/checkbox/checkbox.js';

import './checkbox.stories.css';

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
      <p>A checkbox that is ticked from the start</p>
      <ens-checkbox checked>
        Hello
      </ens-checkbox>
    </div>
    <div>
      <p>Checkbox without label</p>
      <ens-checkbox-only data-aria-label="Hello from checkbox one"></ens-checkbox-only>
      <ens-checkbox-only aria-label="Hello from checkbox two"></ens-checkbox-only>
    </div>
    <div>
      <p>Checkbox with a wrapping label</p>
      <ens-checkbox class="checkbox-with-wrapping">
        United Kingdom of Great Britain and Northern Ireland
      </ens-checkbox>
    </div>
    <div>
      <p>Programmatically controlled checkbox</p>
      <ens-button id="checkbox-controller">
        Click me
      </ens-button>
      <ens-checkbox-only data-aria-label="Checkbox controlled programmatically"></ens-checkbox-only>
    </div>
  `;
  element.innerHTML = innerHtml;
  const firstCheckbox = element.querySelector('ens-checkbox');
  firstCheckbox.addEventListener('change', () => { console.log('heard change!') });

  const checkboxControllerButton = element.querySelector('#checkbox-controller');
  const controlledCheckbox = checkboxControllerButton.nextElementSibling as EnsCheckbox;
  checkboxControllerButton.addEventListener('click', () => {
    controlledCheckbox.checked = !controlledCheckbox.checked;
  });

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
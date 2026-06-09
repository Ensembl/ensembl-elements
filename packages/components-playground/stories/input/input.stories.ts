import '@ensembl/ensembl-elements-common/components/input/input.js';

import type { EnsInput } from '@ensembl/ensembl-elements-common/components/input/input.js';

import './input.stories.css';

export const Default = () => {
  const element = document.createElement('div');
  const innerHtml = `
    <div class="example">
      <p class="title">Input with label</p>
      <ens-input label="Label for this input">
      </ens-input>
    </div>
    <div class="example" id="example-update-content">
      <p class="title">Content can be updated from outside</p>
      <div>
        <button>Update content</button>
      </div>
      <ens-input></ens-input>
    </div>
    <div class="example" id="test-plain-input">
      <p class="title">Plain input for comparison</p>
      <div>
        <button>Update content</button>
      </div>
      <input type="text" />
    </div>
  `;

  element.innerHTML = innerHtml;

  const buttonToUpdateContent = element.querySelector('#example-update-content button') as HTMLButtonElement;
  const inputToUpdateContent = element.querySelector('#example-update-content ens-input') as EnsInput;
  buttonToUpdateContent.addEventListener('click', () => {
    inputToUpdateContent.value = 'new value';
    console.log('button clicked');
  });


  const plainInputUpdateButton = element.querySelector('#test-plain-input button') as HTMLButtonElement;
  const plainInput = element.querySelector('#test-plain-input input') as HTMLInputElement;
  plainInputUpdateButton.addEventListener('click', () => {
    plainInput.value = 'new value';
    console.log('plain input button clicked');
  });



  return element;
};

export const Shaded = () => {
  const element = document.createElement('div');
  const innerHtml = `
    <div class="example">
      <p class="title">Input without label</p>
      <ens-input id="first" appearance="shaded" data-aria-label="label for the input">
      </ens-input>
    </div>
    <div class="example">
      <p class="title">Input with a label</p>
      <ens-input id="first" label="Label for this input" appearance="shaded" placeholder="placeholder text">
      </ens-input>
    </div>
    <div class="example">
      <p class="title">
        Large input with a label (should be taller than the regular one)
      </p>
      <ens-input id="first" label="Label for this input" appearance="shaded" size="large">
      </ens-input>
    </div>
  `;
  element.innerHTML = innerHtml;

  return element;
};


export default {
  title: 'Common/Input'
};
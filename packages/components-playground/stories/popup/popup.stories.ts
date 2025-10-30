import '@ensembl/ensembl-elements-common/components/popup/popup.js';

import './popup-varieties.css';
import './popup-positioning.css';
import './popup-virtual-element.css';

export default {
  title: 'Common/Popup'
};

export const Default = () => {
  const container = document.createElement('div');
  const innerHtml = `
    <button>
      Click me
    </button>
  `;
  container.innerHTML = innerHtml;
  
  const button = container.querySelector('button');
  button.addEventListener('click', (event) => {
    const buttonElement = event.target as HTMLButtonElement;
    const popup = document.createElement('ens-popup');
    popup.anchor = buttonElement;
    popup.innerHTML = 'I am popup';
    container.appendChild(popup);
  });

  return container;
};


export const Positioning = () => {
  const rootElement = document.createElement('div');
  rootElement.classList.add('popup-positioning-story');

  const template = `
    <div>
      <button>
        Click me
      </button>
    </div>
    
    <div>
      <label for="popup-positioning-options">
        Select positioning
      </label>
      <select id="popup-positioning-options">
        <option value="top">Top</option>
        <option value="bottom" selected>Bottom</option>
        <option value="left">Left</option>
        <option value="right">Right</option>
      </select>
    </div>
  `;

  rootElement.innerHTML = template;
  const anchorButton = rootElement.querySelector('button') as HTMLButtonElement;
  const positionSelector = rootElement.querySelector('select') as HTMLSelectElement;

  let isPopupActive = false;

  anchorButton.addEventListener('click', () => {
    if (!isPopupActive) {
      showPopup();
      isPopupActive = true;
    } else {
      hidePopup();
      isPopupActive = false;
    }
  });

  positionSelector.addEventListener('change', () => {
    if (isPopupActive) {
      hidePopup();
      showPopup();
    }
  });

  const showPopup = () => {
    const popup = document.createElement('ens-popup');
    popup.anchor = anchorButton;
    popup.placement = positionSelector.value as any;
    popup.innerText = 'Hello sailor';
    rootElement.appendChild(popup);
  };

  const hidePopup = () => {
    const popup = rootElement.querySelector('ens-popup');
    popup.remove();
  };

  return rootElement;
};

export const VirtualElement = () => {
  const rootElement = document.createElement('div');
  rootElement.classList.add('popup-virtual-element-story');

  const template = `
    <h1>
      Click anywhere within the rectangle below
    </h1>

    <div class="target-area"></div>
  `;

  rootElement.innerHTML = template;
  const targetArea = rootElement.querySelector('.target-area');

  const hidePopup = () => {
    const popup = rootElement.querySelector('ens-popup');
    if (popup) {
      popup.remove();
    }
  };

  targetArea.addEventListener('click', (event: MouseEvent) => {
    hidePopup();

    const { clientX, clientY } = event;

    const virtualEl = {
      getBoundingClientRect() {
        return {
          width: 0,
          height: 0,
          x: clientX,
          y: clientY,
          top: clientY,
          left: clientX,
          right: clientX,
          bottom: clientY
        };
      },
    };

    const popup = document.createElement('ens-popup');
    popup.anchor = virtualEl;
    popup.innerText = "Hello world";
    targetArea.append(popup);
  });

  return rootElement;
}


export const Varieties = () => {
  const rootElement = document.createElement('div');
  rootElement.classList.add('popup-varieties-story');

  const template = `
    <div class="overflow-container">
      <div class="anchors-container">
        <button class="anchor-button top-left" data-text="TOP LEFT"></button>
        <button class="anchor-button top-right" data-text="TOP RIGHT"></button>
        <button class="anchor-button left-top" data-text="LEFT TOP"></button>
        <button class="anchor-button left-bottom" data-text="LEFT BOTTOM"></button>
        <button class="anchor-button bottom-left" data-text="BOTTOM LEFT"></button>
        <button class="anchor-button bottom-right" data-text="BOTTOM RIGHT"></button>
        <button class="anchor-button right-top" data-text="RIGHT TOP"></button>
        <button class="anchor-button right-bottom" data-text="RIGHT BOTTOM"></button>
      </div>
    </div>
  `;

  rootElement.innerHTML = template;
  rootElement.addEventListener('click', (event) => {
    const currentPopup = rootElement.querySelector('ens-popup') as HTMLElement;
    if (currentPopup) {
      currentPopup.remove();
    }

    const targetEl = event.target as HTMLElement;
    if (targetEl.classList.contains('anchor-button')) {
      const text = targetEl.dataset.text;
      const popup = document.createElement('ens-popup');
      popup.anchor = targetEl;
      popup.innerText = text;
      rootElement.append(popup);
    }
  });

  return rootElement;
};
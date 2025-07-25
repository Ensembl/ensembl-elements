import {html, css, LitElement} from 'lit';
import { customElement, state } from 'lit/decorators.js';

import './test.css';

@customElement('my-web-component')
export class MyWebComponent extends LitElement {

  render() {
    return html`
      <a href="">
        <slot>
        </slot>
      </a>
    `
  }
}

@customElement('my-wrapper-component')
export class MyWrapperComponent extends LitElement {

  onClick = (event: Event) => {
    console.log('event', event.target);
  }

  render() {
    return html`
      <button aria-label="Different label for a button">
        Regular button
      </button>

      <my-web-component @click=${this.onClick} aria-label="My custom component">
        Hello?
      </my-web-component>


      <my-light-web-component>
        Hello?
      </my-light-web-component>

      <div>
        <a href="">This is my link inside of shadow DOM</a>
      </div>
    `
  }
}


// Define your web component
class MyLightWebComponent extends HTMLElement {
  connectedCallback() {
    this.innerHTML = '<p>This is my web component using the light DOM</p>';
  }
}
  
// Register your web component
customElements.define('my-light-web-component', MyLightWebComponent);




export default {
  title: 'Example/My-Component'
};

export const Default = () => {
  const element = document.createElement('div');
  const innerHtml = `
    <div style="margin-bottom: 2rem;">
      <a href="">This is my link in the open</a>
    </div>

    <my-wrapper-component></my-wrapper-component>
  `;
  element.innerHTML = innerHtml;
  return element;


  // return document.createElement('my-wrapper-component');
};
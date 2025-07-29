import {html, css, unsafeCSS, nothing, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';

import resetStyles from '../../styles/resets.css?raw';
import checkboxStyles from './checkbox.css?raw';

@customElement('ens-checkbox-only')
export class CheckboxOnly extends LitElement {

  #internals: ElementInternals;

  static styles = [
    unsafeCSS(resetStyles),
    unsafeCSS(checkboxStyles),
    css`
      :host {
        display: inline-block;
      }
    `
  ];

  constructor() {
    super();
    this.#internals = this.attachInternals();
  }

  render() {
    // Idea for passing the aria-label attribute through a data attribute
    // borrowed from the Material Web library
    // (https://material-web.dev/components/checkbox/)
    const ariaLabel = this.dataset.ariaLabel;

    return html`
      <input id="input" type="checkbox" aria-label=${ariaLabel ?? nothing} />
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ens-checkbox-only': CheckboxOnly;
  }
}
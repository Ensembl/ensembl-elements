import {html, css, unsafeCSS, nothing, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';

import resetStyles from '../../styles/resets.css?raw';
import checkboxStyles from './checkbox.css?raw';

// https://dev.to/stuffbreaker/custom-forms-with-web-components-and-elementinternals-4jaj

// https://github.com/w3c/csswg-drafts/issues/6867

@customElement('ens-checkbox')
export class Checkbox extends LitElement {

  checked: boolean;

  #internals: ElementInternals;

  static styles = [
    unsafeCSS(resetStyles),
    unsafeCSS(checkboxStyles),
    css`
      :host {
        display: inline-block;
      }

      :host label {
        margin-left: 0.4rem;
        user-select: none;
        cursor: pointer;
      }

      :host:has(input:disabled) label {
        cursor: default;
      }
    `
  ];

  constructor() {
    super();
    this.#internals = this.attachInternals();
  }

  onChange(event: Event) {
    const eventTarget = event.target as HTMLInputElement;
    this.checked = eventTarget.checked;

    // re-dispatch the change event so that it can cross the shadow boundary
    const newEvent = new Event(event.type);
    this.dispatchEvent(newEvent);
  }

  render() {
    // Idea for passing the aria-label attribute through a data attribute
    // borrowed from the Material Web library
    // (https://material-web.dev/components/checkbox/)
    const ariaLabel = this.dataset.ariaLabel;

    return html`
      <input
        id="input"
        type="checkbox"
        aria-label=${ariaLabel ?? nothing}
        @change=${this.onChange}
      />
      <label for="input">
        <slot></slot>
      </label>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ens-checkbox': Checkbox;
  }
}
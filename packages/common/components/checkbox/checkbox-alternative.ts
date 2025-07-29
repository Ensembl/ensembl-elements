import {html, css, unsafeCSS, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import resetStyles from '../../styles/resets.css?raw';

// https://dev.to/stuffbreaker/custom-forms-with-web-components-and-elementinternals-4jaj


/**
 * This is a temporary file to investigate an alternative approach to the component
 * (slotting of the input and the label)
 */



@customElement('ens-checkbox')
export class Checkbox extends LitElement {

  static styles = [
    css`
      ::slotted(input) {
        appearance: none;
        background-color: var(--checkbox-background-color, var(--color-white));
        border: 1px solid var(--checkbox-border-color, var(--color-grey));
        height: var(--checkbox-side-size, 13px);
        width: var(--checkbox-side-size, 13px);
        transition: background-color 0.1s ease-in-out;
        cursor: pointer;
      }

      ::slotted(input:checked) {
        background-color: var(--checkbox-checked-background-color, var(--color-green));
      }

      ::slotted(input:disabled) {
        border-color: var(--checkbox-disabled-border-color, var(--color-medium-light-grey));
        background-color: var(--checkbox-disabled-background-color, var(--color-light-grey));
        cursor: default;
        pointer-events: none;
      }
    `
  ];

  render() {
    return html`
      <slot>
      </slot>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ens-checkbox-alternative': Checkbox;
  }
}
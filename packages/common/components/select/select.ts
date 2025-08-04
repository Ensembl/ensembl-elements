import {html, css, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';

import resetStyles from '../../styles/constructable-stylesheets/resets';

/**
 * NOTE: We should make use of customizable select elements,
 * when browser support improves (currently not supported in Firefox and Safari)
 */

@customElement('ens-select')
export class Select extends LitElement {

  static styles = [
    resetStyles,
    css`
      :host {
        display: inline-block;
        position: relative;
        min-width: var(--select-min-width, 7ch);
        max-width: var(--select-max-width, 30ch);
        background-color: var(--select-background-color, var(--color-white));
      }

      :host::after {
        content: '';
        position: absolute;
        right: 10px;
        top: 50%;
        transform: translateY(-25%);
        width: 0.8em;
        height: 0.5em;
        background-color: var(--select-arrowhead-color, var(--color-blue));
        clip-path: polygon(
          100% 0%,
          0 0%,
          50% 100%
        ); /* idea from https://moderncss.dev/custom-select-styles-with-pure-css */
      }

      :host[disabled]::after {
        background-color: var(--select-disabled-arrowhead-color, var(--color-grey));
      }

      ::slotted(select) {
        /* Hide the native select element, and position it right over the custom one, to catch user's clicks */
        appearance: none;
        position: relative;
        z-index: 1;
        
        /* Additional resets for further consistency */
        background-color: transparent;
        border: var(--select-border, 1px solid var(--color-blue));
        padding: 3px 25px 3px 10px;
        margin: 0;
        width: 100%;
        cursor: pointer;
      }

      :host[disabled] select {
        border: var(--select-disabled-border, 1px solid var(--color-grey));
      }
    `
  ];

  render() {
    return html`
      <slot></slot>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ens-select': Select;
  }
}
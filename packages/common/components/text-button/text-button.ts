import { html, css, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import resetStyles from '../../styles/constructable-stylesheets/resets';
import buttonResetStyles from '../../styles/constructable-stylesheets/button-resets';

@customElement('ens-text-button')
export class TextButton extends LitElement {

  static styles = [
    resetStyles,
    buttonResetStyles,
    css`
      :host {
        display: inline-block;
        line-height: 1;
      }

      button {
        font-family: inherit;
        color: var(--text-button-color, var(--color-blue));
      }

      button[disabled] {
        color: var(--text-button-disabled-color, var(--color-medium-dark-grey));
      }
    `
  ];

  @property({ type: Boolean }) disabled = false;

  render() {
    return html`
      <button
        type="button"
        ?disabled=${this.disabled}
      >
        <slot>
        </slot>
      </button>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ens-text-button': TextButton;
  }
}
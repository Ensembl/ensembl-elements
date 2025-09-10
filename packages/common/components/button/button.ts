import {html, css, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import resetStyles from '../../styles/constructable-stylesheets/resets';
import buttonResetStyles from '../../styles/constructable-stylesheets/button-resets';

@customElement('ens-button')
export class EnsButton extends LitElement {

  static styles = [
    resetStyles,
    buttonResetStyles,
    css`
      :host {
        display: inline-block;
        line-height: 1;
      }
      
      button {
        color: var(--button-text-color, var(--color-white));
        font-weight: var(--font-weight-bold);
        padding: 7px 18px;
        border-radius: 4px;
      }

      :not(:host([variant])) button,
      :host([variant="brand"]) button {
        background-color: var(--brand-button-color, var(--color-blue));
      }

      :host([variant="action"]) button {
        background-color: var(--action-button-color, var(--color-green));
      }

      button[disabled] {
        background-color: var(--disabled-button-color, var(--color-medium-dark-grey));
      }
    `
  ];

  @property({ type: Boolean })
  disabled = false;

  @property({ type: String })
  type: "button" | "submit" | "reset" | "menu" = 'button';

  render() {
    return html`
      <button
        type=${this.type}
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
    'ens-button': EnsButton;
  }
}
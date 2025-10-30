import { html, css, LitElement } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';

import resetStyles from '../../styles/constructable-stylesheets/resets';
import buttonResetStyles from '../../styles/constructable-stylesheets/button-resets';

/**
 * The api for this component - a single component with a `variant` attribute -
 * was inspired by the same approach taken by the Shoelace (Web Awesome) library.
 * See https://webawesome.com/docs/components/button
 */

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
        color: var(--color-white);
        font-weight: var(--font-weight-bold);
        padding: 7px 18px;
        border-radius: 4px;
      }

      :not(:host([variant])) button,
      :host([variant="brand"]) button {
        background-color: var(--color-blue);
      }

      :host([variant="action"]) button {
        background-color: var(--color-green);
      }

      :host([disabled]) button {
        background-color: var(--color-medium-dark-grey);
      }
    `
  ];

  @property({ type: Boolean })
  disabled = false;

  @property({ type: String })
  type: "button" | "submit" | "reset" | "menu" = 'button';

  @query('button')
  button!: HTMLButtonElement;

  focus(options: FocusOptions) {
    this.button.focus(options);
  }

  render() {
    return html`
      <button
        part="button"
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
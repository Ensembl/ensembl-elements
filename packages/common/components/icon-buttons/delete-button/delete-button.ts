import {html, css, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';

import icon from '../../../icons/icon_delete.svg?raw';

import resetStyles from '../../../styles/constructable-stylesheets/resets';
import buttonResetStyles from '../../../styles/constructable-stylesheets/button-resets';

@customElement('ens-delete-button')
export class DeleteButton extends LitElement {

  static styles = [
    resetStyles,
    buttonResetStyles,
    css`
      :host {
        display: inline-block;
        line-height: 1;
        font-size: 0;
        height: var(--delete-button-size, 18px);
        width: var(--delete-button-size, 18px);
        fill: var(--delete-button-color, var(--color-blue));
      }

      svg {
        width: 100%;
        height: 100%;
      }

      button[disabled] svg {
        fill: var(--delete-button-disabled-color, var(--color-grey));
      }
    `
  ];

  @property({ type: Boolean }) disabled = false;

  render() {
    const ariaLabel = this.dataset.ariaLabel ?? 'Delete';

    return html`
      <button
        type="button"
        ?disabled=${this.disabled}
        aria-label=${ariaLabel}
      >
        ${unsafeSVG(icon)}
      </button>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ens-delete-button': DeleteButton;
  }
}
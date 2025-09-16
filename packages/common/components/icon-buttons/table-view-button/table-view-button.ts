import { html, css, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';

import icon from '../../../icons/icon_table.svg?raw';

import resetStyles from '../../../styles/constructable-stylesheets/resets';
import buttonResetStyles from '../../../styles/constructable-stylesheets/button-resets';

@customElement('ens-table-view-button')
export class TableViewButton extends LitElement {

  static styles = [
    resetStyles,
    buttonResetStyles,
    css`
      :host {
        display: inline-block;
        line-height: 1;
        font-size: 0;
        height: var(--table-view-button-size, 18px);
        width: var(--table-view-button-size, 18px);
        fill: var(--table-view-button-color, var(--color-blue));
      }

      svg {
        width: 100%;
        height: 100%;
      }

      button[disabled] svg {
        fill: var(--table-view-button-disabled-color, var(--color-grey));
      }
    `
  ];

  @property({ type: Boolean }) disabled = false;

  render() {
    const ariaLabel = this.dataset.ariaLabel ?? 'View table';

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
    'ens-table-view-button': TableViewButton;
  }
}
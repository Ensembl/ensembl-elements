import {html, css, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';

import icon from '../../../icons/icon_download.svg?raw';

import resetStyles from '../../../styles/constructable-stylesheets/resets';
import buttonResetStyles from '../../../styles/constructable-stylesheets/button-resets';

@customElement('ens-download-button')
export class DownloadButton extends LitElement {

  static styles = [
    resetStyles,
    buttonResetStyles,
    css`
      :host {
        display: inline-block;
        line-height: 1;
        font-size: 0;
        height: var(--download-button-size, 18px);
        width: var(--download-button-size, 18px);
        fill: var(--download-button-color, var(--color-blue));
      }

      svg {
        width: 100%;
        height: 100%;
      }

      button[disabled] svg {
        fill: var(--download-button-disabled-color, var(--color-grey));
      }
    `
  ];

  @property({ type: Boolean }) disabled = false;

  render() {
    const ariaLabel = this.dataset.ariaLabel ?? 'Download';

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
    'ens-download-button': DownloadButton;
  }
}
import { html, css, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';

import '../icon-button/icon-button';

import icon from '../../../icons/icon_download.svg?raw';

@customElement('ens-download-button')
export class DownloadButton extends LitElement {
  static styles = [
    css`
      :host {
        display: inline-flex;
      }
    `
  ];

  @property({ type: Boolean }) disabled = false;

  @property({ type: String })
  label = 'Download';

  render() {
    return html`
      <ens-icon-button
        ?disabled=${this.disabled}
        label=${this.label}
      >
        ${unsafeSVG(icon)}
      </ens-icon-button>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ens-download-button': DownloadButton;
  }
}
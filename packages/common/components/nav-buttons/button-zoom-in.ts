import { html, css, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';

import '../icon-buttons/icon-button/icon-button';

import icon from '../../icons/icon_plus_circle.svg?raw';

/**
 * If you need to change the colour:
 *  - for active button, use the --icon-button-color CSS variable
 *  - for disabled button, use the --icon-button-disabled-color CSS variable 
 */

@customElement('ens-nav-button-zoom-in')
export class NavButtonZoomIn extends LitElement {
  static styles = [
    css`
      :host {
        display: inline-flex;
      }
    `
  ];

  @property({ type: Boolean }) disabled = false;

  @property({ type: String })
  label = 'Move left';

  render() {
    return html`
      <ens-icon-button
        part="nav-button"
        exportparts="button"
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
    'ens-nav-button-zoom-in': NavButtonZoomIn;
  }
}
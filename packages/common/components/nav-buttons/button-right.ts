import { html, css, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';

import '../icon-buttons/icon-button/icon-button';

import icon from '../../icons/icon_chevron_circle.svg?raw';

/**
 * If you need to change the colour:
 *  - for active button, use the --icon-button-color CSS variable
 *  - for disabled button, use the --icon-button-disabled-color CSS variable 
 */

@customElement('ens-nav-button-right')
export class NavButtonRight extends LitElement {
  static styles = [
    css`
      :host {
        display: inline-flex;
      }

      svg {
        transform: rotate(-90deg);
      }
    `
  ];
  
  @property({ type: Boolean }) disabled = false;

  @property({ type: String })
  label = 'Move right';

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
    'ens-nav-button-right': NavButtonRight;
  }
}
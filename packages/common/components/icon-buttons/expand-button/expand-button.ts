import { html, css, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';

import '../icon-button/icon-button';

import icon from '../../../icons/icon_chevron.svg?raw';

@customElement('ens-expand-button')
export class ExpandButton extends LitElement {

  static styles = [
    css`
      :host {
        display: inline-flex;
      }

      :host([expanded]) svg {
        transform: rotate(-180deg);
      }

      svg {
        transition: transform .3s ease-in-out;
      }
    `
  ];

  @property({ type: Boolean }) disabled = false;

  @property({ type: Boolean, reflect: true })
  expanded = false;

  @property({ type: String })
  label = 'Expand';

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
    'ens-expand-button': ExpandButton;
  }
}
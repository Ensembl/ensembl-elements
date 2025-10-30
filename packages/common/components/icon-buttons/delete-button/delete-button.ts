import { html, css, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';

import '../icon-button/icon-button';

import icon from '../../../icons/icon_delete.svg?raw';

@customElement('ens-delete-button')
export class DeleteButton extends LitElement {

  static styles = [
    css`
      :host {
        display: inline-flex;
      }
    `
  ];

  @property({ type: Boolean }) disabled = false;

  @property({ type: String })
  label = 'Delete';

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
    'ens-delete-button': DeleteButton;
  }
}
import { html, css, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';

import icon from '../../../icons/icon_table.svg?raw';

import '../icon-button/icon-button';

@customElement('ens-table-view-button')
export class TableViewButton extends LitElement {

  static styles = [
    css`
      :host {
        display: inline-flex;
      }
    `
  ];

  @property({ type: Boolean }) disabled = false;

  @property({ type: String })
  label = 'View table';

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
    'ens-table-view-button': TableViewButton;
  }
}
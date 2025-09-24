import { html, css, LitElement } from 'lit';
import { customElement, property  } from 'lit/decorators.js';

import resetStyles from '../../../styles/constructable-stylesheets/resets';
import buttonResetStyles from '../../../styles/constructable-stylesheets/button-resets';
import visuallyHiddenStyles from '../../../styles/constructable-stylesheets/visually-hidden';

@customElement('ens-icon-button')
export class IconButton extends LitElement {

  static styles = [
    resetStyles,
    buttonResetStyles,
    visuallyHiddenStyles,
    css`
      :host {
        display: inline-block;
        height: var(--icon-button-height, 18px);
        width: var(--icon-button-width, 18px);
      }

      ::slotted(svg) {
        width: 100%;
        height: 100%;
        fill: var(--icon-button-color, var(--color-blue));
      }

      button[disabled] ::slotted(svg) {
        fill: var(--icon-button-disabled-color, var(--color-grey));
      }
    `
  ];

  @property({ type: Boolean }) disabled = false;

  @property({ type: String }) label = '';

  protected firstUpdated() {
    const slot = this.shadowRoot!.querySelector('slot');
    const slottedChildren = slot!.assignedElements();
    const svg = slottedChildren.find(element => element.tagName === 'svg');

    if (!svg) {
      // this shouldn't happen
      return;
    }

    svg.setAttribute('aria-hidden', 'true');
  }

  render() {
    return html`
      <button
        type="button"
        ?disabled=${this.disabled}
      >
        ${this.label ? html`
          <span class="visually-hidden">
            ${this.label}
          </span>
        ` :null
        }
        <slot></slot>
      </button>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ens-icon-button': IconButton;
  }
}
import { html, css, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';

import '../button/button';
import '../spinner/spinner';

import checkboxIcon from '../../icons/icon_tick.svg?raw';
import crossIcon from '../../icons/icon_cross.svg?raw';

import resetStyles from '../../styles/constructable-stylesheets/resets';
import buttonResetStyles from '../../styles/constructable-stylesheets/button-resets';


/**
 * A button component for performing asynchronous tasks.
 * It has a loading, success, and error states
*/

@customElement('ens-loading-button')
export class EnsLoadingButton extends LitElement {

  static styles = [
    resetStyles,
    buttonResetStyles,
    css`
      :host {
        display: inline-flex;
      }

      :host(:not([status="default"])) {
        ens-button::part(button) {
          background-color: transparent;
          border: 1px solid var(--color-grey);
        }

        .button-label {
          visibility: hidden;
        }
      }

      :host([status="success"]) svg {
        fill: var(--color-green);
        height: 80%;
        animation: checkmark-pulse 0.5s ease-in;
      }

      :host([status="error"]) svg {
        fill: var(--color-red);
        height: 55%;
      }

      ens-button::part(button) {
        position: relative;
      }

      ens-spinner, svg {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
      }

      ens-spinner {
        --track-width: 5;
        width: 20px;
      }

      @keyframes checkmark-pulse {
        0% {
          scale: 0.6;
        }

        70% {
          scale: 1.1;
        }

        100% {
          scale: 1;
        }
      }
    `
  ]

  @property({ type: String, reflect: true })
  status: 'default' | 'loading' | 'success' | 'error' = 'default';

  render() {
    return html`
      <ens-button
        variant="action"
        exportparts="button"
        .disabled=${this.status !== 'default'}
      >
        <span class="button-label">Download</span>
        ${this.renderIndicator()}
      </ens-button>
    `;
  }

  renderIndicator() {
    if (this.status === 'loading') {
      return html`
        <ens-spinner></ens-spinner>
      `;
    } else if (this.status === 'success') {
      return unsafeSVG(checkboxIcon);      
    } else if (this.status === 'error') {
      return unsafeSVG(crossIcon);
    } else {
      return null;
    }
  }

}

declare global {
  interface HTMLElementTagNameMap {
    'ens-loading-button': EnsLoadingButton;
  }
}
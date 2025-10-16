import { html, css, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';

import resetStyles from '../../styles/constructable-stylesheets/resets';

/**
 * Borrowed heavily from https://github.com/shoelace-style/webawesome/tree/next/packages/webawesome/src/components/spinner
 */

@customElement('ens-spinner')
export class EnsSpinner extends LitElement {

  static styles = [
    resetStyles,
    css`
      :host {
        --track-width: 3;
        --track-color: var(--color-grey);
        --indicator-color: var(--color-red);
        display: inline-flex;
        width: 40px;
        aspect-ratio: 1;
      }

      svg {
        height: 100%;
        width: 100%;
        animation: loader-spin 1.3s linear infinite;
      }

      .track {
        stroke: var(--color-grey);
        stroke: var(--track-color);
        stroke-width: var(--track-width);
      }

      .indicator {
        stroke: var(--indicator-color);
        stroke-dasharray: 30 100;
        stroke-dashoffset: -79;
        animation: dash 1.5s ease-in-out infinite;
        stroke-linecap: round;
        stroke-width: var(--track-width);
      }

      @keyframes loader-spin {
        to {
          transform: rotate(360deg);
        }
      }
    `
  ]

  render() {
    return html`
      <svg
        part="spinner"
        role="progressbar"
        aria-label="loading"
        fill="none"
        viewBox="0 0 50 50"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle class="track" cx="25" cy="25" r="20" fill="none" stroke-width="5" />
        <circle class="indicator" cx="25" cy="25" r="20" fill="none" stroke-width="5" />
      </svg>
    `;
  }

}

declare global {
  interface HTMLElementTagNameMap {
    'ens-spinner': EnsSpinner;
  }
}
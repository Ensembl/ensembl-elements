import {html, css, nothing, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';

import icon from '../../icons/icon_xlink.svg?raw';

import resetStyles from '../../styles/constructable-stylesheets/resets';

@customElement('ens-external-link')
export class ExternalLink extends LitElement {

  static styles = [
    resetStyles,
    css`
      svg {
        width: var(--external-link-icon-color, 12px);
        aspect-ratio: 1;
        fill: var(--external-link-icon-color, var(--color-orange));
        transform: translateY(10%);
      }
    `
  ];

  @property({ type: String })
  href = '';

  /**
   * By default, external links open pages in a new browser tab
   */
  @property({ type: Boolean })
  'open-new': boolean = true;

  render() {
    return html`
      <a
        href=${this.href}
        target=${this['open-new'] ? '_blank' : nothing}
        rel=${this['open-new'] ? 'noopener noreferrer' : nothing}
      >
        ${unsafeSVG(icon)}
        <slot>
        </slot>
      </a>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ens-external-link': ExternalLink;
  }
}
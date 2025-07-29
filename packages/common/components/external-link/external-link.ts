import {html, css, unsafeCSS, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';

import icon from '../../icons/icon_xlink.svg?raw';

import resetStyles from '../../styles/resets.css?raw';

@customElement('ens-external-link')
export class ExternalLink extends LitElement {

  static styles = [
    unsafeCSS(resetStyles),
    css`
      svg {
        width: var(--external-link-icon-color, 12px);
        aspect-ratio: 1;
        margin-right: var(--external-link-icon-offset, 3px);
        fill: var(--external-link-icon-color, var(--color-orange));
        transform: translateY(10%);
      }
    `
  ];

  @property({ type: String })
  href = '';

  render() {
    return html`
      <a href=${this.href}>
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
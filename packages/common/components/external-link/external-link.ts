import {html, css, nothing, LitElement, CSSResultGroup} from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';

import icon from '../../icons/icon_xlink.svg?raw';

//  fill: var(--external-link-icon-offset, var(--color-orange));

@customElement('ens-external-link')
export class ExternalLink extends LitElement {

  static styles = css`
    svg {
      width: 12px;
      aspect-ratio: 1;
      fill: orange;
    }
  `;

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


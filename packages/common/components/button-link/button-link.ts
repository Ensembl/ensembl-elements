import { html, css, LitElement } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { ifDefined } from "lit/directives/if-defined.js"

import resetStyles from '../../styles/constructable-stylesheets/resets';
import buttonResetStyles from '../../styles/constructable-stylesheets/button-resets';

/**
 * This component looks like ens-button (notice how it borrows its styles),
 * but instead of a button element renders a link.
 * The `variant` attribute has the same semantics as for ens-button
 */

@customElement('ens-button-link')
export class EnsButtonLink extends LitElement {

  static styles = [
    resetStyles,
    buttonResetStyles,
    css`
      :host {
        display: inline-block;
        line-height: 1;
      }
      
      a {
        display: inline-block;
        color: var(--color-white);
        font-weight: var(--font-weight-bold);
        padding: 7px 18px;
        border-radius: 4px;
      }

      :not(:host([variant])) a,
      :host([variant="brand"]) a {
        background-color: var(--color-blue);
      }

      :host([variant="action"]) a {
        background-color: var(--color-green);
      }

      :host([disabled]) a {
        background-color: var(--color-medium-dark-grey);
      }
    `
  ];

  @property({ type: Boolean })
  disabled = false;

  @property({ type: String })
  href: string = '';

  @property({ type: Boolean })
  download: boolean = false;

  @query('a')
  link!: HTMLAnchorElement;

  focus(options: FocusOptions) {
    this.link.focus(options);
  }

  render() {
    let href: string | undefined;

    if (this.href && !this.disabled) {
      href = this.href
    }

    return html`
      <a
        part="link"
        href=${ifDefined(href)}
      >
        <slot>
        </slot>
      </a>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ens-button-link': EnsButtonLink;
  }
}
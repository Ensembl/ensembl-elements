import {html, css, nothing, LitElement } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';

import resetStyles from '../../styles/constructable-stylesheets/resets';
import checkboxStyles from './checkbox-styles';

@customElement('ens-checkbox-only')
export class CheckboxOnly extends LitElement {

  @property({ type: Boolean })
  checked: boolean = false;

  @query('input')
  input!: HTMLInputElement;

  #internals: ElementInternals;

  static styles = [
    resetStyles,
    checkboxStyles,
    css`
      :host {
        display: inline-block;
      }
    `
  ];

  constructor() {
    super();
    this.#internals = this.attachInternals();
  }

  updated(changedProperties: Map<string, unknown>) {
    if (changedProperties.has('checked')) {
      this.input.checked = this.checked;
    }
  }

  focus(options: FocusOptions) {
    this.input.focus(options);
  }

  render() {
    // Idea for passing the aria-label attribute through a data attribute
    // borrowed from the Material Web library
    // (https://material-web.dev/components/checkbox/)
    const ariaLabel = this.dataset.ariaLabel;

    return html`
      <input id="input" type="checkbox" aria-label=${ariaLabel ?? nothing} />
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ens-checkbox-only': CheckboxOnly;
  }
}
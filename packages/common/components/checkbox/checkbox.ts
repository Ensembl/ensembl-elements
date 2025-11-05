import { html, css, nothing, LitElement } from 'lit';
import { property, query, customElement } from 'lit/decorators.js';

import resetStyles from '../../styles/constructable-stylesheets/resets';
import checkboxStyles from './checkbox-styles';

// https://dev.to/stuffbreaker/custom-forms-with-web-components-and-elementinternals-4jaj

// https://github.com/w3c/csswg-drafts/issues/6867

@customElement('ens-checkbox')
export class EnsCheckbox extends LitElement {

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
        display: inline-grid;
        grid-template-columns: repeat(2, auto);
        column-gap: 0.4rem;
        justify-content: start;
        align-items: baseline;
      }

      :host label {
        user-select: none;
        cursor: pointer;
      }

      :host:has(input:disabled) label {
        cursor: default;
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

  onChange(event: Event) {
    const eventTarget = event.target as HTMLInputElement;
    this.checked = eventTarget.checked;

    // re-dispatch the change event so that it can cross the shadow boundary
    const newEvent = new Event(event.type);
    this.dispatchEvent(newEvent);
  }

  render() {
    // Idea for passing the aria-label attribute through a data attribute
    // borrowed from the Material Web library
    // (https://material-web.dev/components/checkbox/)
    const ariaLabel = this.dataset.ariaLabel;

    return html`
      <input
        part="input"
        id="input"
        type="checkbox"
        ?checked=${this.checked}
        aria-label=${ariaLabel ?? nothing}
        @change=${this.onChange}
      />
      <label part="label" for="input">
        <slot></slot>
      </label>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ens-checkbox': EnsCheckbox;
  }
}
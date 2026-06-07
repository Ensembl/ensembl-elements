import { html, css, nothing, LitElement } from 'lit';
import { property, state, query, customElement } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { live } from 'lit/directives/live.js';

import resetStyles from '../../styles/constructable-stylesheets/resets';

/**
 * An input can be
 * - Shaded (have a predefined shadow)
 * - Large (taller) or small (shorter)
 */


@customElement('ens-input')
export class EnsInput extends LitElement {
  static styles = [
    resetStyles,
    css`
      :host {
        display: block;
      }

      :host .input-wrapper {
        background-color: var(--input-background-colour, var(--color-white));
        padding: var(--input-padding, 0 15px);
        height: var(--input-height, 30px);
        width: var(--input-width, 100%);
      }

      :host([appearance="shaded"]) .input-wrapper {
        display: inline-flex;
        align-items: center;
        box-shadow: var(--form-field-shadow);
      }

      :host([appearance="shaded"]) input {
        border: none;
        outline: none;
        background-color: transparent;
      }

      :host([size="large"]) .input-wrapper {
        height: var(--input-height, 40px);
      }

      .wrapper:has(label[aria-hidden="false"]) {
        display: grid;
        grid-template-columns: auto 1fr;
        column-gap: 0.4rem;
        align-items: center;
      }

      .wrapper:has(label[aria-hidden="true"]) {
        display: flex;
      }

      label {
        font-weight: var(--font-weight-light);
      }

      label[aria-hidden="true"] {
        display: none; /* well, in this case, there is no need for the aria-hidden attribute */
      }

      input {
        width: 100%;
      }
    `
  ];

  @query('input')
  input!: HTMLInputElement;

  @query('label slot')
  labelSlot!: HTMLSlotElement;

  @property({ attribute: 'value' })
  value: string = this.getAttribute('value') || '';
  
  @property({ type: String })
  label: string = '';
  
  @property({ reflect: true })
  appearance: 'shaded' | 'flat' = 'flat';

  @property({ reflect: true })
  size: 'large' | 'regular' = 'regular';

  @state()
  hasSlottedLabel: boolean = false;

  #internals: ElementInternals;

  constructor() {
    super();
    this.#internals = this.attachInternals();
  }

  protected firstUpdated() {
    this.onLabelSlotChange();
  }

  focus(options: FocusOptions) {
    this.input.focus(options);
  }

  #onChange(event: Event) {
    const eventTarget = event.target as HTMLInputElement;

    // re-dispatch the change event so that it can cross the shadow boundary
    const newEvent = new Event(event.type);
    this.dispatchEvent(newEvent);
  }

  #onInput() {
    this.value = this.input.value;
  }


  onLabelSlotChange() {
    const childNodes = this.labelSlot.assignedNodes({flatten: true});
    if (childNodes.length) {
      this.hasSlottedLabel = true;
    } else {
      this.hasSlottedLabel = false;
    }
  }

  render() {
    // Idea for passing the aria-label attribute through a data attribute
    // borrowed from the Material Web library
    // (https://material-web.dev/components/checkbox/)
    const ariaLabel = this.dataset.ariaLabel;

    /**
     * NOTE: The top-level child element of this component is a div
     * for wrapping the label and the input wrapper.
     * The only reason this top-level wrapper is necessary is because
     * Firefox and Safari have not yet implemented a `:has()` selector
     * combined with the `:host` selector.
     * It should not be necessary later on.
     */

    return html`
      <div part="wrapper" class="wrapper">
        <label
          part="label"
          for="input"
          class=${classMap({
            label: true,
            'has-label': this.hasSlottedLabel
          })}
          aria-hidden=${this.hasSlottedLabel ? 'false' : 'true'}
          >
          <slot name="label" @slotchange=${this.onLabelSlotChange}>${this.label}</slot>
        </label>

        <div part="input-wrapper" class="input-wrapper">
          <input
            part="input"
            id="input"
            .value=${live(this.value)}
            autocomplete="off"
            aria-label=${ariaLabel ?? nothing}
            @change=${this.#onChange}
            @input=${this.#onInput}
          />
        </div>
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ens-input': EnsInput;
  }
}
Possible implementations of the Select component:

1. A custom element wraps around a native select element, providing styles for it and acting as a styled select button:

```html
<ens-select>
  <select>
    <option value="one">One</option>
    <option value="two">Two</option>
    <option value="three">Three</option>
  </select>
</ens-select>
```

The api of such a component is a bit clunky; but at least it doesn't require re-implementation of the functionality of the native `select` element.

When browser support for customizable select elements improves, it should be very easy to update this component (or perhaps discard it entirely) to make use of these browser features.

2. Another possibility is for the custom element to completely replace the native select element (the native select would be used inside of the shadow DOM):

```html
<ens-select>
  <option value="one">One</option>
  <option value="two">Two</option>
  <option value="three">Three</option>
</ens-select>
```

The problem with this approach is that the `option` elements passed into such a component cannot be simply slotted into a native `select` element in the shadow DOM of this component. I.e. it is impossible to just build the internals of such component like so:

```html
<select>
  <slot></slot>
</select>
```

Thus, some mechanism would have to be used in order to pass the options from the slot into the `select` inside of the shadow DOM.

Here is how the developers of Nord Design System approach this problem — they read the options component's light DOM (i.e. from the slot), and generate an identical set of options that go inside the `select` element. They also attach a mutation observer to notify the component when the options in the slot change, and regenerate the set of options in the `select` element in response. Here is the code of their custom Select component:


```ts
/* eslint-disable lit-a11y/no-invalid-change-handler */
import { LitElement, html, isServer } from "lit"
import { customElement, property } from "lit/decorators.js"
import { ifDefined } from "lit/directives/if-defined.js"
import { ref } from "lit/directives/ref.js"
import * as dropdownIcon from "@nordhealth/icons/lib/assets/interface-dropdown-small.js"

import "../button/Button.js"
import Icon from "../icon/Icon.js"

import { InputMixin } from "../common/mixins/InputMixin.js"
import { FocusableMixin } from "../common/mixins/FocusableMixin.js"
import { FormAssociatedMixin } from "../common/mixins/FormAssociatedMixin.js"
import { AutocompleteMixin } from "../common/mixins/AutocompleteMixin.js"
import { SizeMixin } from "../common/mixins/SizeMixin.js"

import componentStyle from "../common/styles/Component.css"
import formFieldStyle from "../common/styles/FormField.css"
import style from "./Select.css"
import { SlotController } from "../common/controllers/SlotController.js"

Icon.registerIcon(dropdownIcon)

/**
 * Select lets users choose one option from an options menu.
 * Consider using select when you have 5 or more options to choose from.
 *
 * @status ready
 * @category form
 * @slot - Default slot for holding <option> elements.
 * @slot label - Use when a label requires more than plain text.
 * @slot hint - Use when a hint requires more than plain text.
 * @slot error - Optional slot that holds error text for the input.
 * @slot icon - Used to place an icon at the start of select.
 *
 * @cssprop [--n-select-block-size=var(--n-space-xl)] - Controls the block size, or height, of the select using our [spacing tokens](/tokens/#space).
 * @cssprop [--n-select-inline-size=fit-content] - Controls the inline size, or width, of the select.
 * @cssprop [--n-label-color=var(--n-color-text)] - Controls the text color of the label, using our [color tokens](/tokens/#color).
 */
@customElement("nord-select")
export default class Select extends SizeMixin(
  FormAssociatedMixin(AutocompleteMixin(InputMixin(FocusableMixin(LitElement))))
) {
  static styles = [componentStyle, formFieldStyle, style]

  protected override get formValue() {
    return this.value || undefined
  }

  private defaultSlot = new SlotController(this)
  private optionObserver?: MutationObserver

  protected inputId = "select"

  firstUpdated() {
    this.setupOptionObserver()
  }

  connectedCallback() {
    super.connectedCallback()
    // Re-setup observer after reconnection (firstUpdated only runs once per instance)
    if (this.hasUpdated && !this.optionObserver) {
      this.setupOptionObserver()
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    // Clean up observer to prevent memory leaks
    this.optionObserver?.disconnect()
    this.optionObserver = undefined
  }

  private setupOptionObserver() {
    // Avoid creating multiple observers
    if (this.optionObserver) {
      return
    }

    // Set up observer to watch for changes to slotted option content
    this.optionObserver = new MutationObserver(() => this.requestUpdate())
    this.optionObserver.observe(this, {
      subtree: true,
      childList: true,
      characterData: true,
    })
  }

  /**
   * Controls whether the select expands to fill the width of its container.
   */
  @property({ reflect: true, type: Boolean }) expand = false

  render() {
    const slottedOptions = this.options
    const buttonText = this.getButtonText(slottedOptions)

    return html`
      <slot></slot>
      ${this.renderLabel()}

      <div class="n-select-container">
        <select
          ${ref(this.focusableRef)}
          id=${this.inputId}
          ?disabled=${this.disabled}
          ?required=${this.required}
          name=${ifDefined(this.name)}
          @change=${this.handleChange}
          @input=${this.handleInput}
          aria-describedby=${ifDefined(this.getDescribedBy())}
          aria-invalid=${ifDefined(this.getInvalid())}
          autocomplete=${this.autocomplete as any}
        >
          ${this.placeholder && html`<option value="" disabled ?selected=${!this.value}>${this.placeholder}</option>`}
          ${slottedOptions.map(option => this.renderOption(option))}
        </select>

        <nord-button size=${this.size} ?disabled=${this.disabled} ?expand=${this.expand} type="button" inert>
          <slot slot="start" name="icon"></slot>
          ${buttonText}
          <nord-icon slot="end" name="interface-dropdown-small"></nord-icon>
        </nord-button>
      </div>

      ${this.renderError()}
    `
  }

  private get options() {
    if (isServer) {
      return []
    }

    return Array.from(this.querySelectorAll("option"))
  }

  private getButtonText(options: HTMLOptionElement[]): string {
    const selected = options.find(option => option.value === this.value.toString())

    if (selected) {
      return selected.text
    }

    if (this.placeholder) {
      return this.placeholder
    }

    if (options[0]) {
      return options[0].text
    }

    return ""
  }

  private renderOption(option: HTMLOptionElement) {
    return html`
      <option
        value=${ifDefined(option.value)}
        ?disabled=${option.disabled}
        .selected=${option.value === this.value.toString()}
      >
        ${option.text}
      </option>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "nord-select": Select
  }
}
```
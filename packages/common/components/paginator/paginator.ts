import {html, css, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';

import chevronIcon from '../../icons/icon_chevron.svg?raw';

import resetStyles from '../../styles/constructable-stylesheets/resets';
import buttonResetStyles from '../../styles/constructable-stylesheets/button-resets';

@customElement('ens-paginator')
export class Paginator extends LitElement {

  static styles = [
    resetStyles,
    buttonResetStyles,
    css`
      :host {
        display: inline-block;
        line-height: 1;
      }

      form {
        display: flex;
        align-items: center;
      }

      button {
        padding: 0 0.5rem;
        align-self: stretch;
      }

      svg {
        fill: var(--color-blue);
        height: 8px;
      }

      .prevPage svg {
        transform: rotate(90deg);
        margin-right: 8px;
      }

      .nextPage {
        transform: rotate(-90deg);
        margin-left: 8px;
      }

      .total {
        margin-left: 5px;
      }

      input {
        field-sizing: content;
        border: 1px solid var(--color-blue);
        padding: 4px 10px;
        min-width: 50px;
        max-width: 100px;
        text-align: center;
      }

      @supports not (field-sizing: content) {
        input {
          width: 50px;
        }
      }

      [disabled] svg {
        fill: var(--color-grey);
      }
    `
  ];

  @property({ type: Number })
  'current-page' = 1;

  @property({ type: Number })
  'total-pages' = 1;

  #hasPreviousPage = () => {
    return this['current-page'] > 1;
  }

  #hasNextPage = () => {
    return this['current-page'] < this['total-pages'];
  }

  #handleSubmit = (event: Event) => {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    const newPage = Number(formData.get('page-number'));

    if (Number.isNaN(newPage)) {
      return;
    }
    this.dispatchNewPageEvent(newPage);
  }

  #onNextPageClick = () => {
    const newPage = this['current-page'] + 1;
    this.dispatchNewPageEvent(newPage);
  }

  #onPreviousPageClick = () => {
    const newPage = this['current-page'] - 1;
    this.dispatchNewPageEvent(newPage);
  }

  dispatchNewPageEvent = (newPage: number) => {
    if (newPage < 1 || newPage > this['total-pages']) {
      return;
    }

    const event = new CustomEvent('ens-paginator-page-change', {
      detail: newPage
    });
    this.dispatchEvent(event);
  }

  render() {
    return html`
      <form @submit=${this.#handleSubmit}>
        <button
          type="button"
          class="prevPage"
          aria-label="Previous page"
          ?disabled=${!this.#hasPreviousPage()}
          @click=${this.#onPreviousPageClick}
        >
          ${unsafeSVG(chevronIcon)}
        </button>
        <input
          name="page-number"
          value=${this['current-page']}
          aria-label="Page number"
        />
        <span class="total">
          of ${this['total-pages']}
        </span>
        <button
          type="button"
          class="nextPage"
          aria-label="Next page"
          ?disabled=${!this.#hasNextPage()}
          @click=${this.#onNextPageClick}
        >
          ${unsafeSVG(chevronIcon)}
        </button>
      </form>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ens-paginator': Paginator;
  }
}
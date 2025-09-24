import { html, css, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';

import arrowIcon from '../../icons/icon_arrow.svg?raw';

import resetStyles from '../../styles/constructable-stylesheets/resets';
import buttonResetStyles from '../../styles/constructable-stylesheets/button-resets';
import tableStyles from '../../styles/constructable-stylesheets/table';

/**
 * This component is to be used in a table styled with the table styles
 * (see styles/table.css)
 */


@customElement('ens-table-sortable-column-head')
export class SortableTableColumnHead extends LitElement {

  static styles = [
    resetStyles,
    tableStyles,
    buttonResetStyles,
    css`
      :host {
        display: inline-block;
        line-height: 1;
      }

      button {
        display: inline-grid;
        grid-template-columns: repeat(2, auto);
        align-items: baseline;
        justify-content: start;
        column-gap: var(--_sort-arrow-right-margin); /* "private" css variable defined in the table styles */
        font-weight: inherit;
        text-align: left;
      }

      button svg {
        width: var(--_sort-arrow-width); /* "private" css variable defined in the table styles */
        fill: var(--color-grey);
        transform: rotate(180deg);
      }

      .sort-ascending svg {
        transform: unset;
      }

      .active {
        font-weight: var(--font-weight-normal);
      }

      .active svg {
        fill: var(--color-blue);
      }
    `
  ];

  @property({ type: String })
  'sort-order': 'asc' | 'desc' | null = null;

  render() {
    const isActive = this['sort-order'] !== null;
    const buttonClasses = {
      active: isActive,
      'sort-ascending': this['sort-order'] === 'asc',
      'sort-descending': this['sort-order'] === 'desc'
    };

    return html`
      <button
        type="button"
        class=${classMap(buttonClasses)}
      >
        ${unsafeSVG(arrowIcon)}
        <slot></slot>
      </button>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ens-table-sortable-column-head': SortableTableColumnHead;
  }
}
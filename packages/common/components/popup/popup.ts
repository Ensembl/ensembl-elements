import { html, svg, css, LitElement } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import {
  arrow,
  autoUpdate,
  computePosition,
  flip,
  offset,
  autoPlacement,
  platform,
  shift,
  size,
  hide,
  type VirtualElement,
  type MiddlewareState,
  type ComputePositionReturn
} from '@floating-ui/dom';

import resetStyles from '../../styles/constructable-stylesheets/resets';

type Placement = 'top' | 'bottom' | 'left' | 'right';

@customElement('ens-popup')
export class Popup extends LitElement {

  static styles = [
    resetStyles,
    css`
      :host {
        display: contents;
      }

      #popup {
        background-color: red;
        position: absolute;
        isolation: isolate;
        padding: 6px 12px;
      }

      #arrow {
        width: 18px;
        height: 13px;
        position: absolute;
        fill: red;
      }
    `
  ];

  @query('#popup')
  popup!: HTMLElement;

  @query('#arrow')
  arrow!: SVGSVGElement;

  @property({ attribute: false })
  anchor!: Element | VirtualElement;

  @property({ reflect: true })
  placement: Placement = 'bottom';

  #arrowHeight = 13;

  #disableAutoUpdate: ( () => void ) | null = null;

  connectedCallback() {
    super.connectedCallback();
    this.#setListeners();
  }

  disconnectedCallback(): void {
    this.#disableAutoUpdate?.();
    this.#removeListeners();
    super.disconnectedCallback();
  }

  // FIXME: autoUpdate should probably only be applied if it hasn't been previously
  updated() {
    this.#computePosition();

    const popup = this.popup;
    const anchor = this.anchor;

    // do not enable auto-update for virtual elements
    if (anchor instanceof Element) {
      this.#disableAutoUpdate = autoUpdate(anchor, popup, this.#computePosition);
    }
  }

  #setListeners = () => {
    document.addEventListener('mousedown', this.#reportOutsideClicks);
  }

  #removeListeners = () => {
    document.removeEventListener('mousedown', this.#reportOutsideClicks);
  }

  #reportOutsideClicks = (event: MouseEvent) => {
    const scope = this.popup.getRootNode();
    const scopeNode = event.composedPath()
      .find(node => (node as HTMLElement).getRootNode?.() === scope) as HTMLElement | undefined;

    // A semi-magical incantation, based on how the compareDocumentPosition method works (it returns an integer used as bitmask)
    const isClickInside = Boolean(
      scopeNode && (
        (scopeNode === this.popup) ||
        (this.popup.compareDocumentPosition(scopeNode) & Node.DOCUMENT_POSITION_CONTAINED_BY)
      )
    );

    if (!isClickInside) {
      const event = new Event('ens-popup-click-outside', {
        bubbles: true,
        composed: true
      });
      this.dispatchEvent(event);
    } else {
      event.stopPropagation();
    }
  }

  #computePosition = () => {
    const popup = this.popup;
    const anchor = this.anchor;
    computePosition(anchor, popup, {
      placement: this.placement,
      middleware: [
        offset((data) => {
          return this.#getOffset(data);
        }),
        shift(),
        arrow({ element: this.arrow }),
        flip(),
        hide()
      ]
    }).then((data) => {
      const { x, y, placement, middlewareData } = data;

      // position the popup itself
      Object.assign(this.popup.style, {
        left: `${x}px`,
        top: `${y}px`,
      });
      
      // position the popup's arrow
      Object.assign(this.arrow.style, {
        ...this.#getArrowStyles(data),
      });

      // hide the popup if its anchor is no longer visible
      if (middlewareData.hide!.referenceHidden) {
        this.popup.style.visibility = 'hidden';
      } else {
        this.popup.style.visibility = 'visible';
      }
    });
  }

  render() {
    return html`
      <div
        id="popup"
        part="popup"
      >
        <slot></slot>
        ${this.#renderArrow()}
      </div>
    `;
  }

  #renderArrow() {
    return svg`
      <svg id="arrow" viewBox="0 0 18 13">
        <polygon points="0,13 18,13, 9,0"></polygon>
      </svg>
    `;
  }

  #getArrowStyles = (data: ComputePositionReturn) => {
    const { placement, middlewareData } = data;

    if (placement === 'top') {
      return {
        bottom: `-${this.#arrowHeight}px`,
        rotate: '180deg',
        left: `${middlewareData.arrow!.x}px`
      }
    } else if (placement === 'bottom') {
      return {
        top: `-${this.#arrowHeight}px`,
        left: `${middlewareData.arrow!.x}px`
      }
    } else if (placement === 'left') {
      return {
        top: `${middlewareData.arrow!.y}px`,
        rotate: '90deg',
        right: `-${this.#arrowHeight}px`
      }
    } else if (placement === 'right') {
      return {
        top: `${middlewareData.arrow!.y}px`,
        rotate: '-90deg',
        left: `-${this.#arrowHeight}px`
      }
    }
  }

  #getOffset = (state: MiddlewareState) => {
    const { placement, rects } = state;
    const popupRect = rects.floating;
    const popupWidth = popupRect.width;

    const crossAxisOffset = ['top', 'bottom'].includes(placement)
      ? popupWidth / 2 - 20
      : undefined;

    return {
      mainAxis: this.#arrowHeight,
      crossAxis: crossAxisOffset
    };
  }

}


declare global {
  interface HTMLElementTagNameMap {
    'ens-popup': Popup;
  }
}
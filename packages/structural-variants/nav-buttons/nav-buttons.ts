import { html, css, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import '@ensembl/ensembl-elements-common/components/nav-buttons/nav-buttons.js';

import type { ViewportChangePayload } from '../sv-browser';

/**
 * The peculiarity of this component is that it calculates the new location
 * for both aligned genomes at once.
*/

const MIN_ZOOM_BP = 15;

@customElement('ens-sv-nav-buttons')
export class NavButtonsForStructuralVariantsBrowser extends LitElement {
  static styles = [
    css`
      :host {
        display: inline-flex;
      }
    `
  ];

  @property({ type: Number })
  start = 0;

  @property({ type: Number })
  end = 0;

  @property({ type: Number })
  altStart = 0;

  @property({ type: Number })
  altEnd = 0;

  @property({ type: Number })
  regionLength = 0;

  @property({ type: Number })
  altRegionLength = Infinity;

  #onMoveLeft = () => {
    // For reference genome
    const viewportDistance = this.end - this.start;
    const quarterViewportDistance = Math.round(viewportDistance / 4);

    const newStart = Math.max(this.start - quarterViewportDistance, 1);
    const newEnd = newStart + viewportDistance;

    // For the alternative genome (move the same distance as reference genome)
    const newAltStart = Math.max(this.altStart - quarterViewportDistance, 1);
    const newAltEnd = Math.min(newAltStart + viewportDistance, this.altEnd);

    this.#dispatchNewLocation({
      reference: {
        start: newStart,
        end: newEnd
      },
      alt: {
        start: newAltStart,
        end: newAltEnd
      }
    });
  }

  #onMoveRight = () => {
    // For reference genome
    const viewportDistance = this.end - this.start;
    const quarterViewportDistance = Math.round(viewportDistance / 4);

    const newEnd = Math.min(this.end + quarterViewportDistance, this.regionLength);
    const newStart = newEnd - viewportDistance;

    // For the alternative genome (move the same distance as reference genome)
    const newAltEnd = Math.min(this.altEnd + quarterViewportDistance, this.altRegionLength);
    const newAltStart = Math.max(newAltEnd - viewportDistance, 1);

    this.#dispatchNewLocation({
      reference: {
        start: newStart,
        end: newEnd
      },
      alt: {
        start: newAltStart,
        end: newAltEnd
      }
    });

  }

  /**
   * Narrow the viewport to half its current size
   */
  #onZoomIn = () => {
    // For reference genome
    const refMidpoint = this.start + Math.round((this.end - this.start) / 2);
    const viewportDistance = this.end - this.start;
    const newViewportDistance = Math.ceil(viewportDistance / 2);
    const newStart = refMidpoint - newViewportDistance / 2;
    const newEnd = refMidpoint + newViewportDistance / 2;

    // For the alternative genome, change location by the same distance as for reference genome
    const altMidpoint = this.altStart + Math.round((this.altEnd - this.altStart) / 2);
    const newAltStart = altMidpoint - newViewportDistance / 2;
    const newAltEnd = altMidpoint + newViewportDistance / 2;

    this.#dispatchNewLocation({
      reference: {
        start: newStart,
        end: newEnd
      },
      alt: {
        start: newAltStart,
        end: newAltEnd
      }
    });
  }

  /**
   * Grow the viewport by to twice its current size
   */
  #onZoomOut = () => {
    // For reference genome
    const refMidpoint = this.start + Math.round((this.end - this.start) / 2);
    const viewportDistance = this.end - this.start;
    const newViewportDistance = Math.min(viewportDistance * 2, this.regionLength);

    const newStart = Math.max(refMidpoint - newViewportDistance / 2, 1);
    const newEnd = Math.min(refMidpoint + newViewportDistance / 2, this.regionLength);
  
    // For the alternative genome, change location by the same distance as for reference genome
    const altMidpoint = this.altStart + Math.round((this.altEnd - this.altStart) / 2);
    const newAltStart = Math.max(altMidpoint - newViewportDistance / 2, 1);
    const newAltEnd = Math.min(altMidpoint + newViewportDistance / 2, this.altRegionLength);

    this.#dispatchNewLocation({
      reference: {
        start: newStart,
        end: newEnd
      },
      alt: {
        start: newAltStart,
        end: newAltEnd
      }
    });
  }

  #isZoomInDisabled() {
    return this.end - this.start < MIN_ZOOM_BP;
  }

  #isZoomOutDisabled() {
    return this.start <= 1 && this.end >= this.regionLength;
  }

  #isMoveLeftDisabled() {
    return this.start <= 1;
  }

  #isMoveRightDisabled() {
    return this.end >= this.regionLength;
  }

  #dispatchNewLocation = (payload: ViewportChangePayload) => {
    const event = new CustomEvent<ViewportChangePayload>('viewport-change', {
      detail: payload,
      bubbles: true,
      composed: true
    });

    this.dispatchEvent(event);
  }

  render() {
    return html`
      <ens-nav-buttons
        .isMoveLeftDisabled=${this.#isMoveLeftDisabled()}
        .isMoveRightDisabled=${this.#isMoveRightDisabled()}
        .isZoomInDisabled=${this.#isZoomInDisabled()}
        .isZoomOutDisabled=${this.#isZoomOutDisabled()}
        @move-left=${this.#onMoveLeft}
        @move-right=${this.#onMoveRight}
        @zoom-in=${this.#onZoomIn}
        @zoom-out=${this.#onZoomOut}
      ></ens-nav-buttons>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ens-sv-nav-buttons': NavButtonsForStructuralVariantsBrowser;
  }
}
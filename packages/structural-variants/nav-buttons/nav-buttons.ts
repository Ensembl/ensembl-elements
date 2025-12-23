import { html, LitElement } from 'lit';
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

  #onMoveLeft = () => {
    // For reference genome
    const viewportDistance = this.end - this.start;
    const quarterViewportDistance = Math.round(viewportDistance / 4);

    const newStart = Math.max(this.start - quarterViewportDistance, 1);
    const newEnd = newStart + viewportDistance;

    // For the alternative genome (move the same distance as reference genome)
    const newAltStart = Math.max(this.altStart - quarterViewportDistance, 1);
    const newAltEnd = newAltStart + viewportDistance;

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
    const newAltEnd = Math.min(this.altEnd + quarterViewportDistance, this.regionLength);
    const newAltStart = newAltEnd - viewportDistance;

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

  #onZoomIn = () => {
    // For reference genome
    const viewportDistance = this.end - this.start;
    const quarterViewportDistance = Math.max(Math.round(viewportDistance / 4), 1);
    const newStart = this.start + quarterViewportDistance;
    const newEnd = newStart + quarterViewportDistance * 2;

    // For the alternative genome, change location by the same distance as for reference genome
    const newAltStart = this.altStart + quarterViewportDistance;
    const newAltEnd = newAltStart + quarterViewportDistance * 2;

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

  #onZoomOut = () => {
    // For reference genome
    const viewportDistance = this.end - this.start;
    const newViewportDistance = Math.min(viewportDistance * 2, this.regionLength);
    const quarterNewDistance = Math.max(Math.round(newViewportDistance / 4), 1);

    const newStart = Math.max(this.start - quarterNewDistance, 1);
    const newEnd = Math.min(this.end + quarterNewDistance, this.regionLength);
  
    // For the alternative genome, change location by the same distance as for reference genome
    const newAltStart = Math.max(this.altStart - quarterNewDistance, 1);
    const newAltEnd = Math.min(this.altStart + newViewportDistance, this.regionLength);

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
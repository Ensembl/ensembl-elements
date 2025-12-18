import { html, css, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { ViewportChangePayload } from '../sv-browser';

const zoomInIcon = html`
  <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
    <path
      d="M8 3a1 1 0 0 1 1 1v3h3a1 1 0 1 1 0 2H9v3a1 1 0 1 1-2 0V9H4a1 1 0 0 1 0-2h3V4a1 1 0 0 1 1-1z"
      fill="currentColor"
    />
  </svg>
`;

const zoomOutIcon = html`
  <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
    <path
      d="M4 7h8a1 1 0 1 1 0 2H4a1 1 0 0 1 0-2z"
      fill="currentColor"
    />
  </svg>
`;

const arrowLeftIcon = html`
  <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
    <path
      d="M9.53 3.47a.75.75 0 0 1 0 1.06L6.06 8l3.47 3.47a.75.75 0 1 1-1.06 1.06l-4-4a.75.75 0 0 1 0-1.06l4-4a.75.75 0 0 1 1.06 0z"
      fill="currentColor"
    />
  </svg>
`;

const arrowRightIcon = html`
  <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
    <path
      d="M6.47 12.53a.75.75 0 0 1 0-1.06L9.94 8 6.47 4.53a.75.75 0 0 1 1.06-1.06l4 4a.75.75 0 0 1 0 1.06l-4 4a.75.75 0 0 1-1.06 0z"
      fill="currentColor"
    />
  </svg>
`;

const MIN_ZOOM_BP = 15;

@customElement('ens-navigation-controls')
export class NavigationControls extends LitElement {

  static styles = css`
    :host {
      display: inline-flex;
      flex: 0 0 auto;
      align-items: center;
      column-gap: 1rem;
    }

    .navigation-controls {
      display: flex;
      justify-content: flex-end;
      column-gap: 1rem;
    }

    button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      border: none;
      padding: 0;
      background: var(--color-blue, #0099ff);
      color: var(--color-white, #ffffff);
      cursor: pointer;
      transition: background-color 0.2s ease;
    }

    button:hover {
      background: var(--color-dark-blue, #0077cc);
    }

    button:disabled {
      background: var(--color-grey, #b7c0c8);
      color: var(--color-white, #ffffff);
      cursor: default;
    }

    button:disabled:hover {
      background: var(--color-grey, #b7c0c8);
    }

    button:focus-visible {
      outline: 2px solid var(--color-dark-blue, #0077cc);
      outline-offset: 2px;
    }

    button svg {
      width: 16px;
      height: 16px;
      display: block;
      fill: currentColor;
    }
  `;

  @property({ type: Number })
  start = 0;

  @property({ type: Number })
  end = 0;

  @property({ type: Number })
  alignmentAltStart = 0;

  @property({ type: Number })
  alignmentAltEnd = 0;

  @property({ type: Number })
  regionLength = 0;

  private isZoomInDisabled() {
    return this.end - this.start < MIN_ZOOM_BP;
  }

  private isZoomOutDisabled() {
    return this.start <= 1 && this.end >= this.regionLength;
  }

  private isPanLeftDisabled() {
    return this.start <= 1;
  }

  private isPanRightDisabled() {
    return this.end >= this.regionLength;
  }

  onZoomOut = () => {
    if (this.isZoomOutDisabled()) {
      return;
    }

    // For reference sequence
    const viewportDistance = this.end - this.start;

    const newViewportDistance = Math.min(viewportDistance * 2, this.regionLength);
    const quarterNewDistance = Math.max(Math.round(newViewportDistance / 4), 1);

    const newStart = Math.max(this.start - quarterNewDistance, 1);
    const newEnd = Math.min(this.end + quarterNewDistance, this.regionLength);
  
    // For alternative sequence
    const quarterNewAltDistance = quarterNewDistance;

    const newAltStart = Math.max(this.alignmentAltStart - quarterNewAltDistance, 1);
    const newAltEnd = Math.min(this.alignmentAltStart + newViewportDistance, this.regionLength);

    this.dispatchNewLocation({
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

  onZoomIn = () => {
    if (this.isZoomInDisabled()) {
      return;
    }

    // For reference sequence
    const viewportDistance = this.end - this.start;

    const quarterViewportDistance = Math.max(Math.round(viewportDistance / 4), 1);
    let newStart = this.start + quarterViewportDistance;
    let newEnd = newStart + quarterViewportDistance * 2;

    if (newEnd > this.regionLength) {
      newEnd = this.regionLength;
      newStart = Math.max(newEnd - quarterViewportDistance * 2, 1);
    }

    newStart = Math.max(newStart, 1);

    // For alt sequence
    const quarterNewAltViewportDistance = quarterViewportDistance;

    let newAltStart = this.alignmentAltStart + quarterNewAltViewportDistance;
    let newAltEnd = newAltStart + quarterNewAltViewportDistance * 2;

    newAltStart = Math.max(newAltStart, 1);
    if (newAltEnd > this.regionLength) {
      newAltEnd = this.regionLength;
      newAltStart = Math.max(newAltEnd - quarterNewAltViewportDistance * 2, 1);
    }

    this.dispatchNewLocation({
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

  onMoveLeft = () => {
    if (this.isPanLeftDisabled()) {
      return;
    }

    // For reference sequence
    const viewportDistance = this.end - this.start;
    const quarterViewportDistance = Math.round(viewportDistance / 4);

    const newStart = Math.max(this.start - quarterViewportDistance, 1);
    const newEnd = newStart + viewportDistance;
  
    // For alt sequence
    const altViewportDistance = this.alignmentAltEnd - this.alignmentAltStart;
    const quarterNewAltViewportDistance = Math.round(altViewportDistance / 4);

    const newAltStart = Math.max(this.alignmentAltStart - quarterNewAltViewportDistance, 1);
    const newAltEnd = newAltStart + altViewportDistance;

    this.dispatchNewLocation({
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

  onMoveRight = () => {
    if (this.isPanRightDisabled()) {
      return;
    }

    // For reference sequence
    const viewportDistance = this.end - this.start;
    const quarterViewportDistance = Math.round(viewportDistance / 4);

    const newEnd = Math.min(this.end + quarterViewportDistance, this.regionLength);
    const newStart = newEnd - viewportDistance;
  
    // For alt sequence
    const altViewportDistance = this.alignmentAltEnd - this.alignmentAltStart;
    const quarterNewAltViewportDistance = Math.round(altViewportDistance / 4);

    const newAltEnd = Math.min(this.alignmentAltEnd + quarterNewAltViewportDistance, this.regionLength);
    const newAltStart = newAltEnd - altViewportDistance;

    this.dispatchNewLocation({
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

  dispatchNewLocation = (payload: ViewportChangePayload) => {
    const event = new CustomEvent<ViewportChangePayload>('viewport-change', {
      detail: payload,
      bubbles: true,
      composed: true
    });

    this.dispatchEvent(event);
  }

  render() {
    const zoomInDisabled = this.isZoomInDisabled();
    const zoomOutDisabled = this.isZoomOutDisabled();
    const panLeftDisabled = this.isPanLeftDisabled();
    const panRightDisabled = this.isPanRightDisabled();

    return html`
      <div class="navigation-controls">
        <button
          type="button"
          @click=${this.onZoomIn}
          aria-label="Zoom in"
          title="Zoom in"
          ?disabled=${zoomInDisabled}
        >
          ${zoomInIcon}
        </button>
        <button
          type="button"
          @click=${this.onZoomOut}
          aria-label="Zoom out"
          title="Zoom out"
          ?disabled=${zoomOutDisabled}
        >
          ${zoomOutIcon}
        </button>
        <button
          type="button"
          @click=${this.onMoveLeft}
          aria-label="Pan left"
          title="Pan left"
          ?disabled=${panLeftDisabled}
        >
          ${arrowLeftIcon}
        </button>
        <button
          type="button"
          @click=${this.onMoveRight}
          aria-label="Pan right"
          title="Pan right"
          ?disabled=${panRightDisabled}
        >
          ${arrowRightIcon}
        </button>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ens-navigation-controls': NavigationControls;
  }
}

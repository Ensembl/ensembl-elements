import { html, css, LitElement } from 'lit';

import { customElement, property } from 'lit/decorators.js';

export type ViewportChangePayload = {
  reference: {
    start: number;
    end: number;
  },
  alt: {
    start: number;
    end: number;
  }
};

@customElement('control-buttons')
export class ControlButtons extends LitElement {

  static styles = css`
    :host {
      display: flex;
      column-gap: 2rem;
    }

    :host > div {
      display: flex;
      column-gap: 0.6rem;
    }
  `;

  @property({ type: Number })
  start = 0;

  @property({ type: Number })
  end = 0;

  @property({ type: Number })
  altStart = 0;

  // genomic end
  @property({ type: Number })
  altEnd = 0;

  @property({ type: Number })
  regionLength = Infinity;

  onZoomOut = () => {
    // For reference sequence
    const viewportDistance = this.end - this.start;
    const newViewportDistance = viewportDistance * 2;
    const quarterNewDistance = Math.round(newViewportDistance / 4);

    const newStart = Math.max(this.start - quarterNewDistance, 1);
    const newEnd = Math.min(this.end + quarterNewDistance, this.regionLength);
  
    // For the alternative sequence
    const quarterNewAltDistance = quarterNewDistance;

    const newAltStart = Math.max(this.altStart - quarterNewAltDistance, 1);
    const newAltEnd = Math.min(this.altStart + newViewportDistance, this.regionLength);

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
    // For reference sequence
    const viewportDistance = this.end - this.start;
    const quarterViewportDistance = Math.round(viewportDistance / 4);
  
    const newStart = this.start + quarterViewportDistance;
    const newEnd = newStart + quarterViewportDistance * 2;

    // For the alternative sequence
    const altViewportDistance = this.altEnd - this.altStart;
    const quarterNewAltViewportDistance = Math.round(altViewportDistance / 4);

    const newAltStart = this.altStart + quarterNewAltViewportDistance;
    const newAltEnd = newAltStart + quarterNewAltViewportDistance * 2;

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
    const event = new CustomEvent('viewport-change', {
      detail: payload
    });

    this.dispatchEvent(event);
  }


  render() {
    return html`
      <div>
        <button @click=${this.onZoomIn}>
          In
        </button>
        <button @click=${this.onZoomOut}>
          Out
        </button>
      </div>
    `;
  }
}

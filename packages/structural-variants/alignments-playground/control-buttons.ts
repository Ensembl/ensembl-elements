import { html, css, LitElement } from 'lit';

import { customElement, property } from 'lit/decorators.js';

export type ViewportChangePayload = {
  reference: {
    start: number;
    end: number;
  },
  target: {
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
  alignmentTargetStart = 0;

  // genomic end
  @property({ type: Number })
  alignmentTargetEnd = 0;

  @property({ type: Number })
  regionLength = Infinity;

  onZoomOut = () => {
    // For reference sequence
    const viewportDistance = this.end - this.start;
    const newViewportDistance = viewportDistance * 2;
    const quarterNewDistance = Math.round(newViewportDistance / 4);

    const newStart = Math.max(this.start - quarterNewDistance, 1);
    const newEnd = Math.min(this.end + quarterNewDistance, this.regionLength);
  
    // For target sequence
    const quarterNewTargetDistance = quarterNewDistance;

    const newTargetStart = Math.max(this.alignmentTargetStart - quarterNewTargetDistance, 1);
    const newTargetEnd = Math.min(this.alignmentTargetStart + newViewportDistance, this.regionLength);

    this.dispatchNewLocation({
      reference: {
        start: newStart,
        end: newEnd
      },
      target: {
        start: newTargetStart,
        end: newTargetEnd
      }
    });
  }

  onZoomIn = () => {
    // For reference sequence
    const viewportDistance = this.end - this.start;
    const quarterViewportDistance = Math.round(viewportDistance / 4);
  
    const newStart = this.start + quarterViewportDistance;
    const newEnd = newStart + quarterViewportDistance * 2;

    // For target sequence
    // const targetViewportDistance = this.alignmentTargetEnd - this.alignmentTargetStart;
    // const quarterNewTargetViewportDistance = Math.round(targetViewportDistance / 4);

    const quarterNewTargetViewportDistance = quarterViewportDistance;

    const newTargetStart = this.alignmentTargetStart + quarterNewTargetViewportDistance;
    const newTargetEnd = newTargetStart + quarterNewTargetViewportDistance * 2;

    this.dispatchNewLocation({
      reference: {
        start: newStart,
        end: newEnd
      },
      target: {
        start: newTargetStart,
        end: newTargetEnd
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

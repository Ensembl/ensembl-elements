import {html, css, LitElement} from 'lit';
import { customElement, property } from 'lit/decorators.js';


@customElement('ens-reg-zoom-buttons')
export class RegulationZoomButtons extends LitElement {
  static styles = css`
    :host {
      display: flex;
    }
  `;

  @property({ type: Number })
  start = 0;

  @property({ type: Number })
  end = 0;

  @property({ type: Number })
  regionLength = 0;

  onZoomOut = () => {
    const viewportDistance = this.end - this.start;
    const newViewportDistance = viewportDistance * 2;
    const quarterNewDistance = Math.round(newViewportDistance / 4);

    const newStart = Math.max(this.start - quarterNewDistance, 1);
    const newEnd = Math.min(this.end + quarterNewDistance, this.regionLength);
  
    this.dispatchNewLocation({
      start: newStart,
      end: newEnd
    });
  }

  onZoomIn = () => {
    const viewportDistance = this.end - this.start;
    const halfViewportDistance = Math.round(viewportDistance / 2);
    const quarterViewportDistance = Math.round(halfViewportDistance / 2);
  
    const newStart = this.start + quarterViewportDistance;
    const newEnd = newStart + halfViewportDistance;

    this.dispatchNewLocation({
      start: newStart,
      end: newEnd
    });
  }


  dispatchNewLocation = ({ start, end }: { start: number, end: number }) => {
    const event = new CustomEvent('viewport-change', {
      detail: {
        start,
        end
      }
    });

    this.dispatchEvent(event);
  }

  render() {
    return html`
      <button @click=${this.onZoomOut}>Out</button>
      <button @click=${this.onZoomIn}>In</button>
    `;
  }
}
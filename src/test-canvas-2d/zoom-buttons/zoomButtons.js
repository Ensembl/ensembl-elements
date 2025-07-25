var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html, css, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
let CanvasTestPage = class CanvasTestPage extends LitElement {
    constructor() {
        super(...arguments);
        this.start = 0;
        this.end = 0;
        this.regionLength = 0;
        this.onZoomOut = () => {
            const viewportDistance = this.end - this.start;
            const newViewportDistance = viewportDistance * 2;
            const quarterNewDistance = Math.round(newViewportDistance / 4);
            const newStart = Math.max(this.start - quarterNewDistance, 1);
            const newEnd = Math.min(this.end + quarterNewDistance, this.regionLength);
            this.dispatchNewLocation({
                start: newStart,
                end: newEnd
            });
        };
        this.onZoomIn = () => {
            const viewportDistance = this.end - this.start;
            const halfViewportDistance = Math.round(viewportDistance / 2);
            const quarterViewportDistance = Math.round(halfViewportDistance / 2);
            const newStart = this.start + quarterViewportDistance;
            const newEnd = newStart + halfViewportDistance;
            this.dispatchNewLocation({
                start: newStart,
                end: newEnd
            });
        };
        this.dispatchNewLocation = ({ start, end }) => {
            const event = new CustomEvent('viewport-change', {
                detail: {
                    start,
                    end
                }
            });
            this.dispatchEvent(event);
        };
    }
    static { this.styles = css `
    :host {
      display: flex;
    }
  `; }
    render() {
        return html `
      <button @click=${this.onZoomOut}>Out</button>
      <button @click=${this.onZoomIn}>In</button>
    `;
    }
};
__decorate([
    property({ type: Number })
], CanvasTestPage.prototype, "start", void 0);
__decorate([
    property({ type: Number })
], CanvasTestPage.prototype, "end", void 0);
__decorate([
    property({ type: Number })
], CanvasTestPage.prototype, "regionLength", void 0);
CanvasTestPage = __decorate([
    customElement('zoom-buttons')
], CanvasTestPage);
export { CanvasTestPage };

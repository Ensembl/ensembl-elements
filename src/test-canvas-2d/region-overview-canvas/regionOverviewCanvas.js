var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html, css, LitElement } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { scaleLinear } from 'd3';
import ViewportController from './viewportController';
import paintCanvas from './painter/painter';
let RegionOverviewCanvas = class RegionOverviewCanvas extends LitElement {
    constructor() {
        super(...arguments);
        // genomic start
        this.start = 0;
        // genomic end
        this.end = 0;
        this.data = null;
        this.scale = null;
    }
    static { this.styles = css `
    :host {
      display: block;
      height: 300px;
    }

    canvas {
      width: 100%;
      height: 100%;
      border: 1px dashed black;
    }
  `; }
    firstUpdated() {
        const { width: canvasDomWidth, height: canvasDomHeight } = this.canvas.getBoundingClientRect();
        this.canvas.width = canvasDomWidth * devicePixelRatio;
        this.canvas.height = canvasDomHeight * devicePixelRatio;
        this.scale = scaleLinear().domain([
            this.start,
            this.end
        ]).rangeRound([
            0,
            this.canvas.width
        ]);
        new ViewportController(this);
        paintCanvas({
            canvas: this.canvas,
            data: this.data,
            scale: this.scale
        });
    }
    updated() {
        this.scale = scaleLinear().domain([
            this.start,
            this.end
        ]).rangeRound([
            0,
            this.canvas.width
        ]);
        paintCanvas({
            canvas: this.canvas,
            data: this.data,
            scale: this.scale
        });
    }
    render() {
        return html `
      <canvas></canvas>
    `;
    }
};
__decorate([
    property({ type: Number })
], RegionOverviewCanvas.prototype, "start", void 0);
__decorate([
    property({ type: Number })
], RegionOverviewCanvas.prototype, "end", void 0);
__decorate([
    property({ type: Object })
], RegionOverviewCanvas.prototype, "data", void 0);
__decorate([
    query('canvas')
], RegionOverviewCanvas.prototype, "canvas", void 0);
RegionOverviewCanvas = __decorate([
    customElement('region-overview-canvas')
], RegionOverviewCanvas);
export { RegionOverviewCanvas };

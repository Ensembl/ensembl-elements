var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html, css, LitElement } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import './region-overview-canvas/regionOverviewCanvas';
import './zoom-buttons/zoomButtons';
import { createBins, createBinKey } from '../shared/helpers/binsHelper';
import dataStore from '../shared/services/dataStore';
// a location on chromosome 1 that has some features
const INITIAL_START = 58873313;
const INITIAL_END = 59273313;
const CHROMOSOME_LENGTH = 248956422; // length of chromosome 1
let CanvasTestPage = class CanvasTestPage extends LitElement {
    constructor() {
        super(...arguments);
        this.start = INITIAL_START;
        this.end = INITIAL_END;
        this.onViewportChange = (event) => {
            const { start, end } = event.detail;
            this.start = start;
            this.end = end;
        };
    }
    static { this.styles = css `
    .grid {
      display: grid;
      grid-template-columns: [left] 150px [middle] 1fr [right] 150px;
      margin-top: 2em;
    }

    region-overview-canvas {
      grid-column: middle;
    }
  `; }
    render() {
        const data = getDataForSlice({
            start: this.start,
            end: this.end
        });
        return html `
      <h1>This should test the painting of region overview with canvas 2d</h1>
      <div class="grid">
        <region-overview-canvas
          @viewport-change=${this.onViewportChange}
          .start=${this.start}
          .end=${this.end}
          .data=${data}>
        </region-overview-canvas>
        <zoom-buttons
          .start=${this.start}
          .end=${this.end}
          .regionLength=${CHROMOSOME_LENGTH}
          @viewport-change=${this.onViewportChange}
        ></zoom-buttons>
      </div>
    `;
    }
};
__decorate([
    state()
], CanvasTestPage.prototype, "start", void 0);
__decorate([
    state()
], CanvasTestPage.prototype, "end", void 0);
CanvasTestPage = __decorate([
    customElement('canvas-test-page')
], CanvasTestPage);
export { CanvasTestPage };
const isInQueriedSlice = (feature, query) => {
    return feature.end >= query.start && feature.start <= query.end;
};
const getDataForSlice = (query) => {
    const binKeys = createBins({
        start: query.start,
        end: query.end
    }).map(createBinKey);
    const genes = [];
    const regulatoryFeatures = [];
    for (let i = 0; i < binKeys.length; i++) {
        const key = binKeys[i];
        const bin = dataStore.bins[key];
        const prevBinKey = i > 0 ? binKeys[i - 1] : null;
        const prevBinEnd = prevBinKey
            ? parseInt(prevBinKey.split('-').pop())
            : null;
        for (const gene of bin.genes) {
            if (!isInQueriedSlice(gene, query)) {
                continue;
            }
            else if (prevBinEnd && gene.start <= prevBinEnd) {
                continue;
            }
            else {
                genes.push(gene);
            }
        }
        for (const regFeature of bin.regulatory_features) {
            if (!isInQueriedSlice(regFeature, query)) {
                continue;
            }
            else if (prevBinEnd && regFeature.start <= prevBinEnd) {
                continue;
            }
            else {
                regulatoryFeatures.push(regFeature);
            }
        }
    }
    return {
        genes,
        regulatory_features: regulatoryFeatures,
        regulatory_feature_types: dataStore.regulatory_feature_types
    };
};

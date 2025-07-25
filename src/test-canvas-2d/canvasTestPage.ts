import {html, css, LitElement} from 'lit';
import { customElement, state } from 'lit/decorators.js';

import './region-overview-canvas/regionOverviewCanvas';
import './zoom-buttons/zoomButtons';

import { createBins, createBinKey } from '../shared/helpers/binsHelper';

import dataStore from '../shared/services/dataStore';

import type { GeneInRegionOverview, RegulatoryFeature, RegulatoryFeatureMetadata } from '../shared/types/regionOverview';

// a location on chromosome 1 that has some features
const INITIAL_START = 58873313;
const INITIAL_END = 59273313;
const CHROMOSOME_LENGTH = 248956422; // length of chromosome 1

@customElement('canvas-test-page')
export class CanvasTestPage extends LitElement {
  static styles = css`
    .grid {
      display: grid;
      grid-template-columns: [left] 150px [middle] 1fr [right] 150px;
      margin-top: 2em;
    }

    region-overview-canvas {
      grid-column: middle;
    }
  `;

  @state()
  start = INITIAL_START;

  @state()
  end = INITIAL_END;

  onViewportChange = (event: CustomEvent) => {
    const { start, end } = event.detail;
    this.start = start;
    this.end = end;
  }

  render() {
    const data = getDataForSlice({
      start: this.start,
      end: this.end
    });

    return html`
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
}

const isInQueriedSlice = (
  feature: { start: number; end: number },
  query: { start: number; end: number }
) => {
  return feature.end >= query.start && feature.start <= query.end;
};

const getDataForSlice = (query: {
  start: number;
  end: number;
}) => {
  const binKeys = createBins({
    start: query.start,
    end: query.end
  }).map(createBinKey);

  const genes: GeneInRegionOverview[] = [];
  const regulatoryFeatures: RegulatoryFeature[] = [];

  for (let i = 0; i < binKeys.length; i++) {
    const key = binKeys[i];
    const bin = dataStore.bins[key];

    const prevBinKey = i > 0 ? binKeys[i - 1] : null;
    const prevBinEnd = prevBinKey
      ? parseInt(prevBinKey.split('-').pop() as string)
      : null;

    for (const gene of bin.genes) {
      if (!isInQueriedSlice(gene, query)) {
        continue;
      } else if (prevBinEnd && gene.start <= prevBinEnd) {
        continue;
      } else {
        genes.push(gene);
      }
    }

    for (const regFeature of bin.regulatory_features) {
      if (!isInQueriedSlice(regFeature, query)) {
        continue;
      } else if (prevBinEnd && regFeature.start <= prevBinEnd) {
        continue;
      } else {
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

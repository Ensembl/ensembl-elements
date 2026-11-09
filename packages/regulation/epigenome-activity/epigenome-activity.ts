import { html, css, svg, LitElement, type PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { scaleLinear, type ScaleLinear } from 'd3';

import {
  prepareActivityDataForDisplay,
  type TrackDataForDisplay
} from './prepare-data';
import { toZeroBased } from '../helpers/toZeroBased';
import { renderTrack } from './render-track';
import { getActivityLayout } from './layout';

import { type Colors } from './constants';

import type {
  TrackData,
  TrackVisibility,
  TrackMetadata,
  TrackPositionsPayload,
  SelectedLocation
} from './types';

@customElement('ens-reg-epigenome-activity')
export class EpigenomeActivity extends LitElement {

  static styles = css`
    :host {
      display: flex;
    }
  `

  @property({ type: Number })
  start = 0;

  @property({ type: Number })
  end = 0;

  @property({ type: Array })
  tracks: TrackData[] = [];

  @property({ type: Object })
  trackMetadata: TrackMetadata | null = null;

  @property({ attribute: false })
  trackVisibility: TrackVisibility = {};

  @property({ type: Number })
  minimumRowHeight = 32;

  get layout() {
    return getActivityLayout(this.trackMetadata ?? {}, this.trackVisibility, this.minimumRowHeight);
  }

  @property({ type: Array })
  selectedLocations: SelectedLocation[] = [];

  @property({ type: Object })
  colors: Partial<Colors> | null = null;

  @state()
  imageWidth = 0;

  @state()
  bedScale: ScaleLinear<number, number> | null = null;

  @state()
  preparedTracksData: TrackDataForDisplay[] = [];

  #reportedPositions = '';

  connectedCallback(): void {
    super.connectedCallback();
    this.#observeHostSize();
  }

  willUpdate(changedProperties: PropertyValues) {
    const shouldUpdateScale =
      changedProperties.has('start') ||
      changedProperties.has('end') ||
      changedProperties.has('imageWidth');

    if (shouldUpdateScale) {
      this.#updateScale();
    }

    if (
      shouldUpdateScale ||
      changedProperties.has('tracks') ||
      changedProperties.has('trackMetadata') ||
      changedProperties.has('trackVisibility') ||
      changedProperties.has('minimumRowHeight')
    ) {
      this.#updatePreparedTracksData();
    }
  }

  updated() {
    this.#reportTrackPositions();
  }

  #observeHostSize = () => {
    const resizeObserver = new ResizeObserver((entries) => {
      const [hostElementEntry] = entries;
      const { width: hostWidth } = hostElementEntry.contentRect;
      this.imageWidth = Math.round(hostWidth);
    });

    resizeObserver.observe(this);
  }

  #updateScale() {
    this.bedScale = scaleLinear().domain([
      toZeroBased(this.start),
      this.end
    ]).range([
      0,
      this.imageWidth
    ]);
  }

  #updatePreparedTracksData() {
    const bedScale = this.bedScale;
    if (!bedScale || !this.trackMetadata || !this.tracks.length) {
      this.preparedTracksData = [];
      return;
    }

    this.preparedTracksData = prepareActivityDataForDisplay({
      location: { start: this.start, end: this.end },
      scale: bedScale,
      trackMetadata: this.trackMetadata,
      tracks: this.tracks,
      trackVisibility: this.trackVisibility,
      minimumRowHeight: this.minimumRowHeight
    });
  }

  #reportTrackPositions() {
    const height = this.layout.rowHeight;
    const positions: TrackPositionsPayload = this.tracks.map(track => track.epigenome_ids)
      .map((id, index) => ({ id: [...id], y: index * height, height }));
    const serialized = JSON.stringify(positions);
    if (serialized !== this.#reportedPositions) {
      this.#reportedPositions = serialized;
      this.dispatchEvent(new CustomEvent('track-positions-change', { detail: positions }));
    }
  }

  render() {
    if (!this.bedScale || !this.preparedTracksData.length) {
      return null;
    }

    const imageHeight = this.layout.rowHeight * this.preparedTracksData.length;

    return html`
      <svg
        viewBox="0 0 ${this.imageWidth} ${imageHeight}"
        style="width: 100%; height: ${imageHeight}px;"
      >
        ${this.#renderTracks({ tracks: this.preparedTracksData })}
        ${this.#renderVerticalRules({ imageHeight })}
      </svg>
    `
  }

  #renderTracks({
    tracks
  }: {
    tracks: TrackDataForDisplay[]
  }) {
    const renderedTracks: ReturnType<typeof svg>[] = [];

    for (const [index, track] of tracks.entries()) {
      for (const preparedTrack of track.tracks) {
        renderedTracks.push(...renderTrack({
          trackData: preparedTrack,
          offsetTop: index * this.layout.rowHeight,
          colors: this.colors
        }));
      }
    }

    return renderedTracks;
  }

  #renderVerticalRules({
    imageHeight
  }: {
    imageHeight: number;
  }) {
    const scale = this.bedScale;
    if (!scale) {
      return null;
    }

    return this.selectedLocations.map(location => {
      const startX = scale(toZeroBased(location.start));
      const endX = scale(location.end);

      return svg`
        <line
          x1=${startX}
          x2=${startX}
          y1="0"
          y2=${imageHeight}
          stroke="red"
          stroke-dasharray="2"
        />

        <line
          x1=${endX}
          x2=${endX}
          y1="0"
          y2=${imageHeight}
          stroke="red"
          stroke-dasharray="2"
        />
      `;
    });
  }
}


declare global {
  interface HTMLElementTagNameMap {
    'ens-reg-epigenome-activity': EpigenomeActivity;
  }
}

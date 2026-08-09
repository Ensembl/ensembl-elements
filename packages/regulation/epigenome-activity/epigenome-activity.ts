import { html, css, svg, LitElement, type PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { scaleLinear, type ScaleLinear } from 'd3';

import {
  prepareActivityDataForDisplay,
  type TrackDataForDisplay
} from './prepare-data';
import { toZeroBased } from '../helpers/toZeroBased';
import {
  renderOpenChromatinSignals,
  renderOpenChromatinPeaks,
  renderHistoneNarrowPeaks,
  renderHistoneGappedPeaks
} from './render-track';

import { TRACK_HEIGHT, type Colors } from './constants';

import type {
  TrackData,
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

  trackIds: string[][] = [];

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
      changedProperties.has('trackMetadata')
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
      tracks: this.tracks
    });
  }

  #reportTrackPositions() {
    // Check if the list of track ids has changed since previous render,
    // and report to outside if it did
    const trackIds = this.tracks.map(track => track.epigenome_ids);
    const stringifiedTrackIds = JSON.stringify(trackIds);
    const stringifiedSavedTrackIds = JSON.stringify(this.trackIds);
    if (stringifiedTrackIds !== stringifiedSavedTrackIds) {
      this.trackIds = trackIds;
      const trackPositionsPayload: TrackPositionsPayload = trackIds.map((id, index) => {
        return {
          id,
          y: index * TRACK_HEIGHT,
          height: TRACK_HEIGHT
        };
      });
      const event = new CustomEvent('track-positions-change', {
        detail: trackPositionsPayload
      });
      this.dispatchEvent(event);
    }
  }

  render() {
    if (!this.bedScale || !this.preparedTracksData.length) {
      return null;
    }

    const imageHeight = TRACK_HEIGHT * this.preparedTracksData.length;

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
      renderedTracks.push(
        ...renderOpenChromatinSignals({
          trackData: track,
          offsetTop: index * TRACK_HEIGHT,
          colors: this.colors
        }),
        ...renderOpenChromatinPeaks({
          trackData: track,
          offsetTop: index * TRACK_HEIGHT,
          colors: this.colors
        }),
        ...renderHistoneNarrowPeaks({
          trackData: track,
          offsetTop: index * TRACK_HEIGHT
        }),
        ...renderHistoneGappedPeaks({
          trackData: track,
          offsetTop: index * TRACK_HEIGHT
        })
      );
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

import { html, css, LitElement, type PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { scaleLinear, type ScaleLinear } from 'd3';

import { prepareActivityDataForDisplay } from './prepare-data';
import { toZeroBased } from '../helpers/toZeroBased';
import {
  renderOpenChromatinSignals,
  renderOpenChromatinPeaks,
  renderHistoneNarrowPeaks,
  renderHistoneGappedPeaks
} from './render-track';

import { TRACK_HEIGHT } from './constants';

import type { TrackData, TrackMetadata, TrackPositionsPayload } from './types';

@customElement('ens-reg-epigenome-activity')
export class EpigenomeActivity extends LitElement {

  static styles = css`
    :host {
      display: block;
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

  @state()
  imageWidth = 0;

  @state()
  bedScale: ScaleLinear<number, number> | null = null;

  trackIds: string[][] = [];

  connectedCallback(): void {
    super.connectedCallback();
    this.#observeHostSize();
  }

  willUpdate(changedProperties: PropertyValues) {
    if (
      changedProperties.has('start') ||
      changedProperties.has('end') ||
      changedProperties.has('imageWidth')
    ) {
      this.#updateScale();
    }
  }

  updated() {
    this.#reportTrackPositions();
  }

  #observeHostSize = () => {
    const resizeObserver = new ResizeObserver((entries) => {
      const [hostElementEntry] = entries;
      const { width: hostWidth } = hostElementEntry.contentRect;
      this.imageWidth = hostWidth;
    });

    resizeObserver.observe(this);
  }

  #updateScale() {
    this.bedScale = scaleLinear().domain([
      toZeroBased(this.start),
      this.end
    ]).rangeRound([
      0,
      this.imageWidth
    ]);
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
    if(!this.bedScale || !this.trackMetadata || !this.tracks.length) {
      return null;
    }

    const preparedTracksData = prepareActivityDataForDisplay({
      location: { start: this.start, end: this.end },
      scale: this.bedScale,
      trackMetadata: this.trackMetadata,
      tracks: this.tracks
    });
    const imageHeight = TRACK_HEIGHT * preparedTracksData.length;

    return html`
      <svg
        viewBox="0 0 ${this.imageWidth} ${imageHeight}"
        style="width: 100%; height: ${imageHeight}px;"
      >
        ${this.#renderTracks({ tracks: preparedTracksData })}
      </svg>
    `
  }

  #renderTracks({
    tracks
  }: {
    tracks: ReturnType<typeof prepareActivityDataForDisplay>
  }) {
    return tracks.map((track, index) => {
      return [
        renderOpenChromatinSignals({
          trackData: track,
          offsetTop: index * TRACK_HEIGHT
        }),
        renderOpenChromatinPeaks({
          trackData: track,
          offsetTop: index * TRACK_HEIGHT
        }),
        renderHistoneNarrowPeaks({
          trackData: track,
          offsetTop: index * TRACK_HEIGHT
        }),
        renderHistoneGappedPeaks({
          trackData: track,
          offsetTop: index * TRACK_HEIGHT
        })
      ];
    });
  }
}


declare global {
  interface HTMLElementTagNameMap {
    'ens-reg-epigenome-activity': EpigenomeActivity;
  }
}
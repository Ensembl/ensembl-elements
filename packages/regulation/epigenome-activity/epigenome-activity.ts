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

import { TrackData, TrackMetadata } from './types';

@customElement('ens-reg-epigenome-activity')
export class RegionOverview extends LitElement {

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
        ${this.renderTracks({ tracks: preparedTracksData })}
      </svg>
    `
  }

  renderTracks({
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
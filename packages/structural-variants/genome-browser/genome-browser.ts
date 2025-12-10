import { html, css, LitElement, type PropertyValues } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';

import initializeGenomeBrowser, { GenomeBrowser as EnsemblGenomeBrowser, type InitOutput } from '@ensembl/ensembl-genome-browser';
import GenomeBrowserDragController from './controllers/genome-browser-drag-controller';
import type { GenomeBrowserConfig, TrackSummaryPayload, HotspotPayload } from './types/genome-browser';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const isUuid = (value: string) => UUID_REGEX.test(value);

@customElement('ens-sv-genome-browser')
export class GenomeBrowser extends LitElement {

  static styles = css`
    :host {
      display: block;
      min-height: 180px;
      height: auto;
      contain: layout;
    }
    
    #viewport {
      width: 100%;
      height: auto;
      min-height: inherit;
      overflow: hidden;
      position: relative;
    }
    
    #viewport canvas {
      display: block;
      width: 100%;
      height: auto;
    }
  `;

  static initPromise: Promise<InitOutput> | null = null;
  
  genomeBrowser!: EnsemblGenomeBrowser;
  dragController: GenomeBrowserDragController;

  @query('#viewport', true)
  viewport!: HTMLElement;

  @query('canvas', true)
  canvas!: HTMLCanvasElement;

  @property()
  genomeId!: string;

  @property()
  regionName!: string;

  @property({ type: Number })
  regionLength!: number;

  @property({ type: Number })
  start!: number;

  @property({ type: Number })
  end!: number;

  @property({ type: Array })
  tracks: string[] = [];

  @property({ type: String })
  endpoint = '/api/browser/data';

  #stopWheelPropagation = (event: WheelEvent) => {
    event.stopImmediatePropagation();
  };

  constructor() {
    super();
    this.dragController = new GenomeBrowserDragController(this);
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener('wheel', this.#stopWheelPropagation, { capture: true });
  }

  disconnectedCallback(): void {
    this.removeEventListener('wheel', this.#stopWheelPropagation, { capture: true });
    super.disconnectedCallback();
  }
  
  #handleGenomeBrowserMessage = (kind: string, ...more: unknown[]) => {
    if (kind === 'track_summary') {
      const [payload] = more as [TrackSummaryPayload?];
      this.dispatchEvent(new CustomEvent('track-message', {
        detail: payload,
        bubbles: true,
        composed: true
      }));
    } else if (kind === 'hotspot') {
      const [payload] = more as [HotspotPayload?];
      this.dispatchEvent(new CustomEvent('hotspot-message', {
        detail: payload,
        bubbles: true,
        composed: true
      }));
    } else if (kind === 'error') {
      console.error('[GenomeBrowser error]', ...more);
    }
  };

  protected firstUpdated(): void {
    const endpoint = typeof this.endpoint === 'string' ? this.endpoint.trim() : '';
    const backendUrl = endpoint || '/api/browser/data';
    const gbConfig: GenomeBrowserConfig = {
      backend_url: backendUrl,
      target_element: this.viewport
    };

    const initPromise = GenomeBrowser.initPromise ?? initializeGenomeBrowser();
    GenomeBrowser.initPromise = initPromise;

    initPromise.then(() => {
      const gb = this.genomeBrowser = new EnsemblGenomeBrowser();
      gb.go(gbConfig);
      gb.set_message_reporter(this.#handleGenomeBrowserMessage);
      gb.switch(['settings', 'no-padding'], true);
      gb.switch(['ruler'], false);
      gb.switch(['ruler', 'one_based'], false);
      gb.switch(['track', 'sv-gene'], true);
      this.tracks.forEach((trackId) => {
        const base = isUuid(trackId) ? ['track', 'expand'] : ['track'];
        gb.switch([...base, trackId], true);
      });
      gb.set_stick(`${this.genomeId}:${this.regionName}`);
      gb.goto(this.start, this.end);
      this.dragController.addCanvasListener();
    });
  }

  protected willUpdate(changedProperties: PropertyValues<this>): void {
    if (!this.genomeBrowser || this.dragController.isDragging) {
      return;
    }

    if (changedProperties.has('genomeId') || changedProperties.has('regionName')) {
      this.genomeBrowser.set_stick(`${this.genomeId}:${this.regionName}`);
    }

    if (changedProperties.has('start') || changedProperties.has('end')) {
      this.genomeBrowser.goto(this.start, this.end);
    }
  }

  protected updated(changedProperties: PropertyValues<this>): void {
    super.updated(changedProperties);
  }

  render() {
    return html`
      <div id="viewport">
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ens-sv-genome-browser': GenomeBrowser;
  }
}

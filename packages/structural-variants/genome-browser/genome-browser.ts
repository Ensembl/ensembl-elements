import { html, css, LitElement, type PropertyValues } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { ref } from 'lit/directives/ref.js';
import { styleMap } from 'lit/directives/style-map.js';

import initializeGenomeBrowser, { GenomeBrowser as EnsemblGenomeBrowser, type InitOutput } from '@ensembl/ensembl-genome-browser';
import GenomeBrowserDragController from './controllers/genome-browser-drag-controller';
import '@ensembl/ensembl-elements-common/components/popup/popup.js';
import './gene-tooltip';

import type { GenomeBrowserConfig, PointerPosition, TrackSummaryPayload } from './types/genome-browser';
import type { HotspotPayload, TooltipState } from './types/tooltip';

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
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

    .tooltip-anchor {
      position: absolute;
      pointer-events: none;
      width: 1px;
      height: 1px;
    }

  `;

  static initPromise: Promise<InitOutput> | null = null;
  
  genomeBrowser!: EnsemblGenomeBrowser;
  dragController: GenomeBrowserDragController;

  @state()
  private tooltip: TooltipState | null = null;

  private tooltipAnchor: HTMLElement | null = null;

  private lastPointerPosition: PointerPosition | null = null;

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

  #setTooltipAnchor = (element?: Element | null) => {
    const anchor = (element ?? null) as HTMLElement | null;
    if (this.tooltipAnchor !== anchor) {
      this.tooltipAnchor = anchor;
      this.requestUpdate();
    }
  };

  #clearTooltip = () => {
    if (this.tooltip !== null) {
      this.tooltip = null;
    }
    if (this.tooltipAnchor) {
      this.tooltipAnchor = null;
    }
  };

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
    this.addEventListener('pointermove', this.#handlePointerMove, { capture: true });
    this.addEventListener('pointerdown', this.#handlePointerMove, { capture: true });
    this.addEventListener('pointerleave', this.#handlePointerLeave, { capture: true });
  }

  disconnectedCallback(): void {
    this.removeEventListener('wheel', this.#stopWheelPropagation, { capture: true });
    this.removeEventListener('pointermove', this.#handlePointerMove, { capture: true });
    this.removeEventListener('pointerdown', this.#handlePointerMove, { capture: true });
    this.removeEventListener('pointerleave', this.#handlePointerLeave, { capture: true });
    super.disconnectedCallback();
  }

  #handlePointerMove = (event: PointerEvent) => {
    const viewport = this.viewport;
    if (!viewport) {
      return;
    }

    const rect = viewport.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (x < 0 || y < 0 || x > rect.width || y > rect.height) {
      this.lastPointerPosition = null;
      return;
    }

    this.lastPointerPosition = { x, y };
  };

  #handlePointerLeave = () => {
    this.lastPointerPosition = null;
  };
  
  #handleGenomeBrowserMessage = (kind: string, ...more: unknown[]) => {
    if (kind === 'track_summary') {
      const [payload] = more as [TrackSummaryPayload?];
      const summary = Array.isArray(payload?.summary) ? payload.summary : [];
      const tracks = summary
        .filter((entry) => entry?.type === 'track' && entry['switch-id'])
        .map((entry) => ({
          switchId: entry['switch-id'] as string,
          offset: entry.offset ?? 0,
          height: entry.height ?? 0
        }));

      this.dispatchEvent(new CustomEvent('track-message', {
        detail: { tracks },
        bubbles: true,
        composed: true
      }));
      
      return;
    }

    if (kind === 'hotspot') {
      const [payload] = more as [HotspotPayload?];
      this.#handleHotspotMessage(payload);
      return;
    }

    if (kind === 'error') {
      console.error('[GenomeBrowser error]', ...more);
      return;
    }

  };

  #handleHotspotMessage(payload?: HotspotPayload | null) {
    const pointer = this.#getPointerPosition();
    if (!payload || !Array.isArray(payload.content) || payload.content.length === 0 || !pointer) {
      this.#clearTooltip();
      return;
    }

    this.tooltip = {
      contentItems: payload.content,
      pointer
    };
  }

  #getPointerPosition(): PointerPosition | null {
    const viewport = this.viewport;
    const pointer = this.lastPointerPosition;

    if (!viewport || !pointer) {
      return null;
    }

    const containerWidth = Math.max(viewport.clientWidth, 1);
    const containerHeight = Math.max(viewport.clientHeight, 1);

    const maxLeft = Math.max(containerWidth - 1, 0);
    const maxTop = Math.max(containerHeight - 1, 0);

    const left = clamp(pointer.x, 0, maxLeft);
    const top = clamp(pointer.y, 0, maxTop);

    return { x: left, y: top };
  }

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

    if (
      this.tooltip &&
      (changedProperties.has('start') || changedProperties.has('end') || changedProperties.has('regionName'))
    ) {
      this.#clearTooltip();
    }
  }

  render() {
    const tooltip = this.tooltip;
    const pointer = tooltip?.pointer ?? null;

    return html`
      <div id="viewport">
        ${tooltip && pointer
          ? html`
              <div
                class="tooltip-anchor"
                style=${styleMap({
                  left: `${pointer.x}px`,
                  top: `${pointer.y}px`,
                  width: '1px',
                  height: '1px'
                })}
                ${ref(this.#setTooltipAnchor)}
              ></div>
              ${this.tooltipAnchor
                ? html`
                    <ens-popup
                      .anchor=${this.tooltipAnchor}
                      placement="bottom"
                      @ens-popup-click-outside=${this.#clearTooltip}
                    >
                      <ens-sv-gene-tooltip
                        .contentItems=${tooltip.contentItems}
                        .genomeId=${this.genomeId}
                      ></ens-sv-gene-tooltip>
                    </ens-popup>
                  `
                : null}
            `
          : null}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ens-sv-genome-browser': GenomeBrowser;
  }
}

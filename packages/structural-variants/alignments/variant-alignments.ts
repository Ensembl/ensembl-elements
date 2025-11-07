import { html, css, LitElement, type PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { scaleLinear, type ScaleLinear } from 'd3';
import { yieldToMain } from '@ensembl/ensembl-elements-helpers';

import { RULER_HEIGHT, ALIGNMENT_AREA_HEIGHT, IMAGE_HEIGHT } from './constants/constants';

import DragController from './controllers/drag-controller';

import { renderVariants } from './parts/variants';
import { renderAlignments } from './parts/alignments';
import { renderRuler } from './parts/ruler';

import type { Variant, VariantClickPayload } from './types/variant';
import type { Alignment } from './types/alignment';

import '@ensembl/ensembl-elements-common/styles/custom-properties.css';

export type InputData = {
  variants: Variant[];
  alignments: Alignment[];
};

@customElement('ens-sv-alignments')
export class VariantAlignments extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    svg {
      display: block;
      user-select: none;
      cursor: ew-resize;
    }

    .variant {
      cursor: pointer;
    }

    .variant:hover {
      fill: pink;
    }

    .variant-popup {
      font-family: var(--font-family-body);
      font-size: var(--body-font-size);
      line-height: var(--body-line-height);
      color: var(--color-white);
    }

    .variant-popup .row span + span {
      margin-left: 1ch;
      font-weight: 500;
    }

    .variant-popup .light {
      font-weight: 300;
    }
  `;

  // genomic start
  @property({ type: Number })
  start = 0;

  // genomic end
  @property({ type: Number })
  end = 0;

  @property({ type: Number })
  regionLength = 0;

  // genomic start
  @property({ type: Number })
  alignmentTargetStart = 0;

  // genomic end
  @property({ type: Number })
  alignmentTargetEnd = 0;

  @property({ type: String })
  regionName = '';

  @property({ type: Object })
  data: InputData | null = null;

  @state()
  imageWidth = 0;

  @state()
  selectedVariant: VariantClickPayload | null = null;

  scale: ScaleLinear<number, number> | null = null;
  targetSequenceScale: ScaleLinear<number, number> | null = null;

  constructor() {
    super();
    new DragController(this);
  }

  #onVariantTooltipDismiss = () => {
    this.selectedVariant = null;
  };

  connectedCallback(): void {
    super.connectedCallback();
    this.setListeners();
    this.observeHostSize();
  }

  setListeners() {
    this.shadowRoot.addEventListener('click', (event) => {
      const element = event.target as HTMLElement;
      const elementData = element.dataset;
      const { featureType } = elementData;

      if (featureType === 'variant') {
        const {
          variantType,
          name,
          variantStart,
          variantEnd
        } = elementData;

        const payload: VariantClickPayload = {
            variantType,
            variantName: name,
            variantStart,
            variantEnd,
            anchor: element
        };

        this.selectedVariant = payload;

        const customEvent = new CustomEvent<VariantClickPayload>('variant-clicked', {
          detail: payload
        });
        this.dispatchEvent(customEvent);
      }
    });
  }

  willUpdate(changedProperties: PropertyValues) {
    this.#updateReferenceScale();
    this.#updateTargetSequenceScale();

    if (changedProperties.has('data') && this.selectedVariant) {
      this.selectedVariant = null;
    }
  }

  async scheduleUpdate(): Promise<void> {
    await yieldToMain();
    super.scheduleUpdate();
  }

  observeHostSize = () => {
    const resizeObserver = new ResizeObserver((entries) => {
      const [hostElementEntry] = entries;
      const { width: hostWidth } = hostElementEntry.contentRect;
      this.imageWidth = hostWidth;
    });

    resizeObserver.observe(this);
  }

  render() {
    if (!this.imageWidth || !this.scale || !this.data) {
      return;
    }

    // - remember that we have two scales: one for immediate viewport; the other for three viewports
    // - draw gene tracks
    // - draw regulatory feature tracks
    // - draw container for translating image contents

    // ${this.renderAlignments()}

    return html`
      <svg
        viewBox="0 0 ${this.imageWidth} ${IMAGE_HEIGHT}"
        style="width: 100%; height: ${IMAGE_HEIGHT}px;"
      >
        <g>
          ${this.renderTopRuler()}
          ${this.renderAlignments()}
          ${this.renderVariants()}
          ${this.renderBottomRuler()}
        </g>
      </svg>
      <slot name="tooltip">
      </slot>
    `;
  }

  renderVariants() {
    return renderVariants({
      variants: this.data.variants,
      scale: this.scale
    });
  }

  renderAlignments() {
    const scale = this.targetSequenceScale;

    return renderAlignments({
      alignments: this.data.alignments,
      referenceScale: this.scale,
      targetScale: scale
    });
  }

  renderTopRuler() {
    const [ start, end ] = this.scale.domain();

    return renderRuler({
      offsetTop: 0,
      scale: this.scale
    });
  }

  renderBottomRuler() {
    const [ start, end ] = this.targetSequenceScale.domain();

    return renderRuler({
      offsetTop: RULER_HEIGHT + ALIGNMENT_AREA_HEIGHT,
      scale: this.targetSequenceScale
    });
  }

  #updateReferenceScale() {
    this.scale = scaleLinear().domain([
      this.start,
      this.end
    ]).rangeRound([
      0,
      this.imageWidth
    ]);
  }

  #updateTargetSequenceScale() {
    this.targetSequenceScale = scaleLinear().domain([
      this.alignmentTargetStart,
      this.alignmentTargetEnd
    ]).rangeRound([
      0,
      this.imageWidth
    ]);
  }

}
import { html, css, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { scaleLinear, type ScaleLinear } from 'd3';
import { yieldToMain } from '@ensembl/ensembl-elements-helpers';

import { RULER_HEIGHT, ALIGNMENT_AREA_HEIGHT, IMAGE_HEIGHT } from './constants/constants';

import DragController from './controllers/drag-controller';

import { renderVariants } from './parts/variants';
import { renderAlignments } from './parts/alignments';
import { renderRuler } from './parts/ruler';

import type { Variant, VariantClickEventDetail } from './types/variant';
import type { Alignment } from './types/alignment';

export type InputData = {
  variants: Variant[];
  alignments: Alignment[];
};

@customElement('ens-sv-alignments-image')
export class VariantAlignmentsImage extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    svg {
      display: block;
      user-select: none;
    }

    .variant {
      cursor: pointer;
    }

    .variant:hover {
      fill: pink;
    }
  `;

  // genomic start on the reference genome region
  @property({ type: Number })
  start = 0;

  // genomic end on the reference genome region
  @property({ type: Number })
  end = 0;

  // name of the reference genome region
  @property({ type: String })
  regionName = '';

  // length of the reference genome region
  @property({ type: Number })
  regionLength = 0;

  // genomic start on the alternative genome region
  @property({ type: Number })
  altStart = 0;

  // genomic end on the alternative genome region
  @property({ type: Number })
  altEnd = 0;

  // length of the alternative genome region
  @property({ type: Number })
  altRegionLength = 0;

  @property({ type: Object })
  data: InputData | null = null;

  @state()
  imageWidth = 0;

  scale: ScaleLinear<number, number> | null = null;
  altSequenceScale: ScaleLinear<number, number> | null = null;

  constructor() {
    super();
    new DragController(this);
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.observeHostSize();
  }

  #handleClick = (event: PointerEvent) => {
    const element = event.target as HTMLElement;
    const elementData = element.dataset;
    const { featureType } = elementData;

    if (featureType === 'variant') {
      const variantType = elementData.variantType as string;
      const variantName = elementData.name as string;
      const variantConsequence = elementData.variantConsequence as string;
      const variantExtent = elementData.variantExtent as string;
      const variantRegionName = elementData.variantRegionName as string;
      const variantStart = elementData.variantStart as string;
      const variantEnd = elementData.variantEnd as string;

      const x = event.offsetX;
      const y = event.offsetY;

      const payload: VariantClickEventDetail = {
        name: variantName,
        type: variantType,
        consequence: variantConsequence,
        extent: Number(variantExtent),
        location: {
          region_name: variantRegionName,
          start: Number(variantStart),
          end: Number(variantEnd)
        },
        x,
        y
      };

      const customEvent = new CustomEvent<VariantClickEventDetail>('variant-click', {
        detail: payload
      });
      this.dispatchEvent(customEvent);
    }

  }

  willUpdate() {
    this.#updateReferenceScale();
    this.#updateAltSequenceScale();
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

    return html`
      <svg
        viewBox="0 0 ${this.imageWidth} ${IMAGE_HEIGHT}"
        style="width: 100%; height: ${IMAGE_HEIGHT}px;"
        @pointerup=${this.#handleClick}
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
      variants: this.data!.variants,
      scale: this.scale as ScaleLinear<number, number>
    });
  }

  renderAlignments() {
    const scale = this.altSequenceScale;

    return renderAlignments({
      alignments: this.data!.alignments,
      referenceScale: this.scale as ScaleLinear<number, number>,
      altScale: scale as ScaleLinear<number, number>
    });
  }

  renderTopRuler() {
    return renderRuler({
      offsetTop: 0,
      scale: this.scale as ScaleLinear<number, number>
    });
  }

  renderBottomRuler() {
    return renderRuler({
      offsetTop: RULER_HEIGHT + ALIGNMENT_AREA_HEIGHT,
      scale: this.altSequenceScale as ScaleLinear<number, number>
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

  #updateAltSequenceScale() {
    this.altSequenceScale = scaleLinear().domain([
      this.altStart,
      this.altEnd
    ]).rangeRound([
      0,
      this.imageWidth
    ]);
  }

}


declare global {
  interface HTMLElementTagNameMap {
    'ens-sv-alignments-image': VariantAlignmentsImage;
  }
}
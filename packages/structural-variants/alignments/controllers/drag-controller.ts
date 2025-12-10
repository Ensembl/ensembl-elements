import { RULER_HEIGHT } from '../constants/constants';

import type { ReactiveController } from 'lit';
import type { ScaleLinear } from 'd3';

import type { VariantAlignmentsImage } from '../variant-alignments-image';

type DraggingMode = 'reference' | 'alt' | 'both';

class DragController implements ReactiveController {
  private host: VariantAlignmentsImage;

  isMouseDown = false;
  isDragging = false;

  mouseDownX: number | null = null;
  mouseDownY: number | null = null;

  #alignmentReferenceStart: number | null = null;
  #alignmentReferenceEnd: number | null = null;
  #altStart: number | null = null;
  #altEnd: number | null = null;
  #referenceSequenceScale: ScaleLinear<number, number> | null = null;
  #altSequenceScale: ScaleLinear<number, number> | null = null;

  #regionLength: number| null = null;
  #draggingMode: DraggingMode | null = null;

  constructor(host: VariantAlignmentsImage) {
    this.host = host;
    host.addController(this);
  }

  hostConnected() {
    this.host.addEventListener('mousedown', this.#onMouseDown);
  }

  hostDisconnected() {
    this.host.removeEventListener('mousedown', this.#onMouseDown);
  };

  #onMouseDown = (event: MouseEvent) => {
    this.isMouseDown = true;
    const { clientX: x, clientY: y } = event;
    this.mouseDownX = x;
    this.mouseDownY = y;

    this.#syncDataFromHost();
    this.#setDraggingMode(event);

    document.addEventListener('mousemove', this.#onMouseMove);
    document.addEventListener('mouseup', this.#onMouseUp);
  }

  #onMouseMove = (event: MouseEvent) => {
    this.isDragging = true;

    const { clientX: x } = event;
    const mouseDownX = this.mouseDownX as number;

    const deltaX = x - mouseDownX;

    const directionCoefficient = deltaX >= 0 ? 1 : -1;

    const eventData = {
      reference: this.#calculateCoordsForReference({ deltaX, directionCoefficient }),
      alt: this.#calculateCoordsForAlt({ deltaX, directionCoefficient })
    }

    const locationChangeEvent = new CustomEvent('location-change', {
      bubbles: true,
      composed: true,
      detail: eventData
    });
    this.host.dispatchEvent(locationChangeEvent);
  }

  #calculateCoordsForReference = ({
    deltaX,
    directionCoefficient
  }: {
    deltaX: number;
    directionCoefficient: number;
  }) => {
    if (this.#draggingMode === 'alt') {
      // report unchanged coordinates for reference
      return {
        start: this.#alignmentReferenceStart,
        end: this.#alignmentReferenceEnd
      }
    }

    const scale = this.#referenceSequenceScale as ScaleLinear<number, number>;
    const genomicStart = this.#alignmentReferenceStart as number;
    const genomicEnd = this.#alignmentReferenceEnd as number;
    const regionLength = this.#regionLength as number;

    let genomicDistance = Math.round(scale.invert(Math.abs(deltaX))) - genomicStart;

    genomicDistance = genomicDistance * directionCoefficient;
    
    const newGenomicStart = Math.max(genomicStart - genomicDistance, 1);
    const newGenomicEnd = Math.min(genomicEnd - genomicDistance, regionLength);

    return {
      start: newGenomicStart,
      end: newGenomicEnd
    }
  }

  #calculateCoordsForAlt = ({
    deltaX,
    directionCoefficient
  }: {
    deltaX: number;
    directionCoefficient: number;
  }) => {
    if (this.#draggingMode === 'reference') {
      // report unchanged coordinates for target
      return {
        start: this.#altStart,
        end: this.#altEnd
      }
    }

    const scale = this.#altSequenceScale as ScaleLinear<number, number>;
    const genomicStart = this.#altStart as number;
    const genomicEnd = this.#altEnd as number;
    const regionLength = this.#regionLength as number;

    let genomicDistance = Math.round(scale.invert(Math.abs(deltaX))) - genomicStart;

    genomicDistance = genomicDistance * directionCoefficient;
    
    const newGenomicStart = Math.max(genomicStart - genomicDistance, 1);
    const newGenomicEnd = Math.min(genomicEnd - genomicDistance, regionLength);

    return {
      start: newGenomicStart,
      end: newGenomicEnd
    }
  }

  #onMouseUp = () => {
    this.isDragging = false;
    this.isMouseDown = false;
    this.mouseDownX = null;
    this.mouseDownY = null;
    this.#draggingMode = null;

    document.removeEventListener('mousemove', this.#onMouseMove);
  }

  #setDraggingMode = (event: MouseEvent) => {
    const eventTarget = event.target as HTMLElement;
    const eventY = event.offsetY;
    const { height: elementHeight } = eventTarget.getBoundingClientRect();

    let draggingMode: DraggingMode;

    if (eventY <= RULER_HEIGHT) {
      draggingMode = 'reference';
    } else if (elementHeight - eventY <= RULER_HEIGHT) {
      draggingMode = 'alt';
    } else {
      draggingMode = 'both';
    }

    this.#draggingMode = draggingMode;
  }

  #syncDataFromHost = () => {
    this.#alignmentReferenceStart = this.host.start;
    this.#alignmentReferenceEnd = this.host.end;
    this.#altStart = this.host.altStart;
    this.#altEnd = this.host.altEnd;
    this.#referenceSequenceScale = this.host.scale;
    this.#altSequenceScale = this.host.altSequenceScale;
    this.#regionLength = this.host.regionLength;
  }


}

export default DragController;
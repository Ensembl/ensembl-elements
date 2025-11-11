import { RULER_HEIGHT } from '../constants/constants';

import type { ReactiveController } from 'lit';
import type { ScaleLinear } from 'd3';

import type { VariantAlignmentsImage } from '../variant-alignments-image';

type DraggingMode = 'reference' | 'target' | 'both';

class DragController implements ReactiveController {
  private host: VariantAlignmentsImage;

  isMouseDown = false;
  isDragging = false;

  mouseDownX: number | null = null;
  mouseDownY: number | null = null;

  #alignmentReferenceStart: number | null = null;
  #alignmentReferenceEnd: number | null = null;
  #alignmentTargetStart: number | null = null;
  #alignmentTargetEnd: number | null = null;
  #referenceSequenceScale: ScaleLinear<number, number> | null = null;
  #targetSequenceScale: ScaleLinear<number, number> | null = null;

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
      target: this.#calculateCoordsForTarget({ deltaX, directionCoefficient })
    }

    const positionUpdatedEvent = new CustomEvent('location-updated', {
      bubbles: true,
      composed: true,
      detail: eventData
    });
    this.host.dispatchEvent(positionUpdatedEvent);
  }

  #calculateCoordsForReference = ({
    deltaX,
    directionCoefficient
  }: {
    deltaX: number;
    directionCoefficient: number;
  }) => {
    if (this.#draggingMode === 'target') {
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

  #calculateCoordsForTarget = ({
    deltaX,
    directionCoefficient
  }: {
    deltaX: number;
    directionCoefficient: number;
  }) => {
    if (this.#draggingMode === 'reference') {
      // report unchanged coordinates for target
      return {
        start: this.#alignmentTargetStart,
        end: this.#alignmentTargetEnd
      }
    }

    const scale = this.#targetSequenceScale as ScaleLinear<number, number>;
    const genomicStart = this.#alignmentTargetStart as number;
    const genomicEnd = this.#alignmentTargetEnd as number;
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
      draggingMode = 'target';
    } else {
      draggingMode = 'both';
    }

    this.#draggingMode = draggingMode;
  }

  #syncDataFromHost = () => {
    this.#alignmentReferenceStart = this.host.start;
    this.#alignmentReferenceEnd = this.host.end;
    this.#alignmentTargetStart = this.host.alignmentTargetStart;
    this.#alignmentTargetEnd = this.host.alignmentTargetEnd;
    this.#referenceSequenceScale = this.host.scale;
    this.#targetSequenceScale = this.host.targetSequenceScale;
    this.#regionLength = this.host.regionLength;
  }


}

export default DragController;
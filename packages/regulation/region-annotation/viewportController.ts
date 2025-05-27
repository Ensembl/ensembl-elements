import { ReactiveController, ReactiveControllerHost } from 'lit';
import type { ScaleLinear } from 'd3';

import type { RegionOverview } from './index';

class ViewportController implements ReactiveController {

  host: ReactiveControllerHost;

  isMouseDown = false;
  isDragging = false;

  mouseDownX: number | null = null;
  mouseDownY: number | null = null;

  constructor(host: ReactiveControllerHost) {
    this.host = host;
    host.addController(this);
  }

  hostConnected() {
    this.#addListeners();
  }

  hostDisconnected() {
    this.#removeListeners();
  }

  #addListeners = () => {
    (this.host as unknown as HTMLElement).addEventListener('mousedown', this.onMouseDown);
  }

  #removeListeners = () => {
    (this.host as unknown as HTMLElement).removeEventListener('mousedown', this.onMouseDown);
  }

  #start: number | null = null;
  #end: number | null = null;
  #regionLength: number| null = null;
  #scale: ScaleLinear<number, number> | null = null;

  syncFromHost = () => {
    const host = this.host as RegionOverview;
    this.#scale = host.scale;
    this.#start = host.start;
    this.#end = host.end;
    this.#regionLength = host.regionLength;
  }

  onMouseDown = (event: MouseEvent) => {
    this.isMouseDown = true;
    const { clientX: x, clientY: y } = event;
    this.mouseDownX = x;
    this.mouseDownY = y;

    this.syncFromHost();

    document.addEventListener('mousemove', this.onMouseMove);
    // document.addEventListener('mousemove', this.debouncedOnMouseMove);
    document.addEventListener('mouseup', this.onMouseUp);
  }

  onMouseMove = (event: MouseEvent) => {
    this.isDragging = true;

    const { clientX: x } = event;

    const deltaX = (x - this.mouseDownX);

    const directionCoefficient = deltaX >= 0 ? 1 : -1;

    const scale = this.#scale;
    const genomicStart = this.#start;
    const genomicEnd = this.#end;
    const regionLength = this.#regionLength;

    let genomicDistance = Math.round(scale.invert(Math.abs(deltaX))) - genomicStart;

    genomicDistance = genomicDistance * directionCoefficient;
    
    const newGenomicStart = Math.max(genomicStart - genomicDistance, 1);
    const newGenomicEnd = Math.min(genomicEnd - genomicDistance, regionLength);

    if (newGenomicStart === genomicStart || newGenomicEnd === genomicEnd) {
      return;      
    }

    const viewportChangeEvent = new CustomEvent('viewport-change', {
      detail: {
        start: newGenomicStart,
        end: newGenomicEnd
      }
    });

    debouncedDispatchEvent({
      element: this.host,
      event: viewportChangeEvent
    });

    // host.dispatchEvent(viewportChangeEvent);
  }

  debouncedOnMouseMove = debounce(this.onMouseMove)

  onMouseUp = () => {
    this.isDragging = false;
    this.isMouseDown = false;
    this.mouseDownX = null;
    this.mouseDownY = null;

    document.removeEventListener('mousemove', this.onMouseMove);
    // document.removeEventListener('mousemove', this.debouncedOnMouseMove);

    // FIXME: fire a confirmation event
  }


}


const debounce = (fn) => {
  let raf: ReturnType<typeof requestAnimationFrame>;

  return (...args) => {
    if (raf) {
      return;
    }

    raf = window.requestAnimationFrame(() => {
      fn(...args);
      raf = undefined;
    });
  };
}

const dispatchEvent = ({
  event,
  element
}: {
  event: CustomEvent;
  element: HTMLElement;
}) => {
  element.dispatchEvent(event);
};

const debouncedDispatchEvent = debounce(dispatchEvent);

export default ViewportController;

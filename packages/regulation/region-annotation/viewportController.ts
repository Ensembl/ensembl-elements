import { ReactiveController, ReactiveControllerHost } from 'lit';
import type { ScaleLinear } from 'd3';

import type { RegionOverview } from './index';

class ViewportController implements ReactiveController {

  host: ReactiveControllerHost;

  isPointerDown = false;
  isDragging = false;

  pointerDownX: number | null = null;

  #start: number | null = null;
  #end: number | null = null;
  #regionLength: number| null = null;
  #scale: ScaleLinear<number, number> | null = null;

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
    (this.host as unknown as HTMLElement).addEventListener('pointerdown', this.#onPointerDown);
  }

  #removeListeners = () => {
    (this.host as unknown as HTMLElement).removeEventListener('pointerdown', this.#onPointerDown);
  }

  #syncFromHost = () => {
    const host = this.host as RegionOverview;
    this.#scale = host.ensemblScale;
    this.#start = host.start;
    this.#end = host.end;
    this.#regionLength = host.regionLength;
  }

  #isSelectionTrigger = (event: MouseEvent) => {
    const clickedElement = event.composedPath()[0] as HTMLElement;
    return Boolean(clickedElement.dataset.selectorTrigger);
  }

  #isClickOnTooltip = (event: PointerEvent) => {
    const tooltipSlot = (this.host as RegionOverview).shadowRoot!.querySelector('slot[name="tooltip"]');
    const isTooltipSlotInComposedPath = Boolean(event.composedPath().find(node => node === tooltipSlot));
    return isTooltipSlotInComposedPath;
  }

  #onPointerDown = (event: PointerEvent) => {
    if (this.#isClickOnTooltip(event) || this.#isSelectionTrigger(event)) {
      // ignore
      return;
    }

    this.isPointerDown = true;
    const { clientX: x } = event;
    this.pointerDownX = x;

    this.#syncFromHost();

    const eventTarget = event.target as HTMLElement;
    eventTarget.addEventListener('pointermove', this.#onPointerMove);
    eventTarget.addEventListener('pointerup', this.#onPointerUp);
  }

  #onPointerMove = (event: PointerEvent) => {
    if (!this.isDragging) {
      // This code path would be executed during the first pointermove event.
      // The reason this method (rather than onPointerDown) is used
      // to make the event target capture all pointer events,
      // is because running this logic on pointer down would prevent
      // the click event on genes or regulatory features from registering.
      const eventTarget = event.target as HTMLElement;
      eventTarget.setPointerCapture(event.pointerId);
    }

    this.isDragging = true;
    const pointerDownX = this.pointerDownX as number;

    const { clientX: x } = event;

    const deltaX = x - pointerDownX;

    const directionCoefficient = deltaX >= 0 ? 1 : -1;

    const scale = this.#scale;
    const genomicStart = this.#start as number;
    const genomicEnd = this.#end as number;
    const regionLength = this.#regionLength as number;

    let genomicDistance = Math.round(scale!.invert(Math.abs(deltaX))) - genomicStart;

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

    // NOTE: there doesn't seem to be any evidence that this improves performance in any way
    debouncedDispatchEvent({
      element: this.host,
      event: viewportChangeEvent
    });

    // this.host.dispatchEvent(viewportChangeEvent);
  }

  #onPointerUp = (event: PointerEvent) => {
    this.isDragging = false;
    this.isPointerDown = false;
    this.pointerDownX = null;

    const element = event.target as HTMLElement;

    element.releasePointerCapture(event.pointerId); // technically, this shouldn't be necessary
    element.removeEventListener('pointermove', this.#onPointerMove);
    element.removeEventListener('pointerup', this.#onPointerUp);

    // TODO: fire a confirmation event
  }


}


const debounce = (fn: Function) => {
  let raf: ReturnType<typeof requestAnimationFrame> | undefined;

  return (...args: Array<unknown>) => {
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

import { ReactiveController, ReactiveControllerHost } from 'lit';
import type { ScaleLinear } from 'd3';

type Host = ReactiveControllerHost & HTMLElement & {
  scale: ScaleLinear<number, number> | null;
  start: number;
  end: number;  
};

export type SubscriptionPayload = {
  xLeft: number;
  xRight: number;
  height: number;
  imageWidth: number;
};

type Subscriber = (params: SubscriptionPayload | null) => void;


class AreaSelectionController implements ReactiveController {

  host: Host;

  isMouseDown = false;
  isDragging = false;

  mouseDownX: number | null = null;

  #subscriptions: Set<Subscriber> = new Set()

  #scale: ScaleLinear<number, number> | null = null;
  #hostBoundingRect: DOMRect | null = null;

  constructor(host: Host) {
    this.host = host;
    host.addController(this);
  }

  hostConnected() {
    this.#addListeners();
  }

  hostDisconnected() {
    this.#removeListeners();
    this.#subscriptions = new Set();
  }

  subscribe(subscriber: Subscriber) {
    this.#subscriptions.add(subscriber);
    // return a cleanup function
    return () => this.#subscriptions.delete(subscriber);
  }

  #addListeners = () => {
    this.host.addEventListener('mousedown', this.#onMouseDown);
  }

  #removeListeners = () => {
    this.host.removeEventListener('mousedown', this.#onMouseDown);
  }

  #syncFromHost = () => {
    const host = this.host;
    this.#hostBoundingRect =  host.getBoundingClientRect();
    this.#scale = host.scale;
  }

  #onMouseDown = (event: MouseEvent) => {
    // 1. Make sure that the click occurred on the area that should trigger the selector
    // Expect the area that triggers the selector to have a data attribute "data-selector-trigger"
    // const target = event.target as SVGSVGElement;
    const clickedElement = event.composedPath()[0] as HTMLElement;
    const isSelectorTrigger = Boolean(clickedElement.dataset.selectorTrigger);
    if (!isSelectorTrigger) {
      return;
    }

    this.#syncFromHost();

    this.isMouseDown = true;
    const { clientX: x } = event;
    this.mouseDownX = x - this.#hostBoundingRect!.x;

    document.addEventListener('mousemove', this.#onMouseMove);
    document.addEventListener('mouseup', this.#onMouseUp);
    document.addEventListener('keyup', this.#onKeyUp);
  }

  #onMouseMove = (event: MouseEvent) => {
    this.isDragging = true;
    const mouseDownX = this.mouseDownX as number;

    const x = event.clientX - this.#hostBoundingRect!.x;
    
    const deltaX = Math.abs(x - mouseDownX);

    if (deltaX < 2) {
      return;
    }

    const payload: SubscriptionPayload = {
      xLeft: Math.min(x, mouseDownX),
      xRight: Math.max(x, mouseDownX),
      height: this.#hostBoundingRect!.height,
      imageWidth: this.#hostBoundingRect!.width
    };

    this.#notifySubscriptions(payload);
  }

  #notifySubscriptions = (payload: SubscriptionPayload | null) => {
    this.#subscriptions.forEach(subscription => subscription(payload));
  }

  #onMouseUp = (event: MouseEvent) => {
    const x = event.clientX - this.#hostBoundingRect!.x;
    const scale = this.#scale;
    const mouseDownX = this.mouseDownX as number;

    const deltaX = Math.abs(x - mouseDownX);
    const hasMoved = deltaX >= 2;

    const xLeft = Math.min(x, mouseDownX);
    const xRight = Math.max(x, mouseDownX);

    if (hasMoved) {
      const newGenomicStart = Math.round(scale!.invert(xLeft));
      const newGenomicEnd = Math.round(scale!.invert(xRight));

      const viewportChangeEvent = new CustomEvent('viewport-change', {
        detail: {
          start: newGenomicStart,
          end: newGenomicEnd
        }
      });

      this.host.dispatchEvent(viewportChangeEvent);
    }

    this.#cleanupAfterSelection();
  }

  #onKeyUp = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      this.#cleanupAfterSelection();
    }
  }

  #cleanupAfterSelection = () => {
    this.#notifySubscriptions(null); // signal to subscribers that the selection has finished

    this.isDragging = false;
    this.isMouseDown = false;
    this.mouseDownX = null;

    document.removeEventListener('mousemove', this.#onMouseMove);
    document.removeEventListener('mouseup', this.#onMouseUp);
    document.removeEventListener('keyup', this.#onKeyUp);
  }


}

export default AreaSelectionController;

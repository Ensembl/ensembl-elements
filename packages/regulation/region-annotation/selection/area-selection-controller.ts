import { ReactiveController, ReactiveControllerHost } from 'lit';
import type { ScaleLinear } from 'd3';

type Host = ReactiveControllerHost & HTMLElement & {
  ensemblScale: ScaleLinear<number, number> | null;
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

  isPointerDown = false;
  isDragging = false;

  #pointerDownX: number | null = null;

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
    this.host.addEventListener('pointerdown', this.#onPointerDown);
  }

  #removeListeners = () => {
    this.host.removeEventListener('pointerdown', this.#onPointerDown);
  }

  #syncFromHost = () => {
    const host = this.host;
    this.#hostBoundingRect =  host.getBoundingClientRect();
    this.#scale = host.ensemblScale;
  }

  #onPointerDown = (event: PointerEvent) => {
    // 1. Make sure that the click occurred on the area that should trigger the selector
    // Expect the area that triggers the selector to have a data attribute "data-selector-trigger"
    // const target = event.target as SVGSVGElement;
    const clickedElement = event.composedPath()[0] as HTMLElement;
    const isSelectorTrigger = Boolean(clickedElement.dataset.selectorTrigger);
    if (!isSelectorTrigger) {
      return;
    }

    const eventTarget = event.target as HTMLElement;
    eventTarget.setPointerCapture(event.pointerId);

    this.#syncFromHost();

    this.isPointerDown = true;
    const { clientX: x } = event;
    this.#pointerDownX = x - this.#hostBoundingRect!.x;

    document.addEventListener('pointermove', this.#onPointerMove);
    document.addEventListener('pointerup', this.#onPointerUp);
    document.addEventListener('keyup', this.#onKeyUp);
  }

  #onPointerMove = (event: PointerEvent) => {
    this.isDragging = true;
    const pointerDownX = this.#pointerDownX as number;

    const x = event.clientX - this.#hostBoundingRect!.x;
    
    const deltaX = Math.abs(x - pointerDownX);

    if (deltaX < 2) {
      return;
    }

    const payload: SubscriptionPayload = {
      xLeft: Math.min(x, pointerDownX),
      xRight: Math.max(x, pointerDownX),
      height: this.#hostBoundingRect!.height,
      imageWidth: this.#hostBoundingRect!.width
    };

    this.#notifySubscriptions(payload);
  }

  #notifySubscriptions = (payload: SubscriptionPayload | null) => {
    this.#subscriptions.forEach(subscription => subscription(payload));
  }

  #onPointerUp = (event: PointerEvent) => {
    const x = event.clientX - this.#hostBoundingRect!.x;
    const scale = this.#scale;
    const pointerDownX = this.#pointerDownX as number;

    const deltaX = Math.abs(x - pointerDownX);
    const hasMoved = deltaX >= 2;

    const xLeft = Math.min(x, pointerDownX);
    const xRight = Math.max(x, pointerDownX);

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
    this.isPointerDown = false;
    this.#pointerDownX = null;

    document.removeEventListener('pointermove', this.#onPointerMove);
    document.removeEventListener('pointerup', this.#onPointerUp);
    document.removeEventListener('keyup', this.#onKeyUp);
  }


}

export default AreaSelectionController;

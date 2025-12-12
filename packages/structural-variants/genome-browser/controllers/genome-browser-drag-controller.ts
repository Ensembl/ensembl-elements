import type { ReactiveController } from 'lit';
import type { GenomeBrowser } from '../genome-browser';
import type { LocationChangePayload } from '../types/genome-browser';

class GenomeBrowserDragController implements ReactiveController {
  private host: GenomeBrowser;

  isMouseDown = false;
  isDragging = false;
  mouseDownX: number | null = null;
  #initialStart: number | null = null;
  #initialEnd: number | null = null;
  #activePointerId: number | null = null;

  constructor(host: GenomeBrowser) {
    this.host = host;
    host.addController(this);
  }

  addCanvasListener() {
    this.host.canvas.addEventListener('pointerdown', this.#onMouseDown);
    this.host.canvas.addEventListener('pointermove', this.#onMouseMove);
    this.host.canvas.addEventListener('pointerup', this.#onMouseUp);
    this.host.canvas.addEventListener('pointercancel', this.#onPointerCancel);
    this.host.canvas.style.touchAction = 'none';
  }

  hostDisconnected() {
    this.host.canvas?.removeEventListener('pointerdown', this.#onMouseDown);
    this.host.canvas?.removeEventListener('pointermove', this.#onMouseMove);
    this.host.canvas?.removeEventListener('pointerup', this.#onMouseUp);
    this.host.canvas?.removeEventListener('pointercancel', this.#onPointerCancel);
    this.#releasePointerCapture();
    this.#cleanupPointerState();
  }

  #onMouseDown = (event: PointerEvent) => {
    this.isMouseDown = true;
    this.mouseDownX = event.clientX;
    this.#initialStart = this.host.start;
    this.#initialEnd = this.host.end;
    this.#activePointerId = event.pointerId;
    this.host.canvas.setPointerCapture?.(event.pointerId);
  };

  #onMouseMove = (event: PointerEvent) => {
    if (!this.isMouseDown || this.mouseDownX === null) {
      return;
    }

    this.isDragging = true;
    const deltaX = event.clientX - this.mouseDownX;
    const newLocation = this.#calculateNewLocation(deltaX);

    this.host.dispatchEvent(new CustomEvent<LocationChangePayload>('location-change', {
      detail: newLocation,
      bubbles: true,
      composed: true
    }));
  };

  #onMouseUp = () => {
    const event = new CustomEvent<LocationChangePayload>('location-change-end', {
      bubbles: true,
      composed: true,
      detail: {
        start: this.host.start,
        end: this.host.end
      }
    });
    this.host.dispatchEvent(event);

    this.#releasePointerCapture();
    this.#cleanupPointerState();
  };

  #onPointerCancel = () => {
    this.#releasePointerCapture();
    this.#cleanupPointerState();
  };

  #cleanupPointerState() {
    this.isDragging = false;
    this.isMouseDown = false;
    this.mouseDownX = null;
    this.#initialStart = null;
    this.#initialEnd = null;
    this.#activePointerId = null;
  }

  #calculateNewLocation(deltaX: number): LocationChangePayload {
    if (this.#initialStart === null || this.#initialEnd === null) {
      return { start: this.host.start, end: this.host.end };
    }

    const genomicRange = this.#initialEnd - this.#initialStart + 1;

    if (genomicRange <= 0) {
      return { start: this.host.start, end: this.host.end };
    }

    const pixelsPerBase = this.host.viewport.clientWidth / genomicRange;
    const genomicDelta = Math.round(deltaX / pixelsPerBase);
    const newStart = Math.max(1, this.#initialStart - genomicDelta);
    const newEnd = Math.min(this.host.regionLength, this.#initialEnd - genomicDelta);

    return { start: newStart, end: newEnd };
  }

  #releasePointerCapture() {
    if (this.#activePointerId !== null) {
      const pointerId = this.#activePointerId;
      if (this.host.canvas.hasPointerCapture?.(pointerId)) {
        this.host.canvas.releasePointerCapture?.(pointerId);
      }
    }
  }
}

export default GenomeBrowserDragController;

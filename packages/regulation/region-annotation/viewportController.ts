import { ReactiveController, ReactiveControllerHost } from 'lit';

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

  onMouseDown = (event: MouseEvent) => {
    this.isMouseDown = true;
    const { clientX: x, clientY: y } = event;
    this.mouseDownX = x;
    this.mouseDownY = y;

    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('mouseup', this.onMouseUp);
  }

  onMouseMove = (event: MouseEvent) => {
    this.isDragging = true;

    const { clientX: x } = event;

    const deltaX = (x - this.mouseDownX) * devicePixelRatio;
    const directionCoefficient = deltaX >= 0 ? 1 : -1;
    this.mouseDownX = x;

    const regionOverviewCanvas = this.host as RegionOverview;
    const scale = regionOverviewCanvas.scale;
    const [ genomicStart, genomicEnd ] = scale.domain();

    let genomicDistance = Math.round(scale.invert(Math.abs(deltaX))) - genomicStart;

    genomicDistance = genomicDistance * directionCoefficient;
    
    // FIXME: end should not exceed region end
    const newGenomicStart = Math.max(genomicStart - genomicDistance, 1);
    const newGenomicEnd = genomicEnd - genomicDistance;

    if (deltaX === 0) {
      return;      
    }

    const viewportChangeEvent = new CustomEvent('viewport-change', {
      detail: {
        start: newGenomicStart,
        end: newGenomicEnd
      }
    });

    regionOverviewCanvas.dispatchEvent(viewportChangeEvent);
  }

  onMouseUp = () => {
    this.isDragging = false;
    this.isMouseDown = false;
    this.mouseDownX = null;
    this.mouseDownY = null;

    document.removeEventListener('mousemove', this.onMouseMove);

    // FIXME: fire a confirmation event
  }


}

export default ViewportController;

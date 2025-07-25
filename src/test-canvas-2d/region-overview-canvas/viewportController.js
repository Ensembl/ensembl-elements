class ViewportController {
    constructor(host) {
        this.isMouseDown = false;
        this.isDragging = false;
        this.mouseDownX = null;
        this.mouseDownY = null;
        this.registerCanvas = (canvas) => {
            this.canvas = canvas;
            this.#addListeners();
        };
        this.#addListeners = () => {
            this.canvas.addEventListener('mousedown', this.onMouseDown);
        };
        this.#removeListeners = () => {
            this.canvas.removeEventListener('mousedown', this.onMouseDown);
        };
        this.onMouseDown = (event) => {
            this.isMouseDown = true;
            const { clientX: x, clientY: y } = event;
            this.mouseDownX = x;
            this.mouseDownY = y;
            document.addEventListener('mousemove', this.onMouseMove);
            document.addEventListener('mouseup', this.onMouseUp);
        };
        this.onMouseMove = (event) => {
            this.isDragging = true;
            const { clientX: x } = event;
            const deltaX = (x - this.mouseDownX) * devicePixelRatio;
            const directionCoefficient = deltaX >= 0 ? 1 : -1;
            this.mouseDownX = x;
            const regionOverviewCanvas = this.host;
            const scale = regionOverviewCanvas.scale;
            const [genomicStart, genomicEnd] = scale.domain();
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
        };
        this.onMouseUp = () => {
            this.isDragging = false;
            this.isMouseDown = false;
            this.mouseDownX = null;
            this.mouseDownY = null;
            document.removeEventListener('mousemove', this.onMouseMove);
            // FIXME: fire a confirmation event
        };
        this.host = host;
        host.addController(this);
    }
    hostConnected() {
        this.canvas = this.host.canvas;
        this.#addListeners();
    }
    hostDisconnected() {
        this.#removeListeners();
        this.canvas = null;
    }
    #addListeners;
    #removeListeners;
}
export default ViewportController;

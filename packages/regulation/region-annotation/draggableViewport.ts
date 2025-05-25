import { noChange } from 'lit';
import {Directive, directive, type ChildPart } from 'lit/directive.js';

class DraggableViewport extends Directive {
  attributeNames = '';
  update(part: ChildPart) {
    return this.render();
  }
  render() {
    return noChange;
  }
}

const draggableViewport = directive(DraggableViewport);

export default draggableViewport;
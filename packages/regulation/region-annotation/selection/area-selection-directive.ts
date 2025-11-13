import { svg, noChange, nothing } from 'lit';
import { AsyncDirective, directive, type ChildPart } from 'lit/async-directive.js';

import type AreaSelectionController from './area-selection-controller';
import { type SubscriptionPayload } from './area-selection-controller';

type Host = {
  areaSelection: AreaSelectionController
};

class AreaSelectionDirective extends AsyncDirective {
  #unsubscribe: (() => void) | undefined;

  render() {
    return noChange;
  }

  update(part: ChildPart) {
    if (!this.#unsubscribe) {
      this.#unsubscribe = (part.options!.host as Host).areaSelection
        .subscribe(this.#onAreaSelectionChange);
    }
    return this.render();
  }

  // When the directive is disconnected from the DOM, unsubscribe to ensure
  // the directive instance can be garbage collected
  disconnected() {
    this.#unsubscribe!();
  }
  // If the subtree the directive is in was disconnected and subsequently
  // re-connected, re-subscribe to make the directive operable again
  reconnected() {
    // this.subscribe(this.observable!);
  }

  // Subscribes to the observable, calling the directive's asynchronous
  // setValue API each time the value changes
  #onAreaSelectionChange = (payload: SubscriptionPayload | null) => {
    if (payload === null) {
      this.setValue(nothing);
      return;
    }

    const { xLeft, xRight, height } = payload;
    const x = xLeft;
    const width = xRight - xLeft;

    const selection = svg`
      <rect
        x=${x}
        width=${width}
        height=${height}
        stroke="red"
        stroke-dasharray="2"
        fill="none"
      />
    `;

    this.setValue(selection);
  }
}
export const areaSelection = directive(AreaSelectionDirective);
import { svg, noChange, nothing } from 'lit';
import { AsyncDirective, directive, type ChildPart } from 'lit/async-directive.js';

import type AreaSelectionController from './area-selection-controller';
import { type SubscriptionPayload } from './area-selection-controller';

type Host = {
  areaSelection: AreaSelectionController
};

class UnselectedBackgroundDirective extends AsyncDirective {
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

    const { xLeft, xRight, height, imageWidth } = payload;
    const selectionRectangleBorderWidth = 1; // FIXME: this should probably be imported?
    const leftFilterWidth = Math.max(xLeft - selectionRectangleBorderWidth, 0);
    const rightFilterStart = Math.min(xRight + selectionRectangleBorderWidth, imageWidth);
    const rightFilterWidth = Math.max(imageWidth - xRight, 0);

    const id = "unselected-background";

    const filterElement = svg`
      <filter id=${id}>
        <feFlood
          flood-color="#e5eaf0"
          flood-opacity="1"
          x="0"
          y="0"
          height=${height}
          width=${leftFilterWidth}
          result="A"
        />
        <feFlood
          flood-color="#e5eaf0"
          flood-opacity="1"
          x=${rightFilterStart}
          y="0"
          height=${height}
          width=${rightFilterWidth}
          result="D"
        />
        <feComposite operator="in" in2="SourceGraphic" in="D" result="C" />
        <feComposite operator="in" in2="SourceGraphic" in="A" result="B" />
        <feMerge>
          <feMergeNode in="B" />
          <feMergeNode in="C" />
        </feMerge>
        <feComposite operator="over" in2="SourceGraphic" />
      </filter>
    `;

    this.setValue(filterElement);
  }
}
export const unselectedBackgroundFilter = directive(UnselectedBackgroundDirective);
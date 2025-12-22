import { html, css, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import './button-left';
import './button-right';
import './button-zoom-in';
import './button-zoom-out';

/**
 * CSS API:
 * - to select the 'move left' button, use ens-nav-buttons::part(button-left)
 * - to select the 'move right' button, use ens-nav-buttons::part(button-right)
 * - to select the 'zoom in' button, use ens-nav-buttons::part(button-zoom-in)
 * - to select the 'zoom out' button, use ens-nav-buttons::part(button-zoom-out)
 * 
 * CUSTOM EVENTS:
 * - 'move-left', emitted upon a press on the 'move left' button
 * - 'move-right', emitted upon a press on the 'move right' button
 * - 'zoom-in', emitted upon a press on the 'zoom in' button
 * - 'zoom-out', emitted upon a press on the 'zoom out' button
 */

@customElement('ens-nav-buttons')
export class NavButtons extends LitElement {
  static styles = [
    css`
      :host {
        display: inline-flex;
        column-gap: var(--ens-nav-buttons-gap, 22px);
      }
    `
  ];

  @property({ type: Boolean, attribute: 'disabled-move-left' })
  isMoveLeftDisabled = false;

  @property({ type: Boolean, attribute: 'disabled-move-right' })
  isMoveRightDisabled = false;

  @property({ type: Boolean, attribute: 'disabled-zoom-in' })
  isZoomInDisabled = false;

  @property({ type: Boolean, attribute: 'disabled-zoom-out' })
  isZoomOutDisabled = false;

  onButtonLeftPress = () => {
    this.dispatchEvent(new Event('move-left'));
  }

  onButtonRightPress = () => {
    this.dispatchEvent(new Event('move-right'));
  }

  onButtonZoomInPress = () => {
    this.dispatchEvent(new Event('zoom-in'));
  }

  onButtonZoomOutPress = () => {
    this.dispatchEvent(new Event('zoom-out'));
  }

  render() {
    return html`
      <ens-nav-button-left
        exportparts="nav-button:button-left"
        ?disabled=${this.isMoveLeftDisabled}
        @click=${this.onButtonLeftPress}
      ></ens-nav-button-left>
      <ens-nav-button-right
        exportparts="nav-button:button-right"
        ?disabled=${this.isMoveRightDisabled}
        @click=${this.onButtonRightPress}
      ></ens-nav-button-right>
      <ens-nav-button-zoom-out
        exportparts="nav-button:button-zoom-out"
        ?disabled=${this.isZoomOutDisabled}
        @click=${this.onButtonZoomOutPress}
      ></ens-nav-button-zoom-out>
      <ens-nav-button-zoom-in
        exportparts="nav-button:button-zoom-in"
        ?disabled=${this.isZoomInDisabled}
        @click=${this.onButtonZoomInPress}
      ></ens-nav-button-zoom-in>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ens-nav-buttons': NavButtons;
  }
}
import {html, css, LitElement} from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('svg-test-page')
export class SVGTestPage extends LitElement {
  static styles = css`
    
  `;

  render() {
    return html`
      <h1>This should test the painting of region overview using SVG</h1>
    `;
  }
}

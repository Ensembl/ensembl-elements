import {html, css, LitElement} from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('home-page')
export class HomePage extends LitElement {
  static styles = css`
    
  `;

  render() {
    return html`
      <h1>Choose the test</h1>
      <ul>
        <li>
          <a href="/test-svg">SVG</a>
        </li>
        <li>
          <a href="/test-canvas">Canvas 2d</a>
        </li>
      </ul>
    `;
  }
}

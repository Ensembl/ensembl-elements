var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html, css, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';
let HomePage = class HomePage extends LitElement {
    static { this.styles = css `
    
  `; }
    render() {
        return html `
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
};
HomePage = __decorate([
    customElement('home-page')
], HomePage);
export { HomePage };

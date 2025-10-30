import { html, css, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';

import resetStyles from '../../styles/constructable-stylesheets/resets';

import customPropertiesStylesString from '../custom-properties.css?raw';

const customPropertiesStyles = new CSSStyleSheet();
customPropertiesStyles.replaceSync(customPropertiesStylesString);

import homeIcon from '../icons/home.svg?raw';
import servicesIcon from '../icons/services.svg?raw';
import researchIcon from '../icons/research.svg?raw';
import trainingIcon from '../icons/tutorial.svg?raw';
import infoIcon from '../icons/info.svg?raw';

/**
 * Source: https://github.com/ebiwd/EBI-Framework/blob/acac6ba557df706ebd5a7d02d223d4f977d3309e/js/script.js#L258
 */

@customElement('embl-ebi-page-header')
export class PageHeader extends LitElement {
  static styles = [
    resetStyles,
    customPropertiesStyles,
    css`
      :host {
        display: flex;
        justify-content: center;
        background-color: var(--vf-color--grey--darkest);
        font-size: 14.4px;
        white-space: nowrap;
      }

      nav {
        display: flex;
        align-items: center;
        justify-content: end;
        padding: 2px 0;
        height: 35px;
        width: 100%;
        max-width: 1280px;
      }

      ul {
        display: flex;
        height: 100%;
        align-items: center;
        margin: 0;
        padding: 0;
        list-style-type: none;
      }

      li {
        display: inline-flex;
        height: 100%;
      }

      a {
        display: inline-flex;
        align-items: center;
        line-height: 1;
        height: 100%;
        padding: 0 1rem;
        color: var(--vf-ui-color--white);
      }

      a:hover, a:focus-visible {
        color: var(--vf-color--grey--darkest);
        background-color: var(--vf-color--grey--lightest);
      }

      svg {
        height: 15px;
        width: 15px;
        margin-right: 1ch;
        fill: var(--vf-ui-color--white);
      }

      a:hover svg, a:focus-visible svg {
        fill: var(--vf-color--grey--darkest);
      }

      .embl-ebi-logo {
        display: inline-flex;
        height: 100%;
        align-items: center;
        padding-left: 1rem;
        margin-right: 120px;
      }

      .embl-ebi-logo img {
        height: 90%;
      }
    `
  ];


  render() {
    return html`
      <nav>
        <ul>
          <li>
            <a href="https://www.ebi.ac.uk">
              ${unsafeSVG(homeIcon)}
              <span>
                EMBL-EBI home
              </span>
            </a>
          </li>
          <li>
            <a href="https://www.ebi.ac.uk/services">
              ${unsafeSVG(servicesIcon)}
              <span>
                Services
              </span>
            </a>
          </li>
          <li>
            <a href="https://www.ebi.ac.uk/research">
              ${unsafeSVG(researchIcon)}
              <span>
                Research
              </span>
            </a>
          </li>
          <li>
            <a href="https://www.ebi.ac.uk/training">
              ${unsafeSVG(trainingIcon)}
              <span>
                Training
              </span>
            </a>
          </li>
          <li>
            <a href="https://www.ebi.ac.uk/about">
              ${unsafeSVG(infoIcon)}
              <span>
                About us
              </span>
            </a>
          </li>
        </ul>

        <span class="embl-ebi-logo">
          <img src="https://ebi.emblstatic.net/web_guidelines/EBI-Framework/v1.3/images/logos/EMBL-EBI/EMBL_EBI_Logo_white.svg" alt="" />
        </span>
      </nav>
    `;
  }

}

declare global {
  interface HTMLElementTagNameMap {
    'embl-ebi-page-header': PageHeader;
  }
}


/**
          <li class="search">
            <a href="#" class="inline-block collpased float-left search-toggle">
              ${unsafeSVG(servicesIcon)}
              <span class="show-for-small-only">
                Search
              </span>
            </a>
          </li>


 */
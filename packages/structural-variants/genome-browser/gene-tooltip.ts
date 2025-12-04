import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import '@ensembl/ensembl-elements-common/components/external-link/external-link.js';

import type { HotspotContent, GeneMetadata, TranscriptMetadata } from './types/tooltip';

@customElement('ens-sv-gene-tooltip')
export class GeneTooltip extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    .hotspot-tooltip {
      font-family: var(--font-family-body);
      font-size: var(--body-font-size);
      line-height: var(--body-line-height);
      color: var(--color-white);
    }

    .section + .section {
      margin-top: 0.75rem;
      padding-top: 0.75rem;
      border-top: 1px solid rgba(255, 255, 255, 0.2);
    }

    .row {
      display: flex;
      justify-content: space-between;
      gap: 1ch;
    }

    .hotspot-tooltip .row span + span {
      margin-left: 1ch;
      font-weight: 500;
    }

    .hotspot-tooltip .light {
      font-weight: 300;
    }
  `;

  @property({ attribute: false })
  contentItems: HotspotContent[] | null = null;

  @property()
  genomeId: string | null = null;

  protected render() {
    const contentItems = this.contentItems;

    if (!contentItems || contentItems.length === 0) {
      return html``;
    }

    const gene = contentItems.find((item) => item.metadata.type === 'gene')?.metadata as GeneMetadata | undefined;
    const transcript = contentItems.find((item) => item.metadata.type === 'transcript')?.metadata as TranscriptMetadata | undefined;

    return html`
      <div class="hotspot-tooltip">
        ${gene ? this.#renderGeneSection(gene) : null}
      </div>
    `;
  }

  #renderGeneSection(gene: GeneMetadata) {
    return html`
      <div class="section" data-section="gene">
        <div class="row">
          <span class="light">Gene</span>
          <span>${gene.symbol ?? gene.versioned_id ?? '—'}</span>
        </div>
        <div class="row">
          <span class="light">Gene ID</span>
          <span>${this.#renderGeneLink(gene)}</span>
        </div>
        <div class="row">
          <span class="light">Biotype</span>
          <span>${gene.gene_biotype ?? '—'}</span>
        </div>
        <div class="row">
          <span class="light">Strand</span>
          <span>${gene.strand ?? '—'}</span>
        </div>
      </div>
    `;
  }

  #renderGeneLink(gene: GeneMetadata) {
    const stableId = gene.unversioned_id;
    const href = `https://beta.ensembl.org/genome-browser/${this.genomeId}?focus=gene:${stableId}`;
    return stableId ? html`<ens-external-link href=${href}>${stableId}</ens-external-link>` : '—';
  }
}

export default GeneTooltip;

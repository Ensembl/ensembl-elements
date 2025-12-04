# Ensembl Structural Variants package

This package contains reusable components for visualisation of Ensembl structural variants data.

## General installation instructions

Currently, packages within the `@ensembl` organisation are hosted at a dedicated package registry. To enable installation from that registry, add an `.npmrc` file at the same level as your `package.json` file, and add the following into `.npmrc`:

```
; Set a registry for Ensembl
@ensembl:registry=https://gitlab.ebi.ac.uk/api/v4/projects/3500/packages/npm/
```

## Installation
Web components in this package require `lit` and `d3` to function.

`npm install -E @ensembl/ensembl-structural-variants d3 lit`


## Variant alignments

The `ens-sv-alignments` component becomes available as a side effect of the following import statement:

```
import '@ensembl/ensembl-structural-variants/alignments';
```

_(Same import statement should also make available its internal component, `ens-sv-alignments-image`, which is responsible solely for the rendering of the image; though most likely, you will want to use the `ens-sv-alignments` component.)_

The `ens-sv-alignments` component needs to fetch data to render structural variants and alignments; and thus, needs to be handed two api endpoints: one for variant data, and the other for alignments data.

Example usage:

```ts
const alignmentsElement = document.createElement('ens-sv-alignments');
alignmentsElement.referenceGenomeId = '4c07817b-c7c5-463f-8624-982286bc4355';
alignmentsElement.altGenomeId = 'a7335667-93e7-11ec-a39d-005056b38ce3';
alignmentsElement.start = 142_500_000;
alignmentsElement.end = 145_500_000;
alignmentsElement.regionName = '1';
alignmentsElement.regionLength = 248956422;

const endpoints = {
  alignments: 'http://localhost:3000/api/alignments',
  variants: 'http://localhost:3000/api/variants'
};
alignmentsElement.endpoints = endpoints;

alignmentsElement.addEventListener('viewport-change', (event) => console.log("Heard viewport change event", (event as CustomEvent).detail));
alignmentsElement.addEventListener('ens-reg-feature-click', (event) => console.log("Heard feature click event", (event as CustomEvent).detail));
```

## Genome browser

The `ens-sv-genome-browser` element is a version of Ensembl genome browser component (imported from `@ensembl/ensembl-genome-browser`), packaged as a web component for integration with Ensembl structural variants browser. In addition to rendering genomic tracks it exposes events for genome browser messages (tracks and hostpot).

Example setup:
```ts
import '@ensembl/ensembl-structural-variants/genome-browser';
const genomeBrowser = document.createElement('ens-sv-genome-browser');
genomeBrowser.genomeId = '4c07817b-c7c5-463f-8624-982286bc4355';
genomeBrowser.regionName = '1';
genomeBrowser.regionLength = 248_956_422;
genomeBrowser.start = 142_500_000;
genomeBrowser.end = 145_500_000;
genomeBrowser.tracks = ['sv-gene', 'my-track-uuid'];
genomeBrowser.endpoint = 'https://dev-2020.ensembl.org/api/browser/data';

genomeBrowser.addEventListener('track-message', (event) => {
  console.log('Loaded genome browser tracks:', (event as CustomEvent).detail);
});
genomeBrowser.addEventListener('hotspot-message', (event) => {
  console.log('Clicked genome browser hotspot:', (event as CustomEvent).detail);
});
```

## Structural variants browser

`ens-sv-browser` is a wrapper element that stacks two `ens-sv-genome-browser` instances around `ens-sv-alignments` and synchronises viewport location changes between the subcomponents.

```
import '@ensembl/ensembl-structural-variants/sv-browser';
```

The component accepts the same properties as its standalone pieces (genome IDs, tracks list, endpoint URLs).
For local testing and development, run `npm run dev` inside `packages/structural-variants` to launch the structural variants playground.

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

genomeBrowser.addEventListener('track-summary', (event) => {
  console.log('Loaded genome browser tracks:', (event as CustomEvent).detail);
});
genomeBrowser.addEventListener('hotspot', (event) => {
  console.log('Clicked genome browser hotspot:', (event as CustomEvent).detail);
});
```

## Navigation controls

The `ens-sv-nav-buttons` component emits `viewport-change` events so you can wire zoom and pan buttons into either `ens-sv-browser` or `ens-sv-alignments`.

```
import '@ensembl/ensembl-structural-variants/nav-buttons';

const navControls = document.createElement('ens-sv-nav-buttons');
navControls.start = 142_500_000;
navControls.end = 145_500_000;
navControls.regionLength = 248_956_422;
navControls.altStart = 142_500_000;
navControls.altEnd = 145_500_000;

navControls.addEventListener('viewport-change', (event) => {
  const { reference, alt } = (event as CustomEvent).detail;
  console.log('Reference viewport:', reference, 'Alt viewport:', alt);
});
```

## Structural variants browser

`ens-sv-browser` is a component that aligns two genomes, and displays various kinds of genomic information in the context of this alignment. Technically, it is a wrapper element that stacks two `ens-sv-genome-browser` elements around a `ens-sv-alignments` element, and synchronises their viewports.

```
import '@ensembl/ensembl-structural-variants/sv-browser';
```

### Required properties
The component requires the following properties

- `referenceGenomeId`
- `altGenomeId`
- `referenceTracks` – a list of identifiers of genome browser tracks for the reference genome
- `altTracks` - a list of identifiers of genome browser tracks for the alternative (comparison) genome
- `regionName` - the Ensembl name of the top-level genomic region for the reference genome. NOTE: same name will currently be used for the top-level genomic region of the alternative genome
- `regionLength` - the length of the top-level genomic region for the reference genome
- `start` - the start coordinate (1-based) within the genomic region of the reference genome
- `end` - the end coordinate within the genomic region of the reference genome
- `altRegionLength` - the length of the top-level genomic region for the alternative genome
- `altStart` - the start coordinate (1-based) within the genomic region of the alternative genome
- `altEnd`- the end coordinate within the genomic region of the alternative genome
- `endpoints` a list of endpoints which includes a genome browser endpoint, an endpoint for genomic alignments, and an endpoint for variants between the reference and the alternative genome

### Events
The component emits the following events:
- `viewport-change` - a custom event notifying that the component's viewport into the top-level region (i.e. the displayed genomic location) has changed. Contains information about the new displayed location
- `viewport-change-end` - while the `viewport-change` event fires on every change of the displayable genomic location, `viewport-change-end` is dispatched when user has finished an interaction with the component – typically, after the user has finished a drag gesture to move the content of the component left or right. By its nature, this event fires less frequently than `viewport-change`, and is a more appropriate event for the parent to listen to, if UI changes in response to it are going to be expensive.
- `track-positions-change` - a custom event containing positions of different tracks within the component. Useful if a parent needs to align its own elements with the tracks within this component.

## Development
For local testing and development, run `npm run dev` inside `packages/structural-variants` to launch the structural variants playground.
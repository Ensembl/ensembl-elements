# Ensembl Regulation package

This package contains reusable components for visualisation of Ensembl regulation data.

## General installation instructions

Currently, packages within the `@ensembl` organisation are hosted at a dedicated package registry. To enable installation from that registry, add an `.npmrc` file at the same level as your `package.json` file, and add the following into `.npmrc`:

```
; Set a registry for Ensembl
@ensembl:registry=https://gitlab.ebi.ac.uk/api/v4/projects/3500/packages/npm/
```


## Region Overview

The purpose of this component is to show genes, transcription start sites, and regulatory features along a top-level region (typically, a chromosome), as well as to enable navigation along the top-level region, and selection of slices of interest.

_(NOTE: The name 'region overview' is carryover from the main Ensembl site. It may be worth renaming this component to region annotation)_

### Installation

`npm install -E @ensembl/ensembl-regulation d3 lit`

Note that the package depends on `lit` and `d3` to work.

### Using the component
The component is created with the following markup:

`<ens-reg-region-annotation></ens-reg-region-annotation>`

The component expects the following properties in order to work:

- `start` - start of the slice (the part of the region that is visible in the component), in genomic coordinates, 1-based
- `end` - end of the slice, in genomic coordinates, 1-based
- `regionName` - name of the region, string
- `regionLength` - total length of the region, in base pairs
- `data` - an object containing the data for visualisation (see the exported `RegionOverviewData` type for details)

It also accepts the following optional properties:
- `colors` - a configuration object that is a map of configurable colours. To see which colours of the regulatory annotation panel are configurable, inspect the `Colors` type exported from the package.
- `focusGeneId` - id of the gene that is "in focus" (it is coloured differently from the others)
- `focusRegulatoryFeatureId` - id of the regulatory feature that is "in focus" (it is coloured differently from the others)

The component also emits the following events:

- `viewport-change` - a custom event containing the new desired start and end genomic coordinates on the region (emitted when user drags the content of the component, or makes a selection within it)
- `ens-reg-feature-click` - a custom event with information about the feature that the user clicked

### Exported types
The package exports several useful types:

```ts
import type {
  RegionOverview,
  RegionOverviewData,
  OverviewRegion,
  GeneInRegionOverview,
  RegulatoryFeature,
  RegulatoryFeatureMetadata
} from '@ensembl/ensembl-regulation/region-overview';
```

- `RegionOverview` is the type of the component itself
- `OverviewRegion` (confusingly) is the shape of response from the annotation api
- `RegionOverviewData` is the shape of the data that the component expects in its data property
- `GeneInRegionOverview` is the shape of a gene in that data
- `RegulatoryFeature` is the shape of a regulatory feature in that data
- `RegulatoryFeatureMetadata` is the shape of metadata about regulatory features



## Epigenome Activity

This component displays epigenome activity data.

### Component name
`ens-reg-epigenome-activity`

### Input properties
- `start` - start coordinate on a region
- `end` - end coordinate on a region
- `tracks` - an array of `TrackData` objects (see exported types)
- `trackMetadata` a `TrackMetadata` object (see exported types)

### Events
- `track-positions-change` - see exported `TrackPositionsChangeEvent` type
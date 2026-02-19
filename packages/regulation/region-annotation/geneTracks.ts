import { svg } from 'lit';
import type { ScaleLinear } from 'd3';

import {
  GENE_HEIGHT,
  GENE_LABEL_HEIGHT,
  MAX_SLICE_LENGTH_FOR_DETAILED_VIEW
} from './constants';
import { toZeroBased } from '../helpers/toZeroBased';

import { renderTranscriptionStartSites } from './transcriptionStartSites';

import type { FeatureTracks, GeneTrack, GeneInTrack } from './prepareFeatureTracks';
import type { ExonInRegionOverview, OverlappingCDSFragment } from '../types/regionOverview';
import type { GeneClickPayload } from '../types/featureClickEvent';
import type { Colors } from './constants';

type Intron = {
  start: number;
  end: number;
};

export const renderGeneTracks = ({
  tracks,
  scale,
  regionName,
  start,
  end,
  focusGeneId,
  forwardStrandTopOffsets,
  reverseStrandTopOffsets,
  strandDividerTopOffset,
  width,
  colors
}: {
  tracks: FeatureTracks['geneTracks'];
  scale: ScaleLinear<number, number>;
  width: number;
  regionName: string;
  start: number;
  end: number;
  focusGeneId: string | null;
  forwardStrandTopOffsets: number[];
  reverseStrandTopOffsets: number[];
  strandDividerTopOffset: number;
  colors: Colors;
}) => {
  const { forwardStrandTracks, reverseStrandTracks } = tracks;
  const geneLabelsStore = createGeneLabelsStore({ tracks });

  // Designer's instruction: forward strand genes stack upwards
  const forwardStrandTrackYs = forwardStrandTopOffsets.toReversed();
  const reverseStrandTrackYs = reverseStrandTopOffsets;

  const [forwardStrandTrackElements, reverseStrandTrackElements] = [
    forwardStrandTracks,
    reverseStrandTracks
  ].map((tracks, index) => {
    const isForwardStrand = index === 0;
    const yCoordLookup = isForwardStrand
      ? forwardStrandTrackYs
      : reverseStrandTrackYs;

    return tracks.map((_, index) => renderGeneTrack({
      tracks,
      trackIndex: index,
      trackOffsetsTop: yCoordLookup,
      scale,
      regionName,
      start,
      end,
      focusGeneId,
      colors,
      geneLabelsStore
    }))
  });

  return svg`
    <g>
      ${forwardStrandTrackElements}
    </g>
    <line
      x1="0"
      x2=${width}
      y1=${strandDividerTopOffset}
      y2=${strandDividerTopOffset}
      stroke-dasharray="2"
      stroke=${colors.geneStrandDivider}
    />
    <g>
      ${reverseStrandTrackElements}
    </g>
  `;
};


const renderGeneTrack = ({
  tracks,
  trackIndex,
  trackOffsetsTop,
  scale,
  regionName,
  start,
  end,
  focusGeneId,
  colors,
  geneLabelsStore
}: {
  // passing a whole bunch of tracks and their offsets in a single track renderer,
  // because they will be needed to render transcription start sites
  tracks: GeneTrack[];
  trackIndex: number;
  trackOffsetsTop: number[];
  scale: ScaleLinear<number, number>;
  regionName: string;
  start: number;
  end: number;
  focusGeneId: string | null;
  colors: Colors;
  geneLabelsStore: GeneLabelsStore;
}) => {
  const track = tracks[trackIndex];
  const trackOffsetTop = trackOffsetsTop[trackIndex];
  const shouldDisplayLowResGenes =
    end - start > MAX_SLICE_LENGTH_FOR_DETAILED_VIEW;

  const geneElements = track.map((gene) => {
    const isFocusGene = gene.data.stable_id === focusGeneId;
    
    if (shouldDisplayLowResGenes) {
      return renderGeneLowRes({
        gene,
        scale,
        offsetTop: trackOffsetTop,
        color: isFocusGene ? colors.geneFocused : colors.gene
      });
    }

    return svg`
      ${renderGene({
        gene,
        regionName,
        scale,
        offsetTop: trackOffsetTop,
        color: isFocusGene ? colors.geneFocused : colors.gene,
        trackIndex,
        allColors: colors,
        geneLabelsStore
      })}
      ${renderTranscriptionStartSites({
        tss: gene.data.tss,
        strand: gene.data.strand,
        geneTracks: tracks,
        trackIndex,
        scale,
        trackOffsetsTop,
        color: colors.transcriptionStartSite
      })}
    `;
  });

  return svg`
    <g>
      ${geneElements}
    </g>
  `;
};

const renderGeneLowRes = ({
  gene,
  scale,
  offsetTop,
  color
}: {
  gene: GeneInTrack;
  scale: ScaleLinear<number, number>;
  offsetTop: number;
  color: string;
}) => {
  const {
    data: { start: genomicStart, end: genomicEnd }
  } = gene;
  const start = scale(toZeroBased(genomicStart));
  const end = scale(genomicEnd);
  const width = Math.max(end - start, 0.2);

  return svg`
    <rect
      x=${start}
      width=${width}
      y=${offsetTop}
      height=${GENE_HEIGHT}
      fill=${color}
    />
  `;
};

const renderGene = ({
  gene,
  regionName,
  scale,
  offsetTop,
  color,
  allColors,
  trackIndex,
  geneLabelsStore
}: {
  gene: GeneInTrack;
  regionName: string;
  scale: ScaleLinear<number, number>;
  offsetTop: number;
  color: string;
  allColors: Colors;
  trackIndex: number;
  geneLabelsStore: GeneLabelsStore;
}) => {
  const trackY = offsetTop;

  const { merged_exons } = gene.data;
  const firstMergedExon = merged_exons.at(0) as ExonInRegionOverview;
  const lastMergedExon = merged_exons.at(-1) as ExonInRegionOverview;
  const introns: Intron[] = [];

  for (let i = 1; i < merged_exons.length; i++) {
    const prevExon = merged_exons[i - 1];
    const currentExon = merged_exons[i];
    const start = prevExon.end;
    const end = currentExon.start;
    introns.push({ start, end });
  }

  const shouldDrawGeneExtentLeft = gene.data.start < firstMergedExon.start;
  const shouldDrawGeneExtentRight = gene.data.end > lastMergedExon.end;

  return svg`
    <g
      data-name="gene"
      data-stable-id=${gene.data.stable_id}
    >
      ${ shouldDrawGeneExtentLeft && renderGeneExtent({
        from: gene.data.start,
        to: firstMergedExon.start,
        scale,
        color,
        offsetTop,
        direction: 'left'
      })}
      ${renderExons({
        exons: merged_exons,
        trackY,
        scale,
        color
      })}
      ${renderCDSBlocks({
        cdsFragments: gene.data.cds_counts,
        trackY,
        scale,
        color
      })}
      ${renderIntrons({
        introns,
        trackY,
        scale,
        color
      })}
      ${ shouldDrawGeneExtentRight && renderGeneExtent({
        from: lastMergedExon.end,
        to: gene.data.end,
        scale,
        color,
        offsetTop,
        direction: 'right'
      })}
      ${renderGeneLabel({
        gene,
        offsetTop,
        scale,
        geneLabelsStore,
        trackIndex,
        colors: allColors
      })}
      ${renderInteractiveArea({
        gene,
        regionName,
        offsetTop,
        scale
      })}
    </g>
  `;
};

const renderExons = ({
  exons,
  trackY,
  scale,
  color
}: {
  exons: ExonInRegionOverview[];
  trackY: number;
  scale: ScaleLinear<number, number>;
  color: string;
}) => {
  return exons.map((exon) => {
    const left = scale(toZeroBased(exon.start));
    const right = scale(exon.end);
    const width = Math.max(right - left, 0.2);

    return svg`
      <rect
        x=${left}
        y=${trackY}
        width=${width}
        height=${GENE_HEIGHT}
        fill="none"
        stroke=${color}
      />
    `;
  });
};

const renderCDSBlocks = ({
  cdsFragments,
  trackY,
  scale,
  color
}: {
  cdsFragments: OverlappingCDSFragment[];
  trackY: number;
  scale: ScaleLinear<number, number>;
  color: string;
}) => {
  return cdsFragments.map((fragment, index) => {
    const prevFragment = cdsFragments[index - 1];

    // If a CDS fragment starts at the next nucleotide from previous CDS fragment's end,
    // subtract 1 from the start position, to make it start on the same nucleotide the previous fragment ends.
    // This is a hack to avoid empty space between fragments at large zoom-in levels,
    // which appears when the width of the imaginary container where the genes are being rendered into
    // exceeds the length of the region slice
    const fragmentGenomicStart =
      prevFragment && fragment.start - prevFragment.end === 1
        ? prevFragment.end
        : fragment.start;

    const left = scale(toZeroBased(fragmentGenomicStart));
    const right = scale(fragment.end);
    const width = right - left;

    if (!width) {
      return null;
    }

    const opacity = fragment.count;

    return svg`
      <rect
        x=${left}
        y=${trackY}
        width=${width}
        height=${GENE_HEIGHT}
        fill=${color}
        opacity=${opacity}
      />
    `;
  });
};

const renderIntrons = ({
  introns,
  trackY,
  scale,
  color
}: {
  introns: Intron[];
  trackY: number;
  scale: ScaleLinear<number, number>;
  color: string;
}) => {
return introns.map((intron) => {
    const y = trackY + GENE_HEIGHT / 2;

    const x1 = scale(toZeroBased(intron.start));
    const x2 = scale(intron.end);

    return svg`
      <line
        x1=${x1}
        x2=${x2}
        y1=${y}
        y2=${y}
        stroke=${color}
        strokeWidth="1"        
      />
    `;
  });
};

const renderGeneExtent = ({
  from,
  to,
  scale,
  color,
  offsetTop,
  direction
}: {
  from: number; // genomic coordinate
  to: number; // genomic coordinate
  scale: ScaleLinear<number, number>;
  color: string;
  offsetTop: number;
  direction: 'left' | 'right';
}) => {
  const [ scaleGenomicStart ] = scale.domain();
  const genomicDistance = (to - from);
  const width = scale(toZeroBased(scaleGenomicStart) + genomicDistance);

  if (width < 2) {
    return null;
  }

  const xStart = scale(toZeroBased(from));
  const xEnd = xStart + width;

  const lineY = offsetTop + GENE_HEIGHT / 2;
  const geneEndX = direction === 'left' ? xStart : scale(to);

  return svg`
    <line
      x1=${xStart}
      x2=${xEnd}
      y1=${lineY}
      y2=${lineY}
      stroke=${color}
      stroke-dasharray="2"
      stroke-width="1"
    />
    <line
      x1=${geneEndX}
      x2=${geneEndX}
      y1=${offsetTop}
      y2=${offsetTop + GENE_HEIGHT}
      stroke=${color}
      stroke-width="1"
    />
  `;
};

const renderGeneLabel = ({
  gene,
  offsetTop,
  scale,
  geneLabelsStore,
  trackIndex,
  colors
}: {
  gene: GeneInTrack;
  offsetTop: number;
  scale: ScaleLinear<number, number>;
  geneLabelsStore: GeneLabelsStore;
  trackIndex: number;
  colors: Colors;
}) => {
  const [ genomicViewportStart ] = scale.domain();
  const geneStrand = gene.data.strand;
  const labelsForStrand = geneStrand === 'forward'
    ? geneLabelsStore.labels.forwardStrand
    : geneLabelsStore.labels.reverseStrand;
  const labelsForTrack = labelsForStrand[trackIndex];
  const prevLabel = labelsForTrack.at(-1);

  const labelX = scale(Math.max(gene.data.start, genomicViewportStart));

  if (prevLabel && prevLabel.end >= labelX) {
    return null;
  }

  const labelText = gene.data.symbol ?? gene.data.stable_id;
  const labelY = geneStrand === 'forward'
    ? offsetTop + GENE_HEIGHT + GENE_LABEL_HEIGHT + 1
    : offsetTop - 3;

  const textColor = colors.geneLabel;

  const style = 'font-family: "IBM Plex Mono"; user-select: none';

  const labelWidth = Math.ceil(geneLabelsStore.textMeasuringCanvas.getContext('2d')!.measureText(labelText).width);
  labelsForTrack.push({ start: labelX, end: labelX + labelWidth });

  // At this font size, the width of a letter in this monospace font is 6
  return svg`
    <text
      x=${labelX}
      y=${labelY}
      font-size="10"
      style=${style}
      fill=${textColor}
    >
      ${labelText}
    </text>
  `;
};

const renderInteractiveArea = ({
  gene,
  regionName,
  offsetTop,
  scale,
}: {
  gene: GeneInTrack;
  regionName: string;
  offsetTop: number;
  scale: ScaleLinear<number, number>;
}) => {
  const {
    data: { start: genomicStart, end: genomicEnd }
  } = gene;
  const start = scale(toZeroBased(genomicStart));
  const end = scale(genomicEnd);
  const width = Math.max(end - start, 0.2);

  const height = GENE_HEIGHT * 2;
  const verticalMidline = offsetTop + GENE_HEIGHT / 2;
  const y = verticalMidline - height / 2;

  return svg`
    <rect
      data-feature-type="gene"
      data-feature=${JSON.stringify(prepareGeneInfo({ gene, regionName }))}
      class="interactive-area"
      x=${start}
      width=${width}
      y=${y}
      height=${height}
      fill="transparent"
    />
  `;
};

const prepareGeneInfo = ({
  gene,
  regionName
}: {
  gene: GeneInTrack;
  regionName: string;
}): GeneClickPayload['data'] => {
  const { data: geneData } = gene;

  return {
    symbol: geneData.symbol,
    stableId: geneData.stable_id,
    unversionedStableId: geneData.unversioned_stable_id,
    biotype: geneData.biotype,
    regionName,
    start: geneData.start,
    end: geneData.end,
    strand: geneData.strand
  }
};


type GeneLabelsStore = {
  labels: {
    forwardStrand: Record<string, { start: number, end: number }[]>;
    reverseStrand: Record<string, { start: number, end: number }[]>;
  },
  textMeasuringCanvas: HTMLCanvasElement;
};

const createGeneLabelsStore = ({ tracks }: { tracks: FeatureTracks['geneTracks'] }): GeneLabelsStore => {
  const textMeasuringCanvas = document.createElement('canvas');
  const canvasContext = textMeasuringCanvas.getContext('2d') as CanvasRenderingContext2D;
  canvasContext.font = '10px "IBM Plex Mono"';

  const { forwardStrandTracks, reverseStrandTracks } = tracks;
  const labels: GeneLabelsStore['labels'] = {
    forwardStrand: {},
    reverseStrand: {}
  }

  for (let i = 0; i < forwardStrandTracks.length; i++) {
    labels.forwardStrand[i] = [];
  }
  for (let i = 0; i < reverseStrandTracks.length; i++) {
    labels.reverseStrand[i] = [];
  }

  return {
    labels,
    textMeasuringCanvas
  }
};
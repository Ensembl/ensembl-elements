import { svg } from 'lit';
import type { ScaleLinear } from 'd3';

import {
  GENE_TRACKS_TOP_OFFSET,
  GENE_TRACK_HEIGHT,
  GENE_HEIGHT,
  MAX_SLICE_LENGTH_FOR_DETAILED_VIEW
} from './constants';

import type { FeatureTracks, GeneTrack, GeneInTrack } from './prepareFeatureTracks';
import type { GeneInRegionOverview, RegulatoryFeature, RegulatoryFeatureMetadata, ExonInRegionOverview, OverlappingCDSFragment } from '../types/regionOverview';
import type { InputData } from '../types/inputData';

type Intron = {
  start: number;
  end: number;
};

export const renderGeneTracks = ({
  tracks,
  scale,
  start,
  end
}: {
  tracks: FeatureTracks['geneTracks'];
  scale: ScaleLinear<number, number>;
  width: number;
  start: number;
  end: number;
}) => {
  const { forwardStrandTracks, reverseStrandTracks } = tracks;
  let tempY = GENE_TRACKS_TOP_OFFSET;

  // calculate y-coordinates for gene tracks
  const forwardStrandTrackYs: number[] = [];
  const reverseStrandTrackYs: number[] = [];

  // Designer's instruction: forward strand genes stack upwards
  for (let i = forwardStrandTracks.length; i > 0; i--) {
    const y = GENE_TRACKS_TOP_OFFSET + GENE_TRACK_HEIGHT * (i - 1);
    forwardStrandTrackYs.push(y);
    tempY += GENE_TRACK_HEIGHT;
  }

  const strandDividerY = tempY + 0.5 * GENE_TRACK_HEIGHT;
  tempY = strandDividerY + GENE_TRACK_HEIGHT;

  for (let i = 0; i < reverseStrandTracks.length; i++) {
    reverseStrandTrackYs.push(tempY);
    tempY += GENE_TRACK_HEIGHT;
  }
  tempY += GENE_TRACK_HEIGHT;

  // by this point, tempY should be the y-coordinate of the bottom gene track

  const [forwardStrandTrackElements, reverseStrandTrackElements] = [
    forwardStrandTracks,
    reverseStrandTracks
  ].map((tracks, index) => {
    const isForwardStrand = index === 0;
    const yCoordLookup = isForwardStrand
      ? forwardStrandTrackYs
      : reverseStrandTrackYs;

    return tracks.map((track, index) => renderGeneTrack({
      track,
      trackOffsetTop: yCoordLookup[index],
      scale,
      start,
      end
    }))
  });

  return svg`
    <g>
      ${forwardStrandTrackElements}
    </g>
    <g>
      ${reverseStrandTrackElements}
    </g>
  `;
};


const renderGeneTrack = ({
  track,
  trackOffsetTop,
  scale,
  start,
  end
}: {
  track: GeneTrack;
  trackOffsetTop: number;
  scale: ScaleLinear<number, number>;
  start: number;
  end: number;
}) => {
  const shouldDisplayLowResGenes =
    end - start > MAX_SLICE_LENGTH_FOR_DETAILED_VIEW;

  // const shouldDisplayLowResGenes = true;

  const geneElements = track.map((gene) => {
    if (shouldDisplayLowResGenes) {
      return renderGeneLowRes({
        gene,
        scale,
        offsetTop: trackOffsetTop,
        color: 'blue'
      });
    }

    return svg`
      ${renderGene({
        gene,
        scale,
        offsetTop: trackOffsetTop,
        color: 'blue'
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
  const start = scale(genomicStart);
  const end = scale(genomicEnd);
  const width = Math.max(end - start, 0.2);

  return svg`
    <rect
      x=${start}
      width=${width}
      y=${offsetTop}
      height=${GENE_HEIGHT}
      fill="blue"
    />
  `;
};

const renderGene = ({
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
  const trackY = offsetTop;

  const { merged_exons } = gene.data;
  const introns: Intron[] = [];

  for (let i = 1; i < merged_exons.length; i++) {
    const prevExon = merged_exons[i - 1];
    const currentExon = merged_exons[i];
    const start = prevExon.end;
    const end = currentExon.start;

    introns.push({ start, end });
  }

  return svg`
    <g
      data-name="gene"
      data-stable-id=${gene.data.stable_id}
    >
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
    const left = scale(exon.start);
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

    const left = scale(fragmentGenomicStart);
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

    const x1 = scale(intron.start);
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
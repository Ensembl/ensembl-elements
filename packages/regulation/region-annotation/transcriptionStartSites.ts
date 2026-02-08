import { svg } from 'lit';
import { type ScaleLinear } from 'd3';

import { GENE_HEIGHT } from './constants';

import type { GeneInRegionOverview } from '../types/regionOverview';
import type { GeneTrack } from './prepareFeatureTracks';

/**
 * A transcription start site is represented by an L-shaped arrow,
 * whose stem starts in the same track as the gene it is related to,
 * and ascends (in the forward strand) or descends (in the reverse strand)
 * into a separate track.
 */

const VERTICAL_ARM_LENGTH = 12;
const HORIZONTAL_ARM_LENGTH = 6;
const ARROWHEAD_BASE_LENGTH = 6; // the base of the triangle that represents the arrowhead
const ARROWHEAD_HEIGHT = 6.75; // the height of the triangle that represents the arrowhead
const VERTICAL_OFFSET_FROM_GENE = 2;

type Params = {
  tss: GeneInRegionOverview['tss']; // an array of genomic coordinates related to this transcription start site
  strand: 'forward' | 'reverse';
  scale: ScaleLinear<number, number>;
  geneTracks: GeneTrack[];
  trackIndex: number;
  trackOffsetsTop: number[];
  color: string;
};

export const renderTranscriptionStartSites = (params: Params) => {
  const preparedTss = prepareTssData(params);

  return preparedTss.map((site) => renderTranscriptionStartSite({
    ...params,
    site
  }));
};

const renderTranscriptionStartSite = (params: Params & {
  site: ReturnType<typeof prepareTssData>[number];
}) => {
  const { strand, site, color } = params;
  const { yStart, yEnd, x, isOverlapping } = site;

  const stemX = x;
  const armEndX =
    strand === 'forward'
      ? stemX + HORIZONTAL_ARM_LENGTH
      : stemX - HORIZONTAL_ARM_LENGTH;
  const arrowheadPointX =
    strand === 'forward'
      ? armEndX + ARROWHEAD_HEIGHT
      : armEndX - ARROWHEAD_HEIGHT;

  const arrowheadBaseBottomCoords = `${armEndX}, ${yEnd - ARROWHEAD_BASE_LENGTH / 2}`;
  const arrowheadBaseTopCoords = `${armEndX}, ${yEnd + ARROWHEAD_BASE_LENGTH / 2}`;
  const arrowheadPointCoords = `${arrowheadPointX}, ${yEnd}`;

  return svg`
    <g data-name="transcription start site">
      <line
        x1=${stemX}
        x2=${stemX}
        y1=${yStart}
        y2=${yEnd}
        stroke=${color}
        strokeWidth="1"
      />
      <line
        x1=${stemX}
        x2=${armEndX}
        y1=${yEnd}
        y2=${yEnd}
        stroke=${color}
        strokeWidth="1"
      />
      ${isOverlapping ? svg`
        <line
          x1=${armEndX}
          x2=${arrowheadPointX}
          y1=${yEnd}
          y2=${yEnd}
          stroke=${color}
          strokeWidth="1"
        />  
      ` : svg`
        <polygon
          points=${`${arrowheadBaseBottomCoords} ${arrowheadPointCoords} ${arrowheadBaseTopCoords}`}
          fill=${color}
        />
      `
      }
    </g>
  `;
};


const prepareTssData = ({
  tss,
  geneTracks,
  trackIndex,
  trackOffsetsTop,
  strand,
  scale
}: Params) => {
  const minDistanceBetweenTss = 2;

  // Iterate over transcript start sites, and merge together the ones whose genomic coordinates
  //  are too close together to be resolved at the given scale
  let mergedTss: Array<{ position: number; x: number; count: number }> = [];
  let lastX = -Infinity;

  for (const site of tss) {
    const x = scale(site.position);
    if (x - lastX < minDistanceBetweenTss) {
      const lastPreparedTss = mergedTss.at(-1);
      if (!lastPreparedTss) {
        mergedTss.push({
          position: site.position,
          x,
          count: 1
        });
        lastX = x;
      } else {
        lastPreparedTss.count += 1;
      }
    } else {
      mergedTss.push({
        position: site.position,
        x,
        count: 1
      });
      lastX = x;
    }
  }

  const yStart = getYStart({
    geneTracks,
    trackIndex,
    trackOffsetsTop,
    tssList: mergedTss,
    strand,
    scale
  });

  // Take another pass over the TSSs, and check whether the drawing of one TSS
  // will overlap with the neighbour TSS.
  // If they overlap, then do not draw the arrowhead on the earlier TSS
  // (the one on the left if on the forward strand, and the one on the right if on the reverse strand)
  const preparedTss: Array<{
    position: number;
    x: number;
    yStart: number;
    yEnd: number;
    count: number;
    isOverlapping: boolean;
  }> = [];
  if (strand === 'forward') {
    mergedTss = mergedTss.reverse();
  }

  for (const site of mergedTss) {
    const previousTss = preparedTss.at(-1);

    if (!previousTss) {
      preparedTss.push({
        ...site,
        yStart,
        yEnd:
          strand === 'forward'
            ? yStart - VERTICAL_ARM_LENGTH
            : yStart + VERTICAL_ARM_LENGTH,
        isOverlapping: false
      });

      continue;
    }

    const expectedWidth = HORIZONTAL_ARM_LENGTH + ARROWHEAD_HEIGHT + 1;
    const expectedXEnd =
      strand === 'forward' ? site.x + expectedWidth : site.x - expectedWidth;
    const isOperlappingWithPreviousSite =
      strand === 'forward'
        ? previousTss.x <= expectedXEnd
        : previousTss.x >= expectedXEnd;

    const newTss = {
      ...site,
      yStart: previousTss.yStart,
      yEnd:
        strand === 'forward'
          ? yStart - VERTICAL_ARM_LENGTH
          : yStart + VERTICAL_ARM_LENGTH,
      isOverlapping: isOperlappingWithPreviousSite
    };

    preparedTss.push(newTss);
  }

  return preparedTss;
};

// A TSS is to be drawn slightly above the gene (if on the forward stand)
// or slightly below the gene (if on the reverse strand).
// If several genes are competing for the same space (and drawn on top of one another, in separate tracks)
// then TSS should be drawn slightly above the last gene track on the forward strand
// or slightly below the last gene track on the reverse strand.
const getYStart = ({
  geneTracks,
  trackIndex,
  trackOffsetsTop,
  tssList,
  strand,
  scale
}: {
  tssList: Array<{ x: number }>;
  geneTracks: Params['geneTracks'];
  trackIndex: Params['trackIndex'];
  trackOffsetsTop: Params['trackOffsetsTop'];
  strand: Params['strand'];
  scale: Params['scale'];
}) => {
  const tracksWithPossiblyOverlappingGenes = geneTracks.slice(trackIndex + 1);

  if (tracksWithPossiblyOverlappingGenes.length === 0) {
    return strand === 'forward'
      ? trackOffsetsTop[trackIndex] - VERTICAL_OFFSET_FROM_GENE
      : trackOffsetsTop[trackIndex] +
          GENE_HEIGHT +
          VERTICAL_OFFSET_FROM_GENE;
  }

  let trackShiftCount = 0;

  for (const track of tracksWithPossiblyOverlappingGenes) {
    for (const gene of track) {
      const geneStartX = scale(gene.data.start);
      const geneEndX = scale(gene.data.end);

      let hasOverlap = false;

      for (const tss of tssList) {
        if (tss.x >= geneStartX && tss.x <= geneEndX) {
          hasOverlap = true;
          break;
        }
      }

      if (hasOverlap) {
        trackShiftCount++;
        break;
      }
    }
  }

  const adjustedTrackIndex =
    strand === 'forward'
      ? Math.max(trackIndex - trackShiftCount, 0)
      : Math.min(trackIndex + trackShiftCount, trackOffsetsTop.length - 1);
  const yStart =
    strand === 'forward'
      ? trackOffsetsTop[adjustedTrackIndex] - VERTICAL_OFFSET_FROM_GENE
      : trackOffsetsTop[adjustedTrackIndex] +
        GENE_HEIGHT +
        VERTICAL_OFFSET_FROM_GENE;

  return yStart;
};
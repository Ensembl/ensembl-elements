import { svg } from 'lit';
import { type ScaleLinear } from 'd3';

import { RULER_HEIGHT, ALIGNMENT_AREA_HEIGHT, COLORS } from '../constants/constants';

import type { Alignment } from '../types/alignment';

export const renderAlignments = ({
  alignments,
  referenceScale,
  targetScale
}: {
  alignments: Alignment[];
  referenceScale: ScaleLinear<number, number>; // <-- scale used for the reference genome
  targetScale: ScaleLinear<number, number>;
}) => {
  if (alignments.length > 200) {
    alignments = getReducedAlignments({
      alignments,
      referenceScale,
      targetScale
    });
  }

  const inversions: Alignment[] = [];

  const alignmentElements = alignments.map((alignment) => {
    if (isInversion(alignment)) {
      inversions.push(alignment);
      return null;
    }

    const color = COLORS.alignment;

    return renderAlignment({
      alignment,
      referenceScale,
      targetScale,
      color
    });
  });

  const inversionElements = inversions.map(alignment => {
    return renderInvertedAlignment({
      alignment,
      referenceScale,
      targetScale
    });
  })

  return svg`
    <g>
      ${alignmentElements}
      ${inversionElements}
    </g>
  `;
};

const getReducedAlignments = ({
  alignments,
  referenceScale,
  targetScale,
}: {
  alignments: Alignment[];
  referenceScale: ScaleLinear<number, number>;
  targetScale: ScaleLinear<number, number>;
}) => {
  const reducedAlignments: Alignment[] = [];

  const resolvingDistanceInPixels = 1;

  for (const alignment of alignments) {
    if (!reducedAlignments.length) {
      reducedAlignments.push(structuredClone(alignment));
      continue;
    }

    const lastAlignment = reducedAlignments.at(-1);
    
    if (
      !isInversion(lastAlignment) && isInversion(alignment) ||
      isInversion(lastAlignment) && !isInversion(alignment)
    ) {
      reducedAlignments.push(structuredClone(alignment));
      continue;
    }

    const lastAlignmentReferenceXEnd = referenceScale(lastAlignment.reference.start + lastAlignment.reference.length - 1);
    const alignmentReferenceXStart = referenceScale(alignment.reference.start);

    const lastAlignmentTargetXEnd = targetScale(lastAlignment.target.start + lastAlignment.target.length - 1);
    const alignmentTargetXStart = targetScale(alignment.target.start);

    const canResolveReferenceAxis = alignmentReferenceXStart - lastAlignmentReferenceXEnd >= resolvingDistanceInPixels;
    const canResolveTargetAxis = alignmentTargetXStart - lastAlignmentTargetXEnd >= resolvingDistanceInPixels;

    if (canResolveReferenceAxis || canResolveTargetAxis) {
      reducedAlignments.push(structuredClone(alignment));
    } else {
      const updatedReferenceLength = alignment.reference.start + alignment.reference.length - lastAlignment.reference.start;
      const updatedTargetLength = alignment.target.start + alignment.target.length - lastAlignment.target.start;

      if (updatedReferenceLength < 0 || updatedTargetLength < 0) {
        // something has gone wrong;
        continue;
      } else {
        lastAlignment.reference.length = updatedReferenceLength;
        lastAlignment.target.length = updatedTargetLength;
      }
    }
  }

  return reducedAlignments;
};

const renderAlignment = ({
  alignment,
  referenceScale,
  targetScale,
  color
}: {
  alignment: Alignment;
  referenceScale: ScaleLinear<number, number>;
  targetScale: ScaleLinear<number, number>;
  color: string;
}) => {
  if (isInversion(alignment)) {
    console.log("INVERSION", alignment);
    return renderInvertedAlignment({
      alignment,
      referenceScale,
      targetScale
    });
  }

  const referenceX1 = referenceScale(alignment.reference.start);
  const referenceX2 = referenceScale(alignment.reference.start + alignment.reference.length - 1);

  const offsetY = RULER_HEIGHT;

  const targetX1 = targetScale(alignment.target.start);
  const targetX2 = targetScale(alignment.target.start + alignment.target.length - 1);
  const targetY = ALIGNMENT_AREA_HEIGHT + RULER_HEIGHT;

  const points: number[][] = [
    [referenceX1, offsetY],
    [referenceX2, offsetY],
    [targetX2, targetY],
    [targetX1, targetY],
  ];

  const pointsString = points.map(pair => pair.join(' ')).join(', ');

  return svg`
    <polygon
      points=${pointsString}
      fill=${color}
      data-reference-start=${alignment.reference.start}
      data-reference-end=${alignment.reference.start + alignment.reference.length - 1}
      data-target-start=${alignment.target.start}
      data-target-end=${alignment.target.start + alignment.target.length - 1}
    />
  `;
};

const renderInvertedAlignment = ({
  alignment,
  referenceScale,
  targetScale
}: {
  alignment: Alignment;
  referenceScale: ScaleLinear<number, number>;
  targetScale: ScaleLinear<number, number>;
}) => {
  const referenceX1 = referenceScale(alignment.reference.start);
  const referenceX2 = referenceScale(alignment.reference.start + alignment.reference.length - 1);
  const color = COLORS.inversion;
  const offsetY = RULER_HEIGHT;

  const targetX1 = targetScale(alignment.target.start);
  const targetX2 = targetScale(alignment.target.start + alignment.target.length - 1);
  const targetY = ALIGNMENT_AREA_HEIGHT + RULER_HEIGHT;

  const points: number[][] = [
    [referenceX1, offsetY],
    [referenceX2, offsetY],
    [targetX1, targetY],
    [targetX2, targetY],
  ];

  const pointsString = points.map(pair => pair.join(' ')).join(', ');

  return svg`
    <polygon
      points=${pointsString}
      fill=${color}
      fill-opacity="0.6"
      data-reference-start=${alignment.reference.start}
      data-reference-end=${alignment.reference.start + alignment.reference.length - 1}
      data-target-start=${alignment.target.start}
      data-target-end=${alignment.target.start + alignment.target.length - 1}
      data-type="inverted-alignment"
    />
  `;
};


const isInversion = (alignment: Alignment) => {
  return alignment.reference.strand !== alignment.target.strand;
}
import { svg } from 'lit';
import { type ScaleLinear } from 'd3';

import { RULER_HEIGHT, ALIGNMENT_AREA_HEIGHT, COLORS } from '../constants/constants';

import type { Alignment } from '../types/alignment';

export const renderAlignments = ({
  alignments,
  referenceScale,
  altScale
}: {
  alignments: Alignment[];
  referenceScale: ScaleLinear<number, number>; // <-- scale used for the reference genome
  altScale: ScaleLinear<number, number>;
}) => {
  if (alignments.length > 200) {
    alignments = getReducedAlignments({
      alignments,
      referenceScale,
      altScale
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
      altScale,
      color
    });
  });

  const inversionElements = inversions.map(alignment => {
    return renderInvertedAlignment({
      alignment,
      referenceScale,
      altScale
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
  altScale,
}: {
  alignments: Alignment[];
  referenceScale: ScaleLinear<number, number>;
  altScale: ScaleLinear<number, number>;
}) => {
  const reducedAlignments: Alignment[] = [];

  const resolvingDistanceInPixels = 1;

  for (const alignment of alignments) {
    if (!reducedAlignments.length) {
      reducedAlignments.push(structuredClone(alignment));
      continue;
    }

    const lastAlignment = reducedAlignments.at(-1) as Alignment;
    
    if (
      !isInversion(lastAlignment) && isInversion(alignment) ||
      isInversion(lastAlignment) && !isInversion(alignment)
    ) {
      reducedAlignments.push(structuredClone(alignment));
      continue;
    }

    const lastAlignmentReferenceXEnd = referenceScale(lastAlignment.reference.start + lastAlignment.reference.length - 1);
    const alignmentReferenceXStart = referenceScale(alignment.reference.start);

    const lastAlignmentAltXEnd = altScale(lastAlignment.alt.start + lastAlignment.alt.length - 1);
    const alignmentAltXStart = altScale(alignment.alt.start);

    const canResolveReferenceAxis = alignmentReferenceXStart - lastAlignmentReferenceXEnd >= resolvingDistanceInPixels;
    const canResolveAltAxis = alignmentAltXStart - lastAlignmentAltXEnd >= resolvingDistanceInPixels;

    if (canResolveReferenceAxis || canResolveAltAxis) {
      reducedAlignments.push(structuredClone(alignment));
    } else {
      const updatedReferenceLength = alignment.reference.start + alignment.reference.length - lastAlignment.reference.start;
      const updatedAltLength = alignment.alt.start + alignment.alt.length - lastAlignment.alt.start;

      if (updatedReferenceLength < 0 || updatedAltLength < 0) {
        // something has gone wrong;
        continue;
      } else {
        lastAlignment.reference.length = updatedReferenceLength;
        lastAlignment.alt.length = updatedAltLength;
      }
    }
  }

  return reducedAlignments;
};

const renderAlignment = ({
  alignment,
  referenceScale,
  altScale,
  color
}: {
  alignment: Alignment;
  referenceScale: ScaleLinear<number, number>;
  altScale: ScaleLinear<number, number>;
  color: string;
}) => {
  if (isInversion(alignment)) {
    return renderInvertedAlignment({
      alignment,
      referenceScale,
      altScale
    });
  }

  const referenceX1 = referenceScale(alignment.reference.start);
  const referenceX2 = referenceScale(alignment.reference.start + alignment.reference.length - 1);

  const offsetY = RULER_HEIGHT;

  const altX1 = altScale(alignment.alt.start);
  const altX2 = altScale(alignment.alt.start + alignment.alt.length - 1);
  const altY = ALIGNMENT_AREA_HEIGHT + RULER_HEIGHT;

  const points: number[][] = [
    [referenceX1, offsetY],
    [referenceX2, offsetY],
    [altX2, altY],
    [altX1, altY],
  ];

  const pointsString = points.map(pair => pair.join(' ')).join(', ');

  return svg`
    <polygon
      points=${pointsString}
      fill=${color}
      fill-opacity=${0.12}
      data-reference-start=${alignment.reference.start}
      data-reference-end=${alignment.reference.start + alignment.reference.length - 1}
      data-alt-start=${alignment.alt.start}
      data-alt-end=${alignment.alt.start + alignment.alt.length - 1}
    />
  `;
};

const renderInvertedAlignment = ({
  alignment,
  referenceScale,
  altScale
}: {
  alignment: Alignment;
  referenceScale: ScaleLinear<number, number>;
  altScale: ScaleLinear<number, number>;
}) => {
  const referenceX1 = referenceScale(alignment.reference.start);
  const referenceX2 = referenceScale(alignment.reference.start + alignment.reference.length - 1);
  const color = COLORS.inversion;
  const offsetY = RULER_HEIGHT;

  const altX1 = altScale(alignment.alt.start);
  const altX2 = altScale(alignment.alt.start + alignment.alt.length - 1);
  const altY = ALIGNMENT_AREA_HEIGHT + RULER_HEIGHT;

  const points: number[][] = [
    [referenceX1, offsetY],
    [referenceX2, offsetY],
    [altX1, altY],
    [altX2, altY],
  ];

  const pointsString = points.map(pair => pair.join(' ')).join(', ');

  return svg`
    <polygon
      points=${pointsString}
      fill=${color}
      fill-opacity="0.35"
      data-reference-start=${alignment.reference.start}
      data-reference-end=${alignment.reference.start + alignment.reference.length - 1}
      data-alt-start=${alignment.alt.start}
      data-alt-end=${alignment.alt.start + alignment.alt.length - 1}
      data-type="inverted-alignment"
    />
  `;
};


const isInversion = (alignment: Alignment) => {
  return alignment.reference.strand !== alignment.alt.strand;
}
import { svg } from 'lit';
import type { ScaleLinear } from 'd3';

import {
  RULER_HEIGHT,
  VARIANT_HEIGHT,
  COLORS,
  STRUCTURAL_VARIANT_LENGTH_CUTOFF
} from '../constants/constants';

import type { Variant } from '../types/variant';

export const renderVariants = ({
  variants,
  scale
}: {
  variants: Variant[];
  scale: ScaleLinear<number, number>;
}) => {
  const variantElements = variants.map(variant => renderVariant({
    variant,
    scale
  })).filter(node => node !== null);

  return svg`
    <g>
      ${variantElements}
    </g>
  `;
};

const renderVariant = ({
  variant,
  scale
}: {
  variant: Variant;
  scale: ScaleLinear<number, number>;
}) => {
  const genomicStart = variant.location.start;
  const genomicEnd = variant.location.end;

  const isStructuralVariant = variant.extent >= STRUCTURAL_VARIANT_LENGTH_CUTOFF;

  const [viewportGenomicStart, viewportGenomicEnd] = scale.domain();
  const viewportGenomicDistance = viewportGenomicEnd - viewportGenomicStart;
  const shouldShowAllVariants = viewportGenomicDistance <= 100_000;
  
  const x = scale(genomicStart);
  const y = RULER_HEIGHT;
  let width = scale(genomicEnd + 1) - scale(genomicStart);
  let color = COLORS[variant.type as keyof typeof COLORS] || '#000000';

  if (variant.extent < STRUCTURAL_VARIANT_LENGTH_CUTOFF && !shouldShowAllVariants) {
    return null;
  } else if (!width) {
    if (isStructuralVariant || shouldShowAllVariants) {
      width = 1;
    } else {
      return null;
    }
  }

  return svg`
    <rect
      x=${x}
      y=${y}
      width=${width}
      height=${VARIANT_HEIGHT}
      fill=${color}
      class="variant"
      data-feature-type="variant"
      data-name=${variant.name}
      data-variant-type=${variant.type}
      data-variant-region-name=${variant.location.region_name}
      data-variant-start=${variant.location.start}
      data-variant-end=${variant.location.end}
      data-variant-extent=${variant.extent}
      data-variant-consequence=${variant.consequence}
    />
  `;
};
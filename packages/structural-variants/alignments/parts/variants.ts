import { svg } from 'lit';
import type { ScaleLinear } from 'd3';

import { RULER_HEIGHT, VARIANT_HEIGHT, COLORS } from '../constants/constants';

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
  }));

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

  const [viewportGenomicStart, viewportGenomicEnd] = scale.domain();
  const viewportGenomicDistance = viewportGenomicEnd - viewportGenomicStart;
  
  const x = scale(genomicStart);
  const y = RULER_HEIGHT;
  let width = scale(genomicEnd + 1) - scale(genomicStart);
  let color = COLORS[variant.type] || '#000000';

  if (!width) {
    if (viewportGenomicDistance > 100_000) {
      return null;
    } else {
      width = 1;
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
      data-variant-start=${variant.location.start}
      data-variant-end=${variant.location.end}
    />
  `;
};
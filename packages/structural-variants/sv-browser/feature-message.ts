import type { Variant } from '../alignments/types/variant';

export type MessageMarkup = 'light' | 'strong' | 'emphasis' | 'focus';

export type MessageTextUnit = {
  text: string;
  markup: MessageMarkup[];
};

export type MessageBlock = {
  type: 'block';
  items: MessageTextUnit[];
};

export type MessageParagraph = MessageBlock[];


// has metadata; normally corresponds to a feature
export type MessageSection = {
  data: MessageParagraph[];
  metadata: unknown;
};

export type PayloadVariety = {
  type: 'zmenu';
  'zmenu-type': string;
};


export type FeatureClickEventDetails = {
  genome_id: string;
  payload: {
    x: number;
    y: number;
    content: MessageSection[];
    variety: PayloadVariety[];
  };
};



/**
 * The prepared message content should look as follows:
 * 
 * Variant { name } { type }
 * Most severe consequence { consequence }
 * Reference length { extent } bp
 * (or Alt allele length { extent } bp if this is an insertion )
 * {regionName}:{start}-{end} (if end != start) { strand } strand
 */
export const prepareHaplotypeVariantMessageContent = (variant: Variant) => {
  const numberFormatter = new Intl.NumberFormat('en-GB');

  const messageBlock1: MessageBlock = {
    type: 'block',
    items: [
      { text: 'Variant', markup: ['light'] },
      { text: ' ', markup: [] },
      { text: variant.name, markup: ['strong'] }
    ]
  };
  const messageBlock2: MessageBlock = {
    type: 'block',
    items: [
      { text: variant.type, markup: ['light'] },
    ]
  };
  const messageParagraph1 = [messageBlock1, messageBlock2];

  const messageBlock3: MessageBlock = {
    type: 'block',
    items: [
      { text: 'Most severe consequence', markup: ['light'] },
      { text: ' ', markup: [] },
      { text: variant.consequence, markup: [] }
    ]
  };
  const messageParagraph2 = [messageBlock3];

  const alleleText = variant.type === 'insertion' ? 'Alt allele' : 'Reference';

  const messageBlock4: MessageBlock = {
    type: 'block',
    items: [
      { text: `${alleleText} length`, markup: ['light'] },
      { text: ' ', markup: [] },
      { text: `${variant.extent}`, markup: [] },
      { text: ' ', markup: [] },
      { text: 'bp', markup: ['light'] }
    ]
  };
  const messageParagraph3 = [messageBlock4];

  const variantStart = variant.location.start;
  const formattedVariantStart = numberFormatter.format(variantStart);
  const variantEnd = variant.location.end;
  const formattedVariantEnd = numberFormatter.format(variantEnd);
  const locationString = variantEnd === variantStart
    ? `${variant.location.region_name}:${formattedVariantStart}`
    : `${variant.location.region_name}:${formattedVariantStart}-${formattedVariantEnd}`;

  const messageBlock5: MessageBlock = {
    type: 'block',
    items: [
      { text: locationString, markup: [] }
    ]
  };
  const messageParagraph4 = [messageBlock5];

  const messageSection: MessageSection = {
    data: [
      messageParagraph1,
      messageParagraph2,
      messageParagraph3,
      messageParagraph4
    ],
    metadata: {}
  };

  return [messageSection];
};
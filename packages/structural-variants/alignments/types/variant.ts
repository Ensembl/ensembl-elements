export type Variant = {
  name: string;
  type: string;
  location: {
    region_name: string;
    start: number;
    end: number;
  }
};

export type ClickedVariantPayload = {
  variantType: string;
  variantName: string;
  variantStart: string;
  variantEnd: string;
  anchor: Element;
};
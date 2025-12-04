export type PositionChangePayload = {
  start: number;
  end: number;
};

export type ViewportChangePayload = {
  reference?: PositionChangePayload;
  alt?: PositionChangePayload;
};

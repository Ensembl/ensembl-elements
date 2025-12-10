export type LocationChangePayload = {
  start: number;
  end: number;
};

export type ViewportChangePayload = {
  reference?: LocationChangePayload;
  alt?: LocationChangePayload;
};

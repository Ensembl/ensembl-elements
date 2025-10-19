/**
 * NOTE: this helper is not currently used anywhere; so is a candidate for removal.
 */


// same logic for genes and regulatory features
// (the only consideration is that regulatory features may have extended start or end)
const isFeatureInsideSelection = (params: {
  feature: {
    start: number;
    end: number;
    extended_start?: number;
    extended_end?: number;
  };
  start?: number;
  end?: number;
}) => {
  const { feature, start, end } = params;

  // if start and/or end are not provided, consider feature to be part of selection
  if (!start || !end) {
    return true;
  }

  const isExtendedStartInsideSelection = feature.extended_start
    ? feature.extended_start > start && feature.extended_start < end
    : false;
  const isExtendedEndInsideSelection = feature.extended_end
    ? feature.extended_end > start && feature.extended_end < end
    : false;
  const isFeatureStartInsideSelection =
    feature.start > start && feature.start < end;
  const isFeatureEndInsideSelection = feature.end > start && feature.end < end;
  // for features that fill the viewport and have start/end hanging outside
  const isOverhangingFeature =
    ((feature.extended_start && feature.extended_start < start) ||
      feature.start < start) &&
    ((feature.extended_end && feature.extended_end > end) || feature.end > end);

  return (
    isExtendedStartInsideSelection ||
    isExtendedEndInsideSelection ||
    isFeatureStartInsideSelection ||
    isFeatureEndInsideSelection ||
    isOverhangingFeature
  );
};
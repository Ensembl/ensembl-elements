import { svg } from 'lit';
import type { ScaleLinear } from 'd3';

import {
  REGULATORY_FEATURE_TRACK_HEIGHT,
  REGULATORY_FEATURE_CORE_HEIGHT,
  REGULATORY_FEATURE_EXTENT_HEIGHT,
  MAX_SLICE_LENGTH_FOR_DETAILED_VIEW
} from './constants';

import type { RegulatoryFeature } from '../types/regionOverview';
import type { InputData } from '../types/inputData';
import type { RegulatoryFeatureClickPayload } from '../types/featureClickEvent';
import type { Colors } from './constants';

export const renderRegulatoryFeatureTracks = ({
  tracks,
  featureTypes,
  scale,
  regionName,
  focusRegulatoryFeatureId,
  offsetTop,
  colors
}: {
  tracks: RegulatoryFeature[][];
  featureTypes: InputData['regulatory_feature_types'];
  scale: ScaleLinear<number, number>;
  regionName: string;
  focusRegulatoryFeatureId: string | null;
  offsetTop: number;
  colors: Colors;
}) => {
  return svg`
    <g>
      ${tracks.map((track, index) => renderTrack({
        track,
        featureTypes,
        scale,
        regionName,
        focusRegulatoryFeatureId,
        offsetTop: offsetTop + index * REGULATORY_FEATURE_TRACK_HEIGHT,
        colors
      }))}
    </g>
  `;
};

const renderTrack = ({
  track,
  featureTypes,
  scale,
  regionName,
  focusRegulatoryFeatureId,
  offsetTop,
  colors
}: {
  track: RegulatoryFeature[];
  featureTypes: InputData['regulatory_feature_types'];
  scale: ScaleLinear<number, number>;
  regionName: string;
  focusRegulatoryFeatureId: string | null;
  offsetTop: number;
  colors: Colors;
}) => {
  const [viewportGenomicStart, viewportGenomicEnd] = scale.domain();
  const viewportGenomicDistance = viewportGenomicEnd - viewportGenomicStart + 1;

  const shouldRenderLowRes = viewportGenomicDistance > MAX_SLICE_LENGTH_FOR_DETAILED_VIEW;

  const featureElements = track.map((feature, index) => {
    const prevFeature = index > 0 ? track[index - 1] : null;

    const featureGenomicStart = feature.extended_start ?? feature.start;
    const featureGenomicEnd = feature.extended_end ?? feature.end;
    const featureStart = scale(featureGenomicStart);
    const featureEnd = scale(featureGenomicEnd + 1);

    const prevFeatureGenomicStart =
      prevFeature?.extended_start ?? prevFeature?.start;
    const prevFeatureGenomicEnd = prevFeature?.extended_end ?? prevFeature?.end;
    const prevFeatureStart = prevFeatureGenomicStart
      ? scale(prevFeatureGenomicStart)
      : -1;
    const prevFeatureEnd = prevFeatureGenomicEnd
      ? scale(prevFeatureGenomicEnd + 1)
      : -1;

    if (featureStart === prevFeatureStart && featureEnd === prevFeatureEnd) {
      // do not render DOM elements that will occupy the same space
      // TODO: we may want to apply a smarter strategy here,
      // wherein 'more important' reg features, such as promoters, will win over less important ones
      return null;
    }

    return renderRegulatoryFeature({
      feature,
      featureTypes,
      offsetTop,
      regionName,
      focusRegulatoryFeatureId,
      scale,
      isLowRes: shouldRenderLowRes,
      colors
    });
  });

  return svg`
    <g>
      ${featureElements}
    </g>
  `;
};

const renderRegulatoryFeature = (params: {
  feature: RegulatoryFeature;
  featureTypes: InputData['regulatory_feature_types'];
  offsetTop: number;
  regionName: string;
  focusRegulatoryFeatureId: string | null;
  scale: ScaleLinear<number, number>;
  isLowRes: boolean;
  colors: Colors;
}) => {
  if (params.isLowRes) {
    return renderFeatureLowRes(params);
  } else {
    return renderFeatureHiRes(params);
  }
};

const renderFeatureLowRes = (params: {
  feature: RegulatoryFeature;
  focusRegulatoryFeatureId: string | null;
  featureTypes: InputData['regulatory_feature_types'];
  offsetTop: number;
  scale: ScaleLinear<number, number>;
  colors: Colors;
}) => {
  const { feature, featureTypes, offsetTop, scale } = params;
  const genomicStart = feature.extended_start ?? feature.start;
  const genomicEnd = feature.extended_end ?? feature.end;
  const x1 = scale(genomicStart);
  const x2 = scale(genomicEnd + 1);
  const width = Math.max(x2 - x1, 2);
  let color = featureTypes[feature.feature_type].color;

  if (params.focusRegulatoryFeatureId && feature.id !== params.focusRegulatoryFeatureId) {
    color = params.colors.regulatoryFeatureUnfocused;
  }

  return svg`
    <rect
      x=${x1}
      width=${width}
      y=${offsetTop}
      height=${REGULATORY_FEATURE_CORE_HEIGHT}
      fill=${color}
    />
  `;
};

const renderFeatureHiRes = (params: {
  feature: RegulatoryFeature;
  featureTypes: InputData['regulatory_feature_types'];
  focusRegulatoryFeatureId: string | null;
  offsetTop: number;
  regionName: string;
  scale: ScaleLinear<number, number>;
  colors: Colors;
}) => {
  return svg`
    <g>
      ${renderBoundsRegion({...params, side: 'left'})}
      ${renderCoreRegion(params)}
      ${renderBoundsRegion({...params, side: 'right'})}
      ${renderInteractiveArea({ ...params })}
    </g>
  `;
};

const renderCoreRegion = ({
  feature,
  focusRegulatoryFeatureId,
  featureTypes,
  scale,
  offsetTop,
  colors
}: {
  feature: RegulatoryFeature;
  focusRegulatoryFeatureId: string | null;
  featureTypes: InputData['regulatory_feature_types'];
  offsetTop: number;
  scale: ScaleLinear<number, number>;
  colors: Colors;
}) => {
  const x1 = scale(feature.start);
  const x2 = scale(feature.end + 1);
  const width = Math.max(x2 - x1, 2);
  let color = featureTypes[feature.feature_type].color;

  if (focusRegulatoryFeatureId && feature.id !== focusRegulatoryFeatureId) {
    color = colors.regulatoryFeatureUnfocused;
  }

  return svg`
    <rect
      x=${x1}
      width=${width}
      y=${offsetTop}
      height=${REGULATORY_FEATURE_CORE_HEIGHT}
      fill=${color}
    />
  `;
};

const renderBoundsRegion = ({
  feature,
  focusRegulatoryFeatureId,
  featureTypes,
  scale,
  offsetTop,
  side,
  colors
}: {
  feature: RegulatoryFeature;
  focusRegulatoryFeatureId: string | null;
  featureTypes: InputData['regulatory_feature_types'];
  offsetTop: number;
  scale: ScaleLinear<number, number>;
  side: 'left' | 'right';
  colors: Colors;
}) => {
  const extentCoordinate =
    side === 'left' ? feature.extended_start : feature.extended_end;
  const isExtentSameAsCore =
    side === 'left'
      ? extentCoordinate === feature.start
      : extentCoordinate === feature.end;

  if (!extentCoordinate || isExtentSameAsCore) {
    return null;
  }

  const extentX = side === 'left' ? scale(extentCoordinate) : scale(extentCoordinate + 1);
  const width =
    side === 'left'
      ? scale(feature.start) - extentX
      : extentX - scale(feature.end);

  if (width <= 0) {
    return null;
  }

  const start = side === 'left' ? extentX : scale(feature.end);
  let color = featureTypes[feature.feature_type].color;

  if (focusRegulatoryFeatureId && feature.id !== focusRegulatoryFeatureId) {
    color = colors.regulatoryFeatureUnfocused;
  }

  return svg`
    <rect
      x=${start}
      width=${width}
      y=${offsetTop + REGULATORY_FEATURE_CORE_HEIGHT / 4}
      height=${REGULATORY_FEATURE_EXTENT_HEIGHT}
      fill=${color}
    />
  `;
};

const renderInteractiveArea = (params: {
  feature: RegulatoryFeature;
  regionName: string;
  offsetTop: number;
  scale: ScaleLinear<number, number>;
}) => {
  const { feature, regionName, offsetTop, scale } = params;
  const genomicStart = feature.extended_start ?? feature.start;
  const genomicEnd = feature.extended_end ?? feature.end;
  const x1 = scale(genomicStart);
  const x2 = scale(genomicEnd + 1);
  const width = Math.max(x2 - x1, 2);

  return svg`
    <rect
      data-feature-type="regulatory-feature"
      data-feature=${JSON.stringify(prepareFeatureInfo({feature, regionName }))}
      class="interactive-area"
      x=${x1}
      width=${width}
      y=${offsetTop}
      height=${REGULATORY_FEATURE_CORE_HEIGHT}
      fill="transparent"
    />
  `;
};


const prepareFeatureInfo = ({
  feature,
  regionName
}: {
  feature: RegulatoryFeature;
  regionName: string;
}): RegulatoryFeatureClickPayload['data'] => {
  return {
    id: feature.id,
    feature_type: feature.feature_type,
    start: feature.start,
    end: feature.end,
    extended_start: feature.extended_start,
    extended_end: feature.extended_end,
    strand: feature.strand,
    regionName
  }
};
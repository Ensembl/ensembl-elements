import { svg, nothing } from 'lit';
import type { ScaleLinear } from 'd3';

import {
  REGULATORY_FEATURE_TRACK_HEIGHT,
  REGULATORY_FEATURE_CORE_HEIGHT,
  REGULATORY_FEATURE_EXTENT_HEIGHT,
  MAX_SLICE_LENGTH_FOR_DETAILED_VIEW
} from './constants';
import { toZeroBased } from '../helpers/toZeroBased';

import type { RegulatoryFeature } from '../types/regionOverview';
import type { InputData } from '../types/inputData';
import type { RegulatoryFeatureClickPayload } from '../types/featureClickEvent';
import type { Colors } from './constants';

export const renderRegulatoryFeatureTracks = ({
  tracks,
  featureTypes,
  scale,
  regionName,
  focusRegulatoryFeatureIds,
  offsetTop,
  colors
}: {
  tracks: RegulatoryFeature[][];
  featureTypes: InputData['regulatory_feature_types'];
  scale: ScaleLinear<number, number>;
  regionName: string;
  focusRegulatoryFeatureIds: string[];
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
        focusRegulatoryFeatureIds,
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
  focusRegulatoryFeatureIds,
  offsetTop,
  colors
}: {
  track: RegulatoryFeature[];
  featureTypes: InputData['regulatory_feature_types'];
  scale: ScaleLinear<number, number>;
  regionName: string;
  focusRegulatoryFeatureIds: string[];
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
    const featureStart = scale(toZeroBased(featureGenomicStart));
    const featureEnd = scale(featureGenomicEnd);

    const prevFeatureGenomicStart =
      prevFeature?.extended_start ?? prevFeature?.start;
    const prevFeatureGenomicEnd = prevFeature?.extended_end ?? prevFeature?.end;
    const prevFeatureStart = prevFeatureGenomicStart
      ? scale(toZeroBased(prevFeatureGenomicStart))
      : -1;
    const prevFeatureEnd = prevFeatureGenomicEnd
      ? scale(prevFeatureGenomicEnd)
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
      focusRegulatoryFeatureIds,
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
  focusRegulatoryFeatureIds: string[];
  scale: ScaleLinear<number, number>;
  isLowRes: boolean;
  colors: Colors;
}) => {
  const isFocusFeature = params.focusRegulatoryFeatureIds.includes(params.feature.id);

  if (params.isLowRes) {
    return renderFeatureLowRes({...params, isFocusFeature});
  } else {
    return renderFeatureHiRes({...params, isFocusFeature});
  }
};

const renderFeatureLowRes = (params: {
  feature: RegulatoryFeature;
  isFocusFeature: boolean;
  featureTypes: InputData['regulatory_feature_types'];
  offsetTop: number;
  scale: ScaleLinear<number, number>;
  colors: Colors;
}) => {
  const { feature, featureTypes, offsetTop, scale } = params;
  const genomicStart = feature.extended_start ?? feature.start;
  const genomicEnd = feature.extended_end ?? feature.end;
  const x1 = scale(toZeroBased(genomicStart));
  const x2 = scale(genomicEnd);
  let y = offsetTop;
  const width = Math.max(x2 - x1, 2);
  let height = REGULATORY_FEATURE_CORE_HEIGHT;
  const color = featureTypes[feature.feature_type].color;

  if (params.isFocusFeature) {
    // make the feature twice as tall
    height = height * 2;
    y = y - height / 4;
  }

  return svg`
    <rect
      x=${x1}
      width=${width}
      y=${y}
      height=${height}
      fill=${color}
    />
  `;
};

const renderFeatureHiRes = (params: {
  feature: RegulatoryFeature;
  isFocusFeature: boolean;
  featureTypes: InputData['regulatory_feature_types'];
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
      ${params.isFocusFeature ? renderFocusHalo(params) : nothing}
      ${renderInteractiveArea({ ...params })}
    </g>
  `;
};

const renderCoreRegion = ({
  feature,
  isFocusFeature,
  featureTypes,
  scale,
  offsetTop
}: {
  feature: RegulatoryFeature;
  isFocusFeature: boolean;
  featureTypes: InputData['regulatory_feature_types'];
  offsetTop: number;
  scale: ScaleLinear<number, number>;
  colors: Colors;
}) => {
  const x1 = scale(toZeroBased(feature.start));
  const x2 = scale(feature.end);
  let y = offsetTop;
  const width = Math.max(x2 - x1, 2);
  let height = REGULATORY_FEATURE_CORE_HEIGHT;
  const color = featureTypes[feature.feature_type].color;

  return svg`
    <rect
      x=${x1}
      width=${width}
      y=${y}
      height=${height}
      fill=${color}
    />
  `;
};

const renderBoundsRegion = ({
  feature,
  isFocusFeature,
  featureTypes,
  scale,
  offsetTop,
  side
}: {
  feature: RegulatoryFeature;
  isFocusFeature: boolean;
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

  const extentX = side === 'left'
    ? scale(toZeroBased(extentCoordinate))
    : scale(extentCoordinate);
  const width =
    side === 'left'
      ? scale(feature.start) - extentX
      : extentX - scale(feature.end);

  if (width <= 0) {
    return null;
  }

  const start = side === 'left' ? extentX : scale(feature.end);
  const color = featureTypes[feature.feature_type].color;
  let y = offsetTop + REGULATORY_FEATURE_CORE_HEIGHT / 4;
  let height = REGULATORY_FEATURE_EXTENT_HEIGHT;

  return svg`
    <rect
      x=${start}
      width=${width}
      y=${y}
      height=${height}
      fill=${color}
    />
  `;
};

const renderFocusHalo = ({
  feature,
  featureTypes,
  offsetTop,
  scale
}: {
  feature: RegulatoryFeature;
  featureTypes: InputData['regulatory_feature_types'];
  offsetTop: number;
  regionName: string;
  scale: ScaleLinear<number, number>;
  colors: Colors;
}) => {
  const color = featureTypes[feature.feature_type].color;
  const genomicStart = feature.extended_start ?? feature.start;
  const genomicEnd = feature.extended_end ?? feature.end;
  const x1 = scale(toZeroBased(genomicStart));
  const x2 = scale(genomicEnd);
  const width = Math.max(x2 - x1, 2);

  const smudgeExtent = 20; // TODO: move to constant
  const height = REGULATORY_FEATURE_CORE_HEIGHT + smudgeExtent * 2;
  const y = offsetTop - height / 2 + REGULATORY_FEATURE_CORE_HEIGHT / 2;

  const gradientId = `gradient-${feature.id}`;
  const gradient = svg`
    <defs>
      <linearGradient id=${gradientId} x1="0%" x2="0%" y1="0%" y2="100%">
        <stop offset="0%" stop-color=${color} stop-opacity="0" />
        <stop offset="20%" stop-color=${color} stop-opacity="0.2" />
        <stop offset="80%" stop-color=${color} stop-opacity="0.2" />
        <stop offset="100%" stop-color=${color} stop-opacity="0" />
      </linearGradient>
    </defs>
  `;

  return svg`
    ${gradient}
    <rect
      style="pointer-events: none;"
      x=${x1}
      width=${width}
      y=${y}
      height=${height}
      fill="url(#${gradientId})"
    />
  `;
}

const renderInteractiveArea = (params: {
  feature: RegulatoryFeature;
  regionName: string;
  offsetTop: number;
  scale: ScaleLinear<number, number>;
}) => {
  const { feature, regionName, offsetTop, scale } = params;
  const genomicStart = feature.extended_start ?? feature.start;
  const genomicEnd = feature.extended_end ?? feature.end;
  const x1 = scale(toZeroBased(genomicStart));
  const x2 = scale(genomicEnd);
  const width = Math.max(x2 - x1, 2);

  const height = REGULATORY_FEATURE_CORE_HEIGHT * 2;
  const verticalMidline = offsetTop + REGULATORY_FEATURE_CORE_HEIGHT / 2;
  const y = verticalMidline - height / 2;

  return svg`
    <rect
      data-feature-type="regulatory-feature"
      data-feature=${JSON.stringify(prepareFeatureInfo({feature, regionName }))}
      class="interactive-area"
      x=${x1}
      width=${width}
      y=${y}
      height=${height}
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
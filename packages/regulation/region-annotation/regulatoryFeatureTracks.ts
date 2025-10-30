import { svg } from 'lit';
import type { ScaleLinear } from 'd3';

import {
  REGULATORY_FEATURE_TRACK_HEIGHT,
  REGULATORY_FEATURE_CORE_HEIGHT,
  REGULATORY_FEATURE_EXTENT_HEIGHT
} from './constants';

import type { RegulatoryFeature } from '../types/regionOverview';
import type { InputData } from '../types/inputData';


export const renderRegulatoryFeatureTracks = ({
  tracks,
  featureTypes,
  scale,
  offsetTop
}: {
  tracks: RegulatoryFeature[][];
  featureTypes: InputData['regulatory_feature_types'];
  scale: ScaleLinear<number, number>;
  offsetTop: number;
}) => {
  return svg`
    <g>
      ${tracks.map((track, index) => renderTrack({
        track,
        featureTypes,
        scale,
        offsetTop: offsetTop + index * REGULATORY_FEATURE_TRACK_HEIGHT
      }))}
    </g>
  `;
};

const renderTrack = ({
  track,
  featureTypes,
  scale,
  offsetTop
}: {
  track: RegulatoryFeature[];
  featureTypes: InputData['regulatory_feature_types'];
  scale: ScaleLinear<number, number>;
  offsetTop: number;
}) => {
  const featureElements = track.map((feature, index) => {
    const prevFeature = index > 0 ? track[index - 1] : null;

    const featureGenomicStart = feature.extended_start ?? feature.start;
    const featureGenomicEnd = feature.extended_end ?? feature.end;
    const featureStart = scale(featureGenomicStart);
    const featureEnd = scale(featureGenomicEnd);

    const prevFeatureGenomicStart =
      prevFeature?.extended_start ?? prevFeature?.start;
    const prevFeatureGenomicEnd = prevFeature?.extended_end ?? prevFeature?.end;
    const prevFeatureStart = prevFeatureGenomicStart
      ? scale(prevFeatureGenomicStart)
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
      scale
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
  scale: ScaleLinear<number, number>;
}) => {
  return svg`
    <g>
      ${renderBoundsRegion({...params, side: 'left'})}
      ${renderCoreRegion(params)}
      ${renderBoundsRegion({...params, side: 'right'})}
    </g>
  `;
};

const renderCoreRegion = ({
  feature,
  featureTypes,
  scale,
  offsetTop
}: {
  feature: RegulatoryFeature;
  featureTypes: InputData['regulatory_feature_types'];
  offsetTop: number;
  scale: ScaleLinear<number, number>;
}) => {
  const x1 = scale(feature.start);
  const x2 = scale(feature.end);
  const width = Math.max(x2 - x1, 2);
  const color = featureTypes[feature.feature_type].color;

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
  featureTypes,
  scale,
  offsetTop,
  side
}: {
  feature: RegulatoryFeature;
  featureTypes: InputData['regulatory_feature_types'];
  offsetTop: number;
  scale: ScaleLinear<number, number>;
  side: 'left' | 'right';
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

  const extentX = scale(extentCoordinate);
  const width =
    side === 'left'
      ? scale(feature.start) - extentX
      : extentX - scale(feature.end);

  if (width <= 0) {
    return null;
  }

  const start = side === 'left' ? extentX : scale(feature.end);
  const color = featureTypes[feature.feature_type].color;

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
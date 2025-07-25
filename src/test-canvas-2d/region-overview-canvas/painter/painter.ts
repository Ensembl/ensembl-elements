import type { ScaleLinear } from 'd3';

import {
  GENE_TRACKS_TOP_OFFSET,
  GENE_HEIGHT,
  GENE_TRACK_HEIGHT,
  REGULATORY_FEATURE_TRACKS_TOP_OFFSET,
  REGULATORY_FEATURE_HEIGHT,
  REGULATORY_FEATURE_CORE_HEIGHT,
  REGULATORY_FEATURE_EXTENT_HEIGHT,
  REGULATORY_FEATURE_TRACK_HEIGHT
} from '../constants';

import prepareFeatureTracks, { type GeneTrack } from './prepareTracks';

import type { RegionOverviewData } from '../regionOverviewCanvas';
import type { RegulatoryFeature, RegulatoryFeatureMetadata } from '../../../shared/types/regionOverview';

type Params = {
  canvas: HTMLCanvasElement;
  scale: ScaleLinear<number, number>;
  data: RegionOverviewData;
};

type Intron = {
  start: number;
  end: number;
};

const paintCanvas = (params: Params) => {
  const { canvas, scale, data } = params;

  const { geneTracks, regulatoryFeatureTracks } = prepareFeatureTracks({ data });

  const canvas2DContext = canvas.getContext('2d');
  canvas2DContext.reset();

  const { offsetTop: offsetTopAfterGeneTracks } = paintGeneTracks({
    tracks: geneTracks,
    scale,
    canvasContext: canvas2DContext
  });

  paintRegFeatureTracks({
    tracks: regulatoryFeatureTracks,
    scale,
    canvasContext: canvas2DContext,
    offsetTop: offsetTopAfterGeneTracks,
    featureTypeMap: data.regulatory_feature_types
  });

  // for (const gene of [genes[0]]) {
  //   const x = scale(gene.start);
  //   const y = GENE_TRACKS_TOP_OFFSET;
  //   const width = scale(gene.end) - scale(gene.start);
  //   const height = GENE_HEIGHT;

  //   canvas2DContext.beginPath(); // Start a new path
  //   canvas2DContext.rect(x, y, width, height);
  //   canvas2DContext.fill(); // Render the path
  // }
};

const paintGeneTracks = ({
  tracks,
  scale,
  canvasContext
}: {
  tracks: ReturnType<typeof prepareFeatureTracks>['geneTracks'];
  scale: ScaleLinear<number, number>;
  canvasContext: CanvasRenderingContext2D;
}) => {
  const { forwardStrandTracks, reverseStrandTracks } = tracks;
  let tempY = GENE_TRACKS_TOP_OFFSET; // keep track of the y coordinate for subsequent shapes to be drawn

  // Forward strand genes above the central line should stack upwards
  for (let i = 0; i < forwardStrandTracks.length; i++) {
    const track = forwardStrandTracks[i];
    const offsetTop = GENE_TRACKS_TOP_OFFSET + GENE_TRACK_HEIGHT * (forwardStrandTracks.length - 1);
    paintGeneTrack({
      track,
      scale,
      canvasContext,
      offsetTop
    });
  }

  tempY = tempY + forwardStrandTracks.length * GENE_TRACK_HEIGHT;

  const strandDividerY = tempY + 0.5 * GENE_TRACK_HEIGHT;
  tempY = strandDividerY + GENE_TRACK_HEIGHT;

  for (let i = 0; i < reverseStrandTracks.length; i++) {
    const track = reverseStrandTracks[i];
    const offsetTop = tempY;
    tempY += GENE_TRACK_HEIGHT;

    paintGeneTrack({
      track,
      scale,
      canvasContext,
      offsetTop
    }); 
  }

  tempY += GENE_TRACK_HEIGHT;

  // === by this point, tempY should be the y-coordinate of the bottom gene track
  return {
    offsetTop: tempY
  };
};


const paintGeneTrack = ({
  track,
  scale,
  canvasContext,
  offsetTop
}: {
  track: GeneTrack;
  scale: ScaleLinear<number, number>;
  canvasContext: CanvasRenderingContext2D;
  offsetTop: number;
}) => {
  for (const gene of track) {
    paintGene({
      gene,
      scale,
      canvasContext,
      offsetTop
    });
  }
};

const paintGene = ({
  gene,
  scale,
  canvasContext,
  offsetTop
}: {
  gene: GeneTrack[number];
  scale: ScaleLinear<number, number>;
  canvasContext: CanvasRenderingContext2D;
  offsetTop: number;
}) => {
  const [ genomicStart, genomicEnd ] = scale.domain();

  if (genomicEnd - genomicStart > 1_000_000) {
    const x = scale(gene.data.start);
    const y = offsetTop;
    const width = scale(gene.data.end) - scale(gene.data.start);
    const height = GENE_HEIGHT;

    if (canvasContext.fillStyle !== 'blue') {
      canvasContext.fillStyle = 'blue';
    }
    canvasContext.fillRect(x, y, width, height);


    return
  }

  const { merged_exons } = gene.data;

  // canvasContext.beginPath(); // Start a new path

  for (const exon of merged_exons) {
    const x = scale(exon.start);
    const width = scale(exon.end) - scale(exon.start);
    const y = offsetTop;
    const height = GENE_HEIGHT;

    if (canvasContext.strokeStyle !== 'blue') {
      canvasContext.strokeStyle = 'blue';
    }

    canvasContext.strokeRect(x, y, width, height);
  }

  for (let i = 1; i < merged_exons.length; i++) {
    const prevExon = merged_exons[i - 1];
    const currentExon = merged_exons[i];
    const start = prevExon.end;
    const end = currentExon.start;
    const x = scale(start);
    const width = scale(end) - scale(start);
    const intronHeight = 1 * devicePixelRatio; // FIXME: might want to import it as constant
    const y = offsetTop + GENE_HEIGHT / 2 - intronHeight / 2;

    if (canvasContext.fillStyle !== 'blue') {
      canvasContext.fillStyle = 'blue';
    }

    canvasContext.fillRect(x, y, width, intronHeight);
  }

  canvasContext.fillText(gene.data.stable_id, scale(gene.data.end), offsetTop)

  // canvasContext.fill(); // Render the path
}


const paintRegFeatureTracks = ({
  tracks,
  scale,
  canvasContext,
  offsetTop,
  featureTypeMap
}: {
  tracks: ReturnType<typeof prepareFeatureTracks>['regulatoryFeatureTracks'];
  scale: ScaleLinear<number, number>;
  canvasContext: CanvasRenderingContext2D;
  offsetTop: number;
  featureTypeMap: Record<string, RegulatoryFeatureMetadata>;
}) => {
  for (let i = 0; i < tracks.length; i++) {
    const track = tracks[i];
    paintRegFeatureTrack({
      track,
      scale,
      canvasContext,
      offsetTop: offsetTop + REGULATORY_FEATURE_TRACK_HEIGHT * i,
      featureTypeMap
    })
  }

};

const paintRegFeatureTrack = ({
  track,
  scale,
  canvasContext,
  offsetTop,
  featureTypeMap
}: {
  track: RegulatoryFeature[];
  scale: ScaleLinear<number, number>;
  canvasContext: CanvasRenderingContext2D;
  offsetTop: number;
  featureTypeMap: Record<string, RegulatoryFeatureMetadata>;
}) => {
  for (let i = 0; i < track.length; i++) {
    const feature = track[i];
    const prevFeature = track[i - 1];

    const x = scale(feature.start);
    const y = offsetTop;
    const width = Math.min(scale(feature.end) - scale(feature.start));
    const height = REGULATORY_FEATURE_HEIGHT;

    const prevFeatureX = prevFeature
      ? scale(prevFeature.start)
      : 0;
    const prevFeatureWidth = prevFeature
      ? Math.min(scale(prevFeature.end) - scale(prevFeature.start))
      : 0;

    if (x === prevFeatureX && width === prevFeatureWidth) {
      continue;
    }

    const featureColor = featureTypeMap[feature.feature_type].color;

    if (canvasContext.fillStyle !== featureColor) {
      canvasContext.fillStyle = featureColor;
    }

    // FIXME: this could be improved by just adding rects to a path
    canvasContext.fillRect(x, y, width, height);
  }
};

export default paintCanvas;

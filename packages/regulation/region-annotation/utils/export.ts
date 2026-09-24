/**
 * This file contains generic download logic, which should probably be moved
 * to the helpers package
 */

const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';
const ENSEMBL_FONT_FAMILY = 'IBM Plex Mono';

export type SVGExportTo =
  | 'string'
  | 'element';

export const exportAsSvg = async ({
  svgSource,
  exportTo = 'element'
}: {
  svgSource: SVGSVGElement;
  exportTo?: SVGExportTo; // whether the exported svg needs to be serialized to string
}) => {
  const svgClone = svgSource.cloneNode(true) as HTMLElement;

  // Get and embed the appropriate font
  await embedEnsemblFont(svgClone);

  // Remove crud
  // - remove dedicated transparent rectangles that are used as interactive areas
  svgClone.querySelectorAll('rect.interactive-area')
    .forEach(element => element.remove());
  
  // - remove the comment nodes that Lit peppers the DOM with
  removeCommentNodesFromSvg(svgClone);

  // Make sure that anything that still has a "fill=transparent" on it
  // uses "fill=none" instead ("fill=transparent" doesn't play nice with graphics software)
  svgClone.querySelectorAll('[fill="transparent"]').forEach(element => {
    element.setAttribute('fill', 'none');
  });

  // Return the result (as a DOM element or a string depending on the passed options)
  if (exportTo === 'string') {
    // serialize the DOM element to a string
    return new XMLSerializer().serializeToString(svgClone);
  } else {
    // return the svg element itself
    return svgClone;
  }
};

const embedEnsemblFont = async (svgElement: HTMLElement) => {
  const fontFamily = ENSEMBL_FONT_FAMILY;
  const fontFileBlob = await fetchFontFile(fontFamily);

  let fontFileDataUrl: string | undefined;
  if (fontFileBlob) {
    fontFileDataUrl = await blobToDataUrl(fontFileBlob);
  }

  if (fontFileDataUrl) {
    const styleTag = createStyleTagForFont({ fontFamily, base64Font: fontFileDataUrl });
    let defs = (svgElement as HTMLElement).querySelector('defs');
    
    if (!defs) {
      defs = document.createElementNS(SVG_NAMESPACE, 'defs');
      svgElement.insertBefore(defs, svgElement.firstChild);
    }
    defs.appendChild(styleTag);
  }
};

const fetchFontFile = async (fontFamily: string) => {
  const documentStylesheetRules = [...Object.values(document.styleSheets)]
    .flatMap(sheet => {
      return [...Object.values(sheet.cssRules)];
    });
  const fontRule = documentStylesheetRules.find(rule => {
    return rule.constructor.name === "CSSFontFaceRule" &&
    (rule as CSSFontFaceRule).style.fontFamily.includes(fontFamily);
  });
  
  if (!fontRule) {
    return;
  }

  const fontSourceFromCSS = (fontRule as CSSFontFaceRule).style.getPropertyValue('src');
  const fontUrlRegex = /url\(["']?([^"']+)["']?\)/;
  const fontUrl = fontSourceFromCSS.match(fontUrlRegex)?.[1];

  if (!fontUrl) {
    return;
  }

  try {
    const response = await fetch(fontUrl);
    const blob = await response.blob();
    return blob;
  } catch {
    return;
  }
};

const blobToDataUrl = async (blob: Blob) => {
  const reader = new FileReader();
  const promise = new Promise((resolve, reject) => {
    reader.onload = resolve;
    reader.onerror = reject;
  });

  reader.readAsDataURL(blob);
  try {
    await promise;
    return reader.result as string;
  } catch {
    return;
  }
};

/** Remove Lit comment nodes */
const removeCommentNodesFromSvg = (root: Node) => {
  const walker = document.createTreeWalker(
    root,
    NodeFilter.SHOW_COMMENT,
    null
  );

  const nodesToRemove = [];
  while (walker.nextNode()) {
    nodesToRemove.push(walker.currentNode);
  }

  // Remove nodes after walking to avoid traversal issues
  nodesToRemove.forEach(node => (node as HTMLElement).remove());
};

const createStyleTagForFont = ({
  fontFamily,
  base64Font
}: {
  fontFamily: string;
  base64Font: string;
}) => {
  const style = document.createElementNS('http://www.w3.org/2000/svg', 'style');
  style.textContent = `
    @font-face {
      font-family: '${fontFamily}';
      src: url('${base64Font}') format('woff2');
    }
    text { font-family: '${fontFamily}'; }
  `;

  return style;
};

export const exportAsBitmap = async (svgElement: SVGSVGElement) => {
  const svgClone = svgElement.cloneNode(true);

  const fontFamily = 'IBM Plex Mono';
  const fontFileBlob = await fetchFontFile(fontFamily);

  let fontFileDataUrl: string | undefined;
  if (fontFileBlob) {
    fontFileDataUrl = await blobToDataUrl(fontFileBlob);
  }

  if (fontFileDataUrl) {
    const styleTag = createStyleTagForFont({ fontFamily, base64Font: fontFileDataUrl });
    let defs = (svgClone as HTMLElement).querySelector('defs');
    
    if (!defs) {
      defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
      svgClone.insertBefore(defs, svgClone.firstChild);
    }
    defs.appendChild(styleTag);
  }

  const scaleFactor = 3;

  const svgData = new XMLSerializer().serializeToString(svgClone);
  const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  const svgBlobDataUrl = URL.createObjectURL(svgBlob);

  const img = new Image();
  const imageLoadPromise = new Promise(resolve => {
    img.onload = resolve;
  });
  img.src = svgBlobDataUrl;

  await imageLoadPromise;

  const canvas = document.createElement('canvas');
  canvas.width = svgElement.clientWidth * scaleFactor;
  canvas.height = svgElement.clientHeight * scaleFactor;
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
  
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0);

  return canvas;
};


export const downloadSvgString = ({
  svgString,
  fileName = 'image.svg'
}: {
  svgString: string;
  fileName?: string;
}) => {
  const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
};

export const downloadPng = ({
  canvas,
  fileName = 'image.png'
}: {
  canvas: HTMLCanvasElement;
  fileName?: string;
}) => {
  const pngDataUrl = canvas.toDataURL('image/png');

  const downloadLink = document.createElement('a');
  downloadLink.href = pngDataUrl;
  downloadLink.download = fileName;
  downloadLink.click();

  // cleanup
  URL.revokeObjectURL(pngDataUrl);
};
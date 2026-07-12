/**
 * This files contains generic download logic, which should probably be moved
 * to the helpers package
 */

const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';

export const downloadAsSvg = async (svgElement: SVGSVGElement) => {
  const svgClone = svgElement.cloneNode(true) as HTMLElement;

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
      defs = document.createElementNS(SVG_NAMESPACE, 'defs');
      svgClone.insertBefore(defs, svgClone.firstChild);
    }
    defs.appendChild(styleTag);
  }

  svgClone.style.setProperty('overflow', 'hidden');
  svgClone.style.setProperty('width', `${svgElement.clientWidth}px`);

  svgClone.querySelectorAll('rect.interactive-area').forEach(element => element.remove());

  removeCommentNodesFromSvg(svgClone);

  svgClone.querySelectorAll('[fill="transparent"]').forEach(element => {
    element.setAttribute('fill', 'none');
  });

  addClipPath(svgClone as unknown as SVGSVGElement);

  const svgData = new XMLSerializer().serializeToString(svgClone);
  const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'image.svg';
  link.click();
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

const addClipPath = (svg: SVGSVGElement) => {
  // Determine viewport size
  const width = svg.viewBox.baseVal.width;
  const height = svg.viewBox.baseVal.height;

  let defs = svg.querySelector('defs');
  if (!defs) {
    defs = document.createElementNS(SVG_NAMESPACE, 'defs');
    svg.insertBefore(defs, svg.firstChild);
  }

  const clipId = 'clip-viewport-size';

  const clipPath = document.createElementNS(SVG_NAMESPACE, 'clipPath');
  clipPath.setAttribute('id', clipId);

  const rect = document.createElementNS(SVG_NAMESPACE, 'rect');
  rect.setAttribute('x', '0');
  rect.setAttribute('y', '0');
  rect.setAttribute('width', `${width}`);
  rect.setAttribute('height', `${height}`);

  clipPath.appendChild(rect);
  defs.appendChild(clipPath);

  // Create wrapper group
  const g = document.createElementNS(SVG_NAMESPACE, 'g');
  g.setAttribute('clip-path', `url(#${clipId})`);

  // Move all children except <defs> into the group
  [...svg.childNodes].forEach(node => {
    if (node !== defs) {
      g.appendChild(node);
    }
  });

  svg.appendChild(g);
};


export const downloadAsPng = async (svgElement: SVGSVGElement) => {
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
  
  const pngDataUrl = canvas.toDataURL('image/png');

  const downloadLink = document.createElement('a');
  downloadLink.href = pngDataUrl;
  downloadLink.download = 'image.png';
  downloadLink.click();

  // Cleanup
  URL.revokeObjectURL(pngDataUrl);
};
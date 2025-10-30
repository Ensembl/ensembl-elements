import '@ensembl/ensembl-elements-common/styles/resets.css';
import '@ensembl/ensembl-elements-common/styles/fonts.css';
import '@ensembl/ensembl-elements-common/styles/global.css';
import '@ensembl/ensembl-elements-common/styles/custom-properties.css';

import './regulation/regulationPlayground';

// console.log('RegionOverview', RegionOverview);
// console.log('dataStore', dataStore);

// import '../../src/home/homePage';
// import '../../src/test-svg/svgTestPage';
// import '../../src/test-canvas-2d/canvasTestPage';

// const url = new URL(window.location.href);

const documentBody = document.body;
documentBody.innerHTML = '<regulation-playground></regulation-playground>';

// if (url.pathname === '/test-svg') {
//   documentBody.innerHTML = '<svg-test-page></svg-test-page>'
// } else if (url.pathname === '/test-canvas') {
//   documentBody.innerHTML = '<canvas-test-page></canvas-test-page>'
// } else {
//   documentBody.innerHTML = '<home-page></home-page>'
// }

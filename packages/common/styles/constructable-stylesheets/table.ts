import resetStylesString from '../table.css?raw';

const resetStyles = new CSSStyleSheet();
resetStyles.replaceSync(resetStylesString);

export default resetStyles;
import resetStylesString from '../resets.css?raw';

const resetStyles = new CSSStyleSheet();
resetStyles.replaceSync(resetStylesString);

export default resetStyles;
import buttonResetStyles from '../button-resets.css?raw';

const resetStyles = new CSSStyleSheet();
resetStyles.replaceSync(buttonResetStyles);

export default resetStyles;
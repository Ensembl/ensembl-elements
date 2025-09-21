import visuallyHiddenStyles from '../visually-hidden.css?raw';

const resetStyles = new CSSStyleSheet();
resetStyles.replaceSync(visuallyHiddenStyles);

export default resetStyles;
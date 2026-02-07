import styles from './Icons.module.css';

import penSvg from './icons/pen.svg?raw';
import penToolSvg from './icons/pen-tool.svg?raw';
import markerSvg from './icons/marker.svg?raw';
import highlighterSvg from './icons/highlighter.svg?raw';
import eraserSvg from './icons/eraser.svg?raw';
import selectSvg from './icons/select.svg?raw';
import textSvg from './icons/text.svg?raw';
import paletteSvg from './icons/palette.svg?raw';
import highlightSvg from './icons/highlight.svg?raw';
import rulerSvg from './icons/ruler.svg?raw';
import undoSvg from './icons/undo.svg?raw';
import redoSvg from './icons/redo.svg?raw';
import cameraSvg from './icons/camera.svg?raw';
import alignLeftSvg from './icons/align-left.svg?raw';
import alignCenterSvg from './icons/align-center.svg?raw';
import alignRightSvg from './icons/align-right.svg?raw';
import formatSvg from './icons/format.svg?raw';
import helpSvg from './icons/help.svg?raw';
import darkSvg from './icons/dark.svg?raw';
import lightSvg from './icons/light.svg?raw';
import downSvg from './icons/down.svg?raw';

const sizeClass = (size) => (size === 'sm' ? styles.sizeSm : size === 'lg' ? styles.sizeLg : '');

const ICON_SVG_MAP = {
  pen: penSvg,
  penTool: penToolSvg,
  marker: markerSvg,
  highlighter: highlighterSvg,
  eraser: eraserSvg,
  select: selectSvg,
  text: textSvg,
  palette: paletteSvg,
  ruler: rulerSvg,
  undo: undoSvg,
  redo: redoSvg,
  camera: cameraSvg,
  alignLeft: alignLeftSvg,
  alignCenter: alignCenterSvg,
  alignRight: alignRightSvg,
  highlight: highlightSvg,
  format: formatSvg,
  help: helpSvg,
  dark: darkSvg,
  light: lightSvg,
  down: downSvg,
};

function IconWrapper({ svgContent, size, className = '', ...props }) {
  return (
    <span
      className={`${styles.icon} ${sizeClass(size)} ${className}`}
      role="img"
      aria-hidden
      dangerouslySetInnerHTML={{ __html: svgContent }}
      {...props}
    />
  );
}

export function IconPen(props) {
  return <IconWrapper svgContent={penSvg} {...props} />;
}
export function IconPenTool(props) {
  return <IconWrapper svgContent={penToolSvg} {...props} />;
}
export function IconMarker(props) {
  return <IconWrapper svgContent={markerSvg} {...props} />;
}
export function IconHighlighter(props) {
  return <IconWrapper svgContent={highlighterSvg} {...props} />;
}
export function IconEraser(props) {
  return <IconWrapper svgContent={eraserSvg} {...props} />;
}
export function IconSelect(props) {
  return <IconWrapper svgContent={selectSvg} {...props} />;
}
export function IconText(props) {
  return <IconWrapper svgContent={textSvg} {...props} />;
}
export function IconPalette(props) {
  return <IconWrapper svgContent={paletteSvg} {...props} />;
}
export function IconRuler(props) {
  return <IconWrapper svgContent={rulerSvg} {...props} />;
}
export function IconUndo(props) {
  return <IconWrapper svgContent={undoSvg} {...props} />;
}
export function IconRedo(props) {
  return <IconWrapper svgContent={redoSvg} {...props} />;
}
export function IconCamera(props) {
  return <IconWrapper svgContent={cameraSvg} {...props} />;
}
export function IconAlignLeft(props) {
  return <IconWrapper svgContent={alignLeftSvg} {...props} />;
}
export function IconAlignCenter(props) {
  return <IconWrapper svgContent={alignCenterSvg} {...props} />;
}
export function IconAlignRight(props) {
  return <IconWrapper svgContent={alignRightSvg} {...props} />;
}
export function IconHighlight(props) {
  return <IconWrapper svgContent={highlightSvg} {...props} />;
}
export function IconFormat(props) {
  return <IconWrapper svgContent={formatSvg} {...props} />;
}
export function IconHelp(props) {
  return <IconWrapper svgContent={helpSvg} {...props} />;
}
export function IconDark(props) {
  return <IconWrapper svgContent={darkSvg} {...props} />;
}
export function IconLight(props) {
  return <IconWrapper svgContent={lightSvg} {...props} />;
}
export function IconDown(props) {
  return <IconWrapper svgContent={downSvg} {...props} />;
}

/**
 * Render an icon by name. Use for tool/option configs.
 */
export function Icon({ name, size, className = '', ...props }) {
  const svgContent = ICON_SVG_MAP[name];
  if (!svgContent) return null;
  return <IconWrapper svgContent={svgContent} size={size} className={className} {...props} />;
}

export default Icon;

import React from 'react';
import { createPortal } from 'react-dom';
import styles from './BrushPalette.module.css';
import { Icon } from '@/components/Icons/index.js';
import { TOOL_KINDS, TOOL_OPTIONS, isDrawingTool } from '../../constants/tools';
import { STROKE_COLORS, getDefaultSwatchColor } from '../../constants/colors';
import { BRUSH_SIZES, getSwatchHeight } from '../../constants/sizes';

export default function BrushPalette({ theme, tool, onChange, onUndo, onRedo, onScreenshot }) {
  const [showSize, setShowSize] = React.useState(false);
  const [showStyle, setShowStyle] = React.useState(false);
  const [showColor, setShowColor] = React.useState(false);
  const [stylePos, setStylePos] = React.useState({ top: 0, left: 0 });
  const [sizePos, setSizePos] = React.useState({ top: 0, left: 0 });
  const [colorPos, setColorPos] = React.useState({ top: 0, left: 0 });
  const [customColor, setCustomColor] = React.useState('#6366f1');
  const paletteRef = React.useRef(null);
  const stylePopRef = React.useRef(null);
  const sizePopRef = React.useRef(null);
  const colorPopRef = React.useRef(null);
  const styleBtnRef = React.useRef(null);
  const sizeBtnRef = React.useRef(null);
  const colorBtnRef = React.useRef(null);
  const colorInputRef = React.useRef(null);
  const sizeId = 'menu-sizes';
  const styleId = 'menu-styles';
  const colorId = 'menu-colors';

  // Close menus when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (e) => {
      const isInsidePalette = paletteRef.current?.contains(e.target);
      const isInsideStylePop = stylePopRef.current?.contains(e.target);
      const isInsideSizePop = sizePopRef.current?.contains(e.target);
      const isInsideColorPop = colorPopRef.current?.contains(e.target);

      if (!isInsidePalette && !isInsideStylePop && !isInsideSizePop && !isInsideColorPop) {
        setShowStyle(false);
        setShowSize(false);
        setShowColor(false);
      }
    };

    document.addEventListener('pointerdown', handleClickOutside);
    return () => document.removeEventListener('pointerdown', handleClickOutside);
  }, []);

  const setSize = (px) => {
    onChange((prev) => ({ ...prev, size: px }));
    setShowSize(false);
  };
  const setKind = (k) => {
    onChange((prev) => ({ ...prev, kind: k }));
    setShowStyle(false);
  };
  const setColor = (css) => {
    onChange((prev) => ({ ...prev, color: css }));
    setShowColor(false);
  };

  const handleCustomColorClick = (e) => {
    e.stopPropagation();
    colorInputRef.current?.click();
  };

  const handleCustomColorChange = (e) => {
    e.stopPropagation();
    const newColor = e.target.value;
    setCustomColor(newColor);
    onChange((prev) => ({ ...prev, color: newColor }));
  };

  const isCustomColorActive =
    tool.color && !STROKE_COLORS.some((c) => c.css === tool.color) && tool.color !== undefined;

  const anchorFrom = (el, setPos) => {
    if (!el) return;
    const r = el.getBoundingClientRect();
    setPos({
      top: r.top + window.scrollY,
      left: r.right + window.scrollX + 8,
    });
  };

  const toggleStyle = () => {
    anchorFrom(styleBtnRef.current, setStylePos);
    setShowStyle((v) => !v);
    setShowSize(false);
    setShowColor(false);
  };
  const toggleSize = () => {
    anchorFrom(sizeBtnRef.current, setSizePos);
    setShowSize((v) => !v);
    setShowStyle(false);
    setShowColor(false);
  };
  const toggleColor = () => {
    anchorFrom(colorBtnRef.current, setColorPos);
    setShowColor((v) => !v);
    setShowStyle(false);
    setShowSize(false);
  };

  return (
    <div ref={paletteRef} className={styles.palette} role="toolbar" aria-label="Brush tools">
      <button
        className={`${styles.paletteBtn} ${tool.kind === TOOL_KINDS.SELECT ? styles.activeBtn : ''}`}
        onClick={() => onChange((prev) => ({ ...prev, kind: TOOL_KINDS.SELECT }))}
        aria-label="Select and move"
        title="Select and move"
      >
        <Icon name="select" />
      </button>

      <button
        className={`${styles.paletteBtn} ${tool.kind === TOOL_KINDS.TEXT ? styles.activeBtn : ''}`}
        onClick={() => onChange((prev) => ({ ...prev, kind: TOOL_KINDS.TEXT }))}
        aria-label="Add text"
        title="Add text"
      >
        <Icon name="text" />
      </button>

      <button
        ref={styleBtnRef}
        className={`${styles.paletteBtn} ${isDrawingTool(tool.kind) ? styles.activeBtn : ''}`}
        onClick={toggleStyle}
        aria-haspopup="menu"
        aria-expanded={showStyle}
        aria-controls={styleId}
        aria-label="Choose pen style"
        title="Choose pen style"
      >
        <Icon name="pen" />
      </button>

      <button
        ref={colorBtnRef}
        className={`${styles.paletteBtn} ${tool.color ? styles.activeBtn : ''}`}
        onClick={toggleColor}
        aria-haspopup="menu"
        aria-expanded={showColor}
        aria-controls={colorId}
        aria-label="Choose color"
        title="Choose color"
      >
        <Icon name="palette" />
      </button>

      <button
        ref={sizeBtnRef}
        className={`${styles.paletteBtn} ${isDrawingTool(tool.kind) ? styles.activeBtn : ''}`}
        onClick={toggleSize}
        aria-haspopup="menu"
        aria-expanded={showSize}
        aria-controls={sizeId}
        aria-label="Choose width"
        title="Choose width"
      >
        <Icon name="ruler" />
      </button>

      <button className={`${styles.paletteBtn} ${styles.historyBtn}`} onClick={onUndo} aria-label="Undo" title="Undo">
        <Icon name="undo" />
      </button>

      <button className={`${styles.paletteBtn} ${styles.historyBtn}`} onClick={onRedo} aria-label="Redo" title="Redo">
        <Icon name="redo" />
      </button>

      {onScreenshot && (
        <button
          className={styles.paletteBtn}
          onClick={onScreenshot}
          aria-label="Save canvas as image"
          title="Save canvas as image"
        >
          <Icon name="camera" />
        </button>
      )}

      {showStyle &&
        createPortal(
          <div
            ref={stylePopRef}
            id={styleId}
            role="menu"
            className={styles.palettePop}
            style={{ top: stylePos.top, left: stylePos.left }}
            aria-label="Brush style menu"
          >
            {TOOL_OPTIONS.map((o) => (
              <button
                key={o.key}
                role="menuitemradio"
                aria-checked={tool.kind === o.key}
                className={`${styles.paletteItem} ${tool.kind === o.key ? styles.active : ''}`}
                onClick={() => setKind(o.key)}
                title={o.label}
              >
                <span aria-hidden="true" className={styles.toolIcon}>
                  <Icon name={o.icon} />
                </span>
                {o.label}
              </button>
            ))}
          </div>,
          document.body
        )}

      {showSize &&
        createPortal(
          <div
            ref={sizePopRef}
            id={sizeId}
            role="menu"
            className={styles.palettePop}
            style={{ top: sizePos.top, left: sizePos.left }}
            aria-label="Pen width menu"
          >
            {BRUSH_SIZES.map((n) => (
              <button
                key={n}
                role="menuitemradio"
                aria-checked={tool.size === n}
                className={`${styles.paletteItem} ${tool.size === n ? styles.active : ''}`}
                onClick={() => setSize(n)}
                title={`${n}px`}
              >
                <span className={styles.swatch} style={{ height: getSwatchHeight(n), width: 28 }} />
                {n}px
              </button>
            ))}
          </div>,
          document.body
        )}

      {showColor &&
        createPortal(
          <div
            ref={colorPopRef}
            id={colorId}
            role="menu"
            className={styles.palettePop}
            style={{ top: colorPos.top, left: colorPos.left }}
            aria-label="Pen colors"
          >
            <button
              role="menuitemradio"
              aria-checked={tool.color == null}
              className={`${styles.paletteItem} ${styles.color} ${tool.color == null ? styles.active : ''}`}
              onClick={() => setColor(undefined)}
              title="Default"
            >
              <span
                className={styles.swatchDot}
                style={{ background: getDefaultSwatchColor(theme) }}
                aria-hidden="true"
              />
              Default
            </button>

            {STROKE_COLORS.map((c) => (
              <button
                key={c.name}
                role="menuitemradio"
                aria-checked={tool.color === c.css}
                className={`${styles.paletteItem} ${styles.color} ${tool.color === c.css ? styles.active : ''}`}
                onClick={() => setColor(c.css)}
                title={c.name}
              >
                <span className={styles.swatchDot} style={{ background: c.css }} aria-hidden="true" />
                {c.name}
              </button>
            ))}

            <div className={styles.colorDivider} />

            <button
              role="menuitemradio"
              aria-checked={isCustomColorActive}
              className={`${styles.paletteItem} ${styles.color} ${styles.customColor} ${isCustomColorActive ? styles.active : ''}`}
              onClick={handleCustomColorClick}
              title="Pick custom color"
            >
              <span
                className={`${styles.swatchDot} ${styles.customSwatch}`}
                style={{ background: isCustomColorActive ? tool.color : customColor }}
                aria-hidden="true"
              />
              Custom
              <input
                ref={colorInputRef}
                type="color"
                value={isCustomColorActive ? tool.color : customColor}
                onChange={handleCustomColorChange}
                className={styles.colorInput}
                aria-label="Pick custom color"
              />
            </button>
          </div>,
          document.body
        )}
    </div>
  );
}

import React, { useEffect } from 'react'
import { createPortal } from 'react-dom'
import styles from './BrushPalette.module.css'
import iro from '@jaames/iro'

export default function BrushPalette({ theme, tool, onChange, onUndo, onRedo }) {
  const [showSize, setShowSize] = React.useState(false)
  const [showStyle, setShowStyle] = React.useState(false)
  const [showColor, setShowColor] = React.useState(false)
  const [stylePos, setStylePos] = React.useState({ top: 0, left: 0 })
  const [sizePos, setSizePos] = React.useState({ top: 0, left: 0 })
  const [colorPos, setColorPos] = React.useState({ top: 0, left: 0 })
  const styleBtnRef = React.useRef(null)
  const sizeBtnRef = React.useRef(null)
  const colorBtnRef = React.useRef(null)
  const colorPickerRef = React.useRef(null)
  const iroRef = React.useRef(null)
  const sizeId = 'menu-sizes'
  const styleId = 'menu-styles'
  const colorId = 'menu-colors'

  const setSize = (px) => {
    onChange(prev => ({ ...prev, size: px }));
    setShowSize(false)
  }
  const setKind = (k) => {
    onChange(prev => ({ ...prev, kind: k }));
    setShowStyle(false)
  }

  const anchorFrom = (el, setPos) => {
    if (!el)
      return
    const r = el.getBoundingClientRect()
    setPos({
      top: r.top + window.scrollY,
      left: r.right + window.scrollX + 8
    })
  }

  const toggleStyle = () => {
    anchorFrom(styleBtnRef.current, setStylePos);
    setShowStyle(v => !v);
    setShowSize(false);
    setShowColor(false)
  }
  const toggleSize = () => {
    anchorFrom(sizeBtnRef.current, setSizePos);
    setShowSize(v => !v);
    setShowStyle(false);
    setShowColor(false)
  }
  const toggleColor = () => {
    anchorFrom(colorBtnRef.current, setColorPos);
    setShowColor(v => !v);
    setShowStyle(false);
    setShowSize(false)
  }

  useEffect(() => {
    if (!showColor) {
      if (iroRef.current) {
        iroRef.current.off('*')
        iroRef.current = null
      }
      return
    }
  
    if (!colorPickerRef.current) return
  
    iroRef.current = new iro.ColorPicker(colorPickerRef.current, {
      width: 180,
      color: tool.color || '#ffffff',
      layout: [
        { component: iro.ui.Wheel },
        { component: iro.ui.Slider, options: { sliderType: 'value' } }
      ]
    })
  
    iroRef.current.on('color:change', (color) => {
      onChange(prev => ({
        ...prev,
        color: color.hexString
      }))
    })
  }, [showColor])

  return (
    <div className={styles.palette} role="toolbar" aria-label="Brush tools">
      <button
        className={styles.paletteBtn}
        onClick={onUndo}
        title="Undo (Ctrl/Cmd+Z)"
        aria-label="Undo"
      >↩︎</button>
      <button
        className={styles.paletteBtn}
        onClick={onRedo}
        title="Redo (Ctrl/Cmd+Shift+Z)"
        aria-label="Redo"
      >↪︎</button>

      <button
        ref={colorBtnRef}
        className={styles.paletteBtn}
        onClick={toggleColor}
        aria-haspopup="menu"
        aria-expanded={showColor}
        aria-controls={colorId}
        title="Colors"
      >🌈</button>
      <button
        ref={styleBtnRef}
        className={styles.paletteBtn}
        onClick={toggleStyle}
        aria-haspopup="menu"
        aria-expanded={showStyle}
        aria-controls={styleId}
        title="Brush style"
      >🎨</button>
      <button
        ref={sizeBtnRef}
        className={styles.paletteBtn}
        onClick={toggleSize}
        aria-haspopup="menu"
        aria-expanded={showSize}
        aria-controls={sizeId}
        title="Pen width"
      >↕️</button>

      {showStyle && createPortal(
        <div
          id={styleId}
          role="menu"
          className={styles.palettePop}
          style={{ top: stylePos.top, left: stylePos.left }}
          aria-label="Brush style menu"
        >
          {[
            { key: 'pen', label: 'Pen', icon: '🖊' },
            { key: 'marker', label: 'Marker', icon: '🖍' },
            { key: 'highlighter', label: 'Highlighter', icon: '🖌' },
            { key: 'eraser', label: 'Eraser', icon: '⌫' }
          ].map(o => (
            <button
              key={o.key}
              role="menuitemradio"
              aria-checked={tool.kind === o.key}
              className={`${styles.paletteItem} ${tool.kind === o.key ? styles.active : ''}`}
              onClick={() => setKind(o.key)}
              title={o.label}
            >
              <span aria-hidden="true" style={{ marginRight: 6 }}>{o.icon}</span>
              {o.label}
            </button>
          ))}
        </div>,
        document.body
      )}

      {showSize && createPortal(
        <div
          id={sizeId}
          role="menu"
          className={styles.palettePop}
          style={{ top: sizePos.top, left: sizePos.left }}
          aria-label="Pen width menu"
        >
          {[1, 2, 4, 6, 8, 12, 16].map(n => (
            <button
              key={n}
              role="menuitemradio"
              aria-checked={tool.size === n}
              className={`${styles.paletteItem} ${tool.size === n ? styles.active : ''}`}
              onClick={() => setSize(n)}
              title={`${n}px`}
            >
              <span className={styles.swatch} style={{ height: Math.max(2, n), width: 28 }} />
              {n}px
            </button>
          ))}
        </div>,
        document.body)}

        {showColor && createPortal(
          <div
            id={colorId}
            role="menu"
            className={styles.palettePop}
            style={{ top: colorPos.top, left: colorPos.left }}
            aria-label="Color picker"
          >
            <div ref={colorPickerRef} />
          </div>,
          document.body
        )}

    </div>
  )
}

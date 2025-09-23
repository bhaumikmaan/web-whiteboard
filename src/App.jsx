import React from 'react'
import { createPortal } from 'react-dom'
import './App.css'

function App() {
  const [theme, setTheme] = React.useState(() =>
    (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light'
  )
  // Brush tool state
  const [tool, setTool] = React.useState({ kind: 'pen', size: 2 })
  React.useEffect(() => {
    if (!window.matchMedia) return
    const mql = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e) => setTheme(e.matches ? 'dark' : 'light')
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [])

  return (
    <div className={`App ${theme}`}>
      <CanvasWhiteboard theme={theme} tool={tool} />
      {/* Mid‑left brush palette */}
      <BrushPalette theme={theme} tool={tool} onChange={setTool} />
      {/* Desktop HUD (hidden on small screens via CSS) */}
      <div className="hud">
        <div className="panel">
          <strong>Controls</strong><br />
          Draw: 1‑finger drag • Pan: 2‑finger drag or Space+Left mouse • Zoom: Pinch or Wheel • Reset: Double‑tap / Double‑click
        </div>
      </div>
      {/* Mobile toaster (hidden on desktop via CSS) */}
      <Toaster
        theme={theme}
        onToggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
      />
      {/* Desktop theme toggle (hidden on mobile via CSS) */}
      <button
        className="theme-toggle"
        onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
        aria-label="Toggle color scheme"
        title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      >
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>
    </div>
  )
}

export default App

function CanvasWhiteboard({ theme, tool }) {
  const canvasRef = React.useRef(null)
  const ctxRef = React.useRef(null)
  const dprRef = React.useRef(1)
  const rafRef = React.useRef(0)
  const roRef = React.useRef(null)
  const lastTapRef = React.useRef({ t: 0, x: 0, y: 0 })

  const viewRef = React.useRef({
    panX: 0,
    panY: 0,
    scale: 1,
  })

  const stateRef = React.useRef({
    drawing: false,
    panning: false,
    spaceHeld: false,
    lastX: 0,
    lastY: 0,
    pointerId: null,
    pinch: null, // { id1, id2, startDist, startScale, startPanX, startPanY, originX, originY }
  })

  const strokesRef = React.useRef([])
  const themeColors = React.useMemo(
    () =>
      theme === 'dark'
        ? { bg: '#0f1115', grid: '#2a2f3a', stroke: '#e6e6e6' }
        : { bg: '#ffffff', grid: '#e6e6e6', stroke: '#222222' },
    [theme]
  )

  const screenToWorld = React.useCallback((sx, sy) => {
    const { panX, panY, scale } = viewRef.current
    const wx = (sx - panX) / scale
    const wy = (sy - panY) / scale
    return { x: wx, y: wy }
  }, [])

  const resizeCanvas = React.useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = window.devicePixelRatio || 1
    dprRef.current = dpr
    const rect = canvas.getBoundingClientRect()
    canvas.width = Math.max(1, Math.floor(rect.width * dpr))
    canvas.height = Math.max(1, Math.floor(rect.height * dpr))
    const ctx = canvas.getContext('2d')
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctxRef.current = ctx
  }, [])

  const draw = React.useCallback(() => {
    const canvas = canvasRef.current
    const ctx = ctxRef.current
    if (!canvas || !ctx) return
    const { panX, panY, scale } = viewRef.current
    // 1) Clear frame
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    // 2) Draw strokes (eraser works here and won’t touch the grid we’ll add later)
    ctx.save()
    ctx.translate(panX, panY)
    ctx.scale(scale, scale)
    for (const s of strokesRef.current) {
      if (!s.points.length) continue
      ctx.beginPath()
      // Apply per-stroke style
      ctx.lineJoin = s.join || 'round'
      ctx.lineCap = s.cap || 'round'
      ctx.strokeStyle = (s.mode === 'custom' && s.color) ? s.color : themeColors.stroke
      ctx.lineWidth = (s.size || 2) / Math.max(0.0001, scale)
      ctx.globalAlpha = s.alpha ?? 1
      ctx.globalCompositeOperation = s.erase ? 'destination-out' : 'source-over'
      const first = s.points[0]
      ctx.moveTo(first.x, first.y)
      for (let i = 1; i < s.points.length; i++) {
        const p = s.points[i]
        ctx.lineTo(p.x, p.y)
      }
      ctx.stroke()
      // Reset per-stroke
      ctx.globalAlpha = 1
      ctx.globalCompositeOperation = 'source-over'
    }
    ctx.restore()
    // 3) Paint grid and background behind existing content
    ctx.save()
    ctx.globalCompositeOperation = 'destination-over'
    // Grid under strokes (draw in world space) — draw this FIRST
    ctx.save()
    ctx.translate(panX, panY)
    ctx.scale(scale, scale)
    drawGrid(ctx, canvas, viewRef.current, themeColors)
    ctx.restore()
    // Background under strokes + grid — draw this SECOND
    ctx.fillStyle = themeColors.bg
    ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight)
    ctx.globalCompositeOperation = 'source-over'
    ctx.restore()
    rafRef.current = requestAnimationFrame(draw)
  }, [themeColors])

  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    resizeCanvas()
    rafRef.current = requestAnimationFrame(draw)

    const ro = new ResizeObserver(() => {
      resizeCanvas()
    })
    ro.observe(canvas)
    roRef.current = ro

    const onKeyDown = (e) => {
      if (e.code === 'Space') {
        e.preventDefault()
        stateRef.current.spaceHeld = true
        canvas.style.cursor = 'grabbing'
      }
    }
    const onKeyUp = (e) => {
      if (e.code === 'Space') {
        e.preventDefault()
        stateRef.current.spaceHeld = false
        if (!stateRef.current.panning) canvas.style.cursor = 'crosshair'
      }
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)

    const onWheelNative = (e) => {
      e.preventDefault() // stop page scroll/zoom
      const { panX, panY, scale } = viewRef.current
      const rect = canvas.getBoundingClientRect()
      const sx = e.clientX - rect.left
      const sy = e.clientY - rect.top
      const wx = (sx - panX) / scale
      const wy = (sy - panY) / scale

      // Heuristic: zoom only on ctrl+wheel (trackpad pinch), alt+wheel (manual),
      // or discrete mouse-like steps; otherwise treat as two-finger pan.
      const absX = Math.abs(e.deltaX)
      const absY = Math.abs(e.deltaY)
      const likelyMouseWheel = (e.deltaMode === 1) || (absY >= 120 && absX < 1)
      const forceZoom = e.altKey
      if (e.ctrlKey || forceZoom || likelyMouseWheel) {
        // Zoom toward cursor
        const factor = e.ctrlKey ? 1.02 : 1.0015
        const zoom = Math.pow(factor, -e.deltaY)
        const next = clamp(scale * zoom, 0.05, 20)
        viewRef.current.scale = next
        viewRef.current.panX = sx - wx * next
        viewRef.current.panY = sy - wy * next
      } else {
        // Two-finger scroll on trackpad => pan
        viewRef.current.panX -= e.deltaX
        viewRef.current.panY -= e.deltaY
      }
    }
    canvas.addEventListener('wheel', onWheelNative, { passive: false })
    const onPointerCancelDoc = () => {
      stateRef.current.pointerId = null
      stateRef.current.drawing = false
      stateRef.current.panning = false
      stateRef.current.pinch = null
    }
    document.addEventListener('pointercancel', onPointerCancelDoc)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      canvas.removeEventListener('wheel', onWheelNative)
      document.removeEventListener('pointercancel', onPointerCancelDoc)
      if (roRef.current) roRef.current.disconnect()
      cancelAnimationFrame(rafRef.current)
    }
  }, [resizeCanvas, draw])

  React.useEffect(() => {
    for (const s of strokesRef.current) {
      if (!s.mode) s.mode = 'theme'
    }
  }, [theme])

  const onPointerDown = (e) => {
    const canvas = canvasRef.current

    // Double‑tap detection
    if (e.pointerType === 'touch') {
      const now = performance.now()
      const dt = now - lastTapRef.current.t
      const dx = e.clientX - lastTapRef.current.x
      const dy = e.clientY - lastTapRef.current.y
      if (dt < 300 && (dx * dx + dy * dy) < 30 * 30) {
        viewRef.current.panX = 0
        viewRef.current.panY = 0
        viewRef.current.scale = 1
      }
      lastTapRef.current = { t: now, x: e.clientX, y: e.clientY }

      touchCache.set(e.pointerId, { x: e.clientX, y: e.clientY })
      if (touchCache.size === 2 && !stateRef.current.pinch) {
        const [a, b] = [...touchCache.values()]
        const startDist = Math.hypot(a.x - b.x, a.y - b.y)
        const rect = canvas.getBoundingClientRect()
        const originX = (a.x + b.x) / 2 - rect.left
        const originY = (a.y + b.y) / 2 - rect.top
        const [id1, id2] = [...touchCache.keys()]
        stateRef.current.pinch = {
          id1,
          id2,
          startDist,
          startScale: viewRef.current.scale,
          startPanX: viewRef.current.panX,
          startPanY: viewRef.current.panY,
          originX,
          originY,
        }
      }
    }

    const { spaceHeld } = stateRef.current
    const isMiddle = e.button === 1
    const panning = spaceHeld || isMiddle

    canvas.setPointerCapture(e.pointerId)
    stateRef.current.pointerId = e.pointerId
    stateRef.current.lastX = e.clientX
    stateRef.current.lastY = e.clientY
    stateRef.current.panning = panning
    stateRef.current.drawing = !panning && e.button === 0

    if (stateRef.current.panning) {
      canvas.style.cursor = 'grabbing'
      return
    }

    if (stateRef.current.drawing) {
      const { x, y } = screenToWorld(e.clientX, e.clientY)
      // Map current tool to stroke attributes
      const t = tool || { kind: 'pen', size: 2 }
      const stroke = {
        mode: 'theme',
        size: t.kind === 'marker' ? Math.max(4, t.size * 2) :
              t.kind === 'highlighter' ? Math.max(10, t.size * 6) :
              t.kind === 'eraser' ? Math.max(8, t.size * 6) : (t.size || 2),
        alpha: t.kind === 'highlighter' ? 0.28 : 1,
        erase: t.kind === 'eraser',
        cap: 'round',
        join: 'round',
        points: [{ x, y, p: e.pressure ?? 0.5 }],
      }
      strokesRef.current.push(stroke)
    }
  }

  const onPointerMove = (e) => {
    if (e.pointerType === 'touch') {
      if (touchCache.has(e.pointerId)) {
        touchCache.set(e.pointerId, { x: e.clientX, y: e.clientY })
      }

      const pinch = stateRef.current.pinch
      if (pinch) {
        const a = touchCache.get(pinch.id1)
        const b = touchCache.get(pinch.id2)
        if (a && b) {
          const dist = Math.hypot(a.x - b.x, a.y - b.y)
          const ratio = dist / Math.max(1e-3, pinch.startDist)
          const next = clamp(pinch.startScale * ratio, 0.05, 20)
          const { originX, originY } = pinch
          const wx = (originX - pinch.startPanX) / pinch.startScale
          const wy = (originY - pinch.startPanY) / pinch.startScale
          viewRef.current.scale = next
          viewRef.current.panX = originX - wx * next
          viewRef.current.panY = originY - wy * next
          return
        }
      }
    }

    if (stateRef.current.pointerId !== e.pointerId) return
    const dx = e.clientX - stateRef.current.lastX
    const dy = e.clientY - stateRef.current.lastY
    stateRef.current.lastX = e.clientX
    stateRef.current.lastY = e.clientY

    if (stateRef.current.panning) {
      viewRef.current.panX += dx
      viewRef.current.panY += dy
      return
    }

    if (stateRef.current.drawing) {
      const { x, y } = screenToWorld(e.clientX, e.clientY)
      const stroke = strokesRef.current[strokesRef.current.length - 1]
      if (stroke) stroke.points.push({ x, y, p: e.pressure ?? 0.5 })
      return
    }
  }

  const onPointerUp = (e) => {
    if (e.pointerType === 'touch') {
      touchCache.delete(e.pointerId)
      const pinch = stateRef.current.pinch
      if (pinch && (e.pointerId === pinch.id1 || e.pointerId === pinch.id2)) {
        stateRef.current.pinch = null
      }
    }

    if (stateRef.current.pointerId !== e.pointerId) return
    stateRef.current.pointerId = null
    if (stateRef.current.panning) {
      stateRef.current.panning = false
      if (!stateRef.current.spaceHeld) {
        canvasRef.current.style.cursor = 'crosshair'
      }
    }
    stateRef.current.drawing = false
  }

  const onWheel = (e) => {
    e.preventDefault()
    const { panX, panY, scale } = viewRef.current
    const rect = canvasRef.current.getBoundingClientRect()
    const sx = e.clientX - rect.left
    const sy = e.clientY - rect.top
    const wx = (sx - panX) / scale
    const wy = (sy - panY) / scale
    const factor = e.ctrlKey ? 1.02 : 1.0015
    const zoom = Math.pow(factor, -e.deltaY)
    const next = clamp(scale * zoom, 0.05, 20)
    viewRef.current.scale = next
    viewRef.current.panX = sx - wx * next
    viewRef.current.panY = sy - wy * next
  }

  const onDoubleClick = () => {
    viewRef.current.panX = 0
    viewRef.current.panY = 0
    viewRef.current.scale = 1
  }

  return (
    <canvas
      ref={canvasRef}
      className="board"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onDoubleClick={onDoubleClick}
      onPointerCancel={() => {
        stateRef.current.pointerId = null
        stateRef.current.drawing = false
        stateRef.current.panning = false
        stateRef.current.pinch = null
      }}
    />
  )
}

const touchCache = new Map()

function drawGrid(ctx, canvas, view, themeColors) {
  const grid = 100
  const w = canvas.clientWidth
  const h = canvas.clientHeight
  const left = (-view.panX) / view.scale
  const top = (-view.panY) / view.scale
  const right = left + w / view.scale
  const bottom = top + h / view.scale

  ctx.save()
  ctx.lineWidth = 1 / Math.max(0.0001, view.scale)
  ctx.strokeStyle = themeColors.grid
  ctx.beginPath()
  const startX = Math.floor(left / grid) * grid
  const endX = Math.ceil(right / grid) * grid
  const startY = Math.floor(top / grid) * grid
  const endY = Math.ceil(bottom / grid) * grid
  for (let x = startX; x <= endX; x += grid) {
    ctx.moveTo(x, startY)
    ctx.lineTo(x, endY)
  }
  for (let y = startY; y <= endY; y += grid) {
    ctx.moveTo(startX, y)
    ctx.lineTo(endX, y)
  }
  ctx.stroke()
  ctx.restore()
}

function clamp(v, a, b) {
  return Math.min(b, Math.max(a, v))
}

function isLikelyMouseWheel(e) {
  // Retained for compatibility if referenced elsewhere; use stricter threshold.
  if (e.deltaMode === 1) return true
  const ax = Math.abs(e.deltaX), ay = Math.abs(e.deltaY)
  return ax < 1 && ay >= 120
}
function Toaster({ theme, onToggleTheme }) {
  const [open, setOpen] = React.useState(false)
  return (
    <>
      <button
        className="toaster-toggle"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="wb-toaster"
        title={open ? 'Close menu' : 'Open menu'}
      >
        ⋯
      </button>
      <div id="wb-toaster" className={`toaster ${open ? 'open' : ''}`}>
        <div className="toaster-content">
          <div className="toaster-row">
            <span className="toaster-title">Whiteboard</span>
            <button className="chip" onClick={onToggleTheme} aria-label="Toggle color scheme">
              {theme === 'dark' ? '☀️ Light mode' : '🌙 Dark mode'}
            </button>
          </div>
          <div className="toaster-help">
            Draw: 1‑finger drag • Pan: 2‑finger drag • Zoom: Pinch • Reset: Double‑tap
          </div>
        </div>
      </div>
    </>
  )
}


// Mid-left brush palette
function BrushPalette({ theme, tool, onChange }) {
  const [showSize, setShowSize] = React.useState(false)
  const [showStyle, setShowStyle] = React.useState(false)
  const [stylePos, setStylePos] = React.useState({ top: 0, left: 0 })
  const [sizePos, setSizePos] = React.useState({ top: 0, left: 0 })
  const styleBtnRef = React.useRef(null)
  const sizeBtnRef = React.useRef(null)
  const sizeId = 'menu-sizes'
  const styleId = 'menu-styles'


  const setSize = (px) => {
    onChange({ kind: tool.kind || 'pen', size: px })
    setShowSize(false)
  }
  const setKind = (k) => {
    onChange({ kind: k, size: tool.size || 2 })
    setShowStyle(false)
  }
  const toggleStyle = () => {
    const el = styleBtnRef.current
    if (el) {
      const r = el.getBoundingClientRect()           // viewport coords [web:350]
      setStylePos({
        top: r.top + window.scrollY,                  // add scroll offset [web:358]
        left: r.right + window.scrollX + 8            // add scroll offset [web:355]
      })
    }
    setShowStyle(v => !v)
    setShowSize(false)
  }
  const toggleSize = () => {
    const el = sizeBtnRef.current
    if (el) {
      const r = el.getBoundingClientRect()           // viewport coords [web:350]
      setSizePos({
        top: r.top + window.scrollY,                  // add scroll offset [web:358]
        left: r.right + window.scrollX + 8            // add scroll offset [web:355]
      })
    }
    setShowSize(v => !v)
    setShowStyle(false)
  }


  return (
    <div className="palette" role="toolbar" aria-label="Brush tools">
      <button
        ref={styleBtnRef}
        className="palette-btn"
        onClick={toggleStyle}
        aria-haspopup="menu"
        aria-expanded={showStyle}
        aria-controls={styleId}
        title="Brush style"
      >🎨</button>


      <button
        ref={sizeBtnRef}
        className="palette-btn"
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
          className="palette-pop"
          style={{ top: stylePos.top, left: stylePos.left }}  // exact anchor point [web:350]
          aria-label="Brush style menu"
        >
          {[
            { key: 'pen', label: 'Pen', icon: '🖊' },
            { key: 'marker', label: 'Marker', icon: '🖍' },
            { key: 'highlighter', label: 'Highlighter', icon: '🖌' },
            { key: 'eraser', label: 'Eraser', icon: '⌫' },
          ].map(o => (
            <button
              key={o.key}
              role="menuitemradio"
              aria-checked={tool.kind === o.key}
              className={`palette-item ${tool.kind === o.key ? 'active' : ''}`}
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
          className="palette-pop"
          style={{ top: sizePos.top, left: sizePos.left }}     // no extra transform [web:350]
          aria-label="Pen width menu"
        >
          {[1, 2, 4, 6, 8, 12, 16].map(n => (
            <button
              key={n}
              role="menuitemradio"
              aria-checked={tool.size === n}
              className={`palette-item ${tool.size === n ? 'active' : ''}`}
              onClick={() => setSize(n)}
              title={`${n}px`}
            >
              <span className="swatch" style={{ height: Math.max(2, n), width: 28 }} />
              {n}px
            </button>
          ))}
        </div>,
        document.body
      )}
    </div>
  )
}

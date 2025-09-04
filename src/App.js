import React from 'react'
import './App.css'

function App() {
  return (
    <div className="App">
      <CanvasWhiteboard />
      <div className="hud">
        <div className="panel">
          <strong>Controls</strong><br/>
          Draw: Left mouse drag • Pan: Hold Space or Middle mouse • Zoom: Wheel • Reset: Double‑click background
        </div>
      </div>
    </div>
  )
}

export default App

function CanvasWhiteboard() {
  const canvasRef = React.useRef(null)
  const ctxRef = React.useRef(null)
  const dprRef = React.useRef(1)
  const rafRef = React.useRef(0)
  const roRef = React.useRef(null)

  // View transform (screen = translate + scale * world)
  const viewRef = React.useRef({
    panX: 0,
    panY: 0,
    scale: 1,
  })

  // Interaction state
  const stateRef = React.useRef({
    drawing: false,
    panning: false,
    spaceHeld: false,
    lastX: 0,
    lastY: 0,
    pointerId: null,
  })

  // Scene data: an array of freehand strokes, each with world-space points
  const strokesRef = React.useRef([]) // [{ color, size, points: [{x,y,p}] }]

  // Helpers to convert between screen and world coordinates
  const screenToWorld = React.useCallback((sx, sy) => {
    const { panX, panY, scale } = viewRef.current
    const wx = (sx - panX) / scale
    const wy = (sy - panY) / scale
    return { x: wx, y: wy }
  }, [])

  // Resize/upscale canvas for crisp rendering on HiDPI displays
  const resizeCanvas = React.useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = window.devicePixelRatio || 1
    dprRef.current = dpr
    const rect = canvas.getBoundingClientRect()
    canvas.width = Math.max(1, Math.floor(rect.width * dpr))
    canvas.height = Math.max(1, Math.floor(rect.height * dpr))
    const ctx = canvas.getContext('2d')
    // Normalize to CSS pixels so drawing math can use CSS coords
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctxRef.current = ctx
  }, [])

  // Main draw loop
  const draw = React.useCallback(() => {
    const canvas = canvasRef.current
    const ctx = ctxRef.current
    if (!canvas || !ctx) return
    const { panX, panY, scale } = viewRef.current

    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // World transform
    ctx.save()
    ctx.translate(panX, panY)
    ctx.scale(scale, scale)

    // Background grid in world units
    drawGrid(ctx, canvas, viewRef.current)

    // Draw strokes (line width inversely scales to keep constant on screen)
    for (const s of strokesRef.current) {
      if (!s.points.length) continue
      ctx.beginPath()
      ctx.lineJoin = 'round'
      ctx.lineCap = 'round'
      ctx.strokeStyle = s.color || '#222'
      ctx.lineWidth = (s.size || 2) / Math.max(0.0001, scale)
      const first = s.points
      ctx.moveTo(first.x, first.y)
      for (let i = 1; i < s.points.length; i++) {
        const p = s.points[i]
        ctx.lineTo(p.x, p.y)
      }
      ctx.stroke()
    }

    ctx.restore()
    rafRef.current = requestAnimationFrame(draw)
  }, [])

  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    resizeCanvas()
    rafRef.current = requestAnimationFrame(draw)

    // Observe element size
    const ro = new ResizeObserver(() => {
      resizeCanvas()
    })
    ro.observe(canvas)
    roRef.current = ro

    // Keyboard: hold/release Space to pan
    const onKeyDown = (e) => {
      if (e.code === 'Space') {
        stateRef.current.spaceHeld = true
        canvas.style.cursor = 'grabbing'
      }
    }
    const onKeyUp = (e) => {
      if (e.code === 'Space') {
        stateRef.current.spaceHeld = false
        if (!stateRef.current.panning) canvas.style.cursor = 'crosshair'
      }
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      if (roRef.current) roRef.current.disconnect()
      cancelAnimationFrame(rafRef.current)
    }
  }, [resizeCanvas, draw])

  // Pointer handlers
  const onPointerDown = (e) => {
    const canvas = canvasRef.current
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
      const stroke = {
        color: '#222',
        size: 2,
        points: [{ x, y, p: e.pressure ?? 0.5 }],
      }
      strokesRef.current.push(stroke)
    }
  }

  const onPointerMove = (e) => {
    if (stateRef.current.pointerId !== e.pointerId) return
    const dx = e.clientX - stateRef.current.lastX
    const dy = e.clientY - stateRef.current.lastY
    stateRef.current.lastX = e.clientX
    stateRef.current.lastY = e.clientY

    if (stateRef.current.panning) {
      // Pan in screen pixels to move the world
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

  // Wheel zoom toward the cursor
  const onWheel = (e) => {
    e.preventDefault()
    const { panX, panY, scale } = viewRef.current
    const rect = canvasRef.current.getBoundingClientRect()
    const sx = e.clientX - rect.left
    const sy = e.clientY - rect.top
    // World point under cursor before zoom
    const wx = (sx - panX) / scale
    const wy = (sy - panY) / scale
    // Zoom factor
    const zoom = Math.pow(1.0015, -e.deltaY)
    const next = clamp(scale * zoom, 0.05, 20)
    viewRef.current.scale = next
    // Keep cursor anchored on same world point
    viewRef.current.panX = sx - wx * next
    viewRef.current.panY = sy - wy * next
  }

  // Double click empties selection area: here used to reset view
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
      onWheel={onWheel}
      onDoubleClick={onDoubleClick}
    />
  )
}

function drawGrid(ctx, canvas, view) {
  const grid = 100 // world units
  // Compute visible world bounds
  const w = canvas.clientWidth
  const h = canvas.clientHeight
  const left = (-view.panX) / view.scale
  const top = (-view.panY) / view.scale
  const right = left + w / view.scale
  const bottom = top + h / view.scale

  // Major grid
  ctx.save()
  ctx.lineWidth = 1 / Math.max(0.0001, view.scale)
  ctx.strokeStyle = '#e6e6e6'
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

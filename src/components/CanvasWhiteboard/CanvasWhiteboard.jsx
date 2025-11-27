import React, { forwardRef, useImperativeHandle } from 'react'
import styles from './CanvasWhiteboard.module.css'

const CanvasWhiteboard = forwardRef(({ theme, tool }, ref) => {
  const canvasRef = React.useRef(null)
  const ctxRef = React.useRef(null)
  const dprRef = React.useRef(1)
  const rafRef = React.useRef(0)
  const roRef = React.useRef(null)
  const lastTapRef = React.useRef({
    t: 0, x: 0, y: 0
  })

  const viewRef = React.useRef({
    panX: 0, panY: 0, scale: 1
  })
  const stateRef = React.useRef({
    drawing: false,
    panning: false,
    spaceHeld: false,
    lastX: 0, lastY: 0,
    pointerId: null,
    pinch: null
  })
  const strokesRef = React.useRef([])
  const redoRef = React.useRef([])

  const themeColors = React.useMemo(
    () => theme === 'dark'
      ? {
        bg: '#0f1115',
        grid: '#2a2f3a',
        stroke: '#e6e6e6'
      }
      : {
        bg: '#ffffff',
        grid: '#e6e6e6',
        stroke: '#222222'
      },
    [theme]
  )

  const screenToWorld = React.useCallback((sx, sy) => {
    const { panX, panY, scale } = viewRef.current
    return {
      x: (sx - panX) / scale,
      y: (sy - panY) / scale
    }
  }, [])

  const resizeCanvas = React.useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas)
      return
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
    if (!canvas || !ctx)
      return
    const { panX, panY, scale } = viewRef.current

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    ctx.save()
    ctx.translate(panX, panY)
    ctx.scale(scale, scale)
    for (const s of strokesRef.current) {
      if (!s.points.length)
        continue
      ctx.beginPath()
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
      ctx.globalAlpha = 1
      ctx.globalCompositeOperation = 'source-over'
    }
    ctx.restore()

    ctx.save()
    ctx.globalCompositeOperation = 'destination-over'
    ctx.save()
    ctx.translate(panX, panY)
    ctx.scale(scale, scale)
    drawGrid(ctx, canvas, viewRef.current, themeColors)
    ctx.restore()
    ctx.fillStyle = themeColors.bg
    ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight)
    ctx.globalCompositeOperation = 'source-over'
    ctx.restore()

    rafRef.current = requestAnimationFrame(draw)
  }, [themeColors])

  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas)
      return
    resizeCanvas()
    rafRef.current = requestAnimationFrame(draw)

    const ro = new ResizeObserver(() => resizeCanvas())
    ro.observe(canvas)
    roRef.current = ro

    const onKeyDown = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        stateRef.current.spaceHeld = true;
        canvas.style.cursor = 'grabbing'
        return
      }

      const mod = e.metaKey || e.ctrlKey
      if (!mod) return

      // Undo: Cmd/Ctrl+Z
      if (e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault()
        if (stateRef.current.drawing) {
          stateRef.current.drawing = false
        }
        const s = strokesRef.current.pop()
        if (s) redoRef.current.push(s)
        return
      }

      // Redo: Cmd/Ctrl+Shift+Z or Cmd/Ctrl+Y
      if ((e.key.toLowerCase() === 'z' && e.shiftKey) ||
        e.key.toLowerCase() === 'y') {
        e.preventDefault()
        const s = redoRef.current.pop()
        if (s) strokesRef.current.push(s)
        return
      }
    }
    const onKeyUp = (e) => {
      if (e.code === 'Space') {
        e.preventDefault(); stateRef.current.spaceHeld = false;
        if (!stateRef.current.panning)
          canvas.style.cursor = 'crosshair'
      }
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)

    const onWheelNative = (e) => {
      e.preventDefault()
      const { panX, panY, scale } = viewRef.current
      const rect = canvas.getBoundingClientRect()
      const sx = e.clientX - rect.left
      const sy = e.clientY - rect.top
      const wx = (sx - panX) / scale
      const wy = (sy - panY) / scale
      const absX = Math.abs(e.deltaX)
      const absY = Math.abs(e.deltaY)
      const likelyMouseWheel = (e.deltaMode === 1) || (absY >= 120 && absX < 1)
      const forceZoom = e.altKey
      if (e.ctrlKey || forceZoom || likelyMouseWheel) {
        const factor = e.ctrlKey ? 1.02 : 1.0015
        const zoom = Math.pow(factor, -e.deltaY)
        const next = clamp(scale * zoom, 0.05, 20)
        viewRef.current.scale = next
        viewRef.current.panX = sx - wx * next
        viewRef.current.panY = sy - wy * next
      } else {
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
      if (roRef.current)
        roRef.current.disconnect()
      cancelAnimationFrame(rafRef.current)
    }
  }, [resizeCanvas, draw])

  React.useEffect(() => {
    for (const s of strokesRef.current)
      if (!s.mode)
        s.mode = 'theme'
  }, [theme])

  const onPointerDown = (e) => {
    const canvas = canvasRef.current
    if (e.pointerType === 'touch') {
      const now = performance.now()
      const dt = now - lastTapRef.current.t
      const dx = e.clientX - lastTapRef.current.x
      const dy = e.clientY - lastTapRef.current.y
      if (dt < 300 && (dx * dx + dy * dy) < 30 * 30) {
        viewRef.current.panX = 0;
        viewRef.current.panY = 0;
        viewRef.current.scale = 1
      }
      lastTapRef.current = {
        t: now,
        x: e.clientX,
        y: e.clientY
      }

      touchCache.set(e.pointerId, { x: e.clientX, y: e.clientY })
      if (touchCache.size === 2 && !stateRef.current.pinch) {
        const [a, b] = [...touchCache.values()]
        const startDist = Math.hypot(a.x - b.x, a.y - b.y)
        const rect = canvas.getBoundingClientRect()
        const originX = (a.x + b.x) / 2 - rect.left
        const originY = (a.y + b.y) / 2 - rect.top
        const [id1, id2] = [...touchCache.keys()]
        stateRef.current.pinch = {
          id1, id2, startDist,
          startScale: viewRef.current.scale,
          startPanX: viewRef.current.panX,
          startPanY: viewRef.current.panY,
          originX, originY,
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
      canvas.style.cursor = 'grabbing';
      return
    }

    if (stateRef.current.drawing) {
      redoRef.current.length = 0
      const { x, y } = screenToWorld(e.clientX, e.clientY)
      const t = tool || { kind: 'pen', size: 2, color: undefined }
      const stroke = {
        mode: (t.kind !== 'eraser' && t.color) ? 'custom' : 'theme',
        size: t.kind === 'marker' ? Math.max(4, t.size * 2)
          : t.kind === 'highlighter' ? Math.max(10, t.size * 6)
            : t.kind === 'eraser' ? Math.max(8, t.size * 6) : (t.size || 2),
        alpha: t.kind === 'highlighter' ? 0.28 : 1,
        erase: t.kind === 'eraser',
        color: (t.kind !== 'eraser') ? t.color : undefined,
        cap: 'round', join: 'round',
        points: [{ x, y, p: e.pressure ?? 0.5 }],
      }
      strokesRef.current.push(stroke)
    }
  }

  const onPointerMove = (e) => {
    if (e.pointerType === 'touch') {
      if (touchCache.has(e.pointerId))
        touchCache.set(e.pointerId, { x: e.clientX, y: e.clientY })
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

    if (stateRef.current.pointerId !== e.pointerId)
      return
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
      if (stroke)
        stroke.points.push({ x, y, p: e.pressure ?? 0.5 })
      return
    }
  }

  const onPointerUp = (e) => {
    if (e.pointerType === 'touch') {
      touchCache.delete(e.pointerId)
      const pinch = stateRef.current.pinch
      if (pinch && (e.pointerId === pinch.id1 || e.pointerId === pinch.id2))
        stateRef.current.pinch = null
    }
    if (stateRef.current.pointerId !== e.pointerId)
      return
    stateRef.current.pointerId = null
    if (stateRef.current.panning) {
      stateRef.current.panning = false
      if (!stateRef.current.spaceHeld)
        canvasRef.current.style.cursor = 'crosshair'
    }
    stateRef.current.drawing = false
  }
  React.useEffect(() => {
    const onEsc = (e) => {
      if (e.key === 'Escape' && stateRef.current.drawing) {
        e.preventDefault()
        const last = strokesRef.current[strokesRef.current.length - 1]
        if (last && last.points && last.points.length <= 1) {
          strokesRef.current.pop()
        }
        stateRef.current.drawing = false
      }
    }
    window.addEventListener('keydown', onEsc)
    return () => window.removeEventListener('keydown', onEsc)
  }, [])

  const onDoubleClick = () => {
    viewRef.current.panX = 0;
    viewRef.current.panY = 0;
    viewRef.current.scale = 1
  }
  const undo = () => {
    const s = strokesRef.current.pop()
    if (s) redoRef.current.push(s)
  }
  const redo = () => {
    const s = redoRef.current.pop()
    if (s) strokesRef.current.push(s)
  }

  useImperativeHandle(ref, () => ({
    undo,
    redo,
  }), [])

  return (
    <canvas
      ref={canvasRef}
      className={styles.board}
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
})

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
    ctx.moveTo(x, startY);
    ctx.lineTo(x, endY)
  }
  for (let y = startY; y <= endY; y += grid) {
    ctx.moveTo(startX, y);
    ctx.lineTo(endX, y)
  }
  ctx.stroke()
  ctx.restore()
}

function clamp(v, a, b) {
  return Math.min(b, Math.max(a, v))
}

export default CanvasWhiteboard
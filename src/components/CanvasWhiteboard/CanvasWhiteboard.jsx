import React, { forwardRef, useImperativeHandle } from 'react';
import styles from './CanvasWhiteboard.module.css';
import {
  useCanvasSetup,
  useCanvasView,
  useStrokeManager,
  useKeyboardShortcuts,
  useWheelZoom,
  usePinchZoom,
  useImagePaste,
} from '../../hooks';
import { drawGrid, getThemeColors } from '../../utils/canvas';

const CanvasWhiteboard = forwardRef(({ theme, tool }, ref) => {
  const canvasRef = React.useRef(null);
  const rafRef = React.useRef(0);

  // Interaction state (mutable, doesn't trigger re-renders)
  const stateRef = React.useRef({
    drawing: false,
    panning: false,
    spaceHeld: false,
    lastX: 0,
    lastY: 0,
    pointerId: null,
    pinch: null,
    selectedImageIndex: -1,
    dragHandle: null,
    dragOffsetX: 0,
    dragOffsetY: 0,
  });

  // Custom hooks
  const { ctxRef } = useCanvasSetup(canvasRef);
  const { viewRef, screenToWorld, resetView } = useCanvasView();
  const { strokesRef, redoRef, undo, redo, clearRedoStack } = useStrokeManager();

  useKeyboardShortcuts(canvasRef, stateRef, strokesRef, redoRef);
  useWheelZoom(canvasRef, viewRef);
  useImagePaste(canvasRef, viewRef, strokesRef, redoRef);

  const { handleTouchStart, handleTouchMove, handleTouchEnd } = usePinchZoom(canvasRef, viewRef, stateRef);

  // Theme colors
  const themeColors = React.useMemo(() => getThemeColors(theme), [theme]);

  // Main draw loop
  const draw = React.useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;

    const { panX, panY, scale } = viewRef.current;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw strokes
    ctx.save();
    ctx.translate(panX, panY);
    ctx.scale(scale, scale);

    for (let i = 0; i < strokesRef.current.length; i++) {
      const s = strokesRef.current[i];

      if (s.mode === 'image' && s.image) {
        drawImageStroke(ctx, s, i, stateRef.current.selectedImageIndex, viewRef.current);
        continue;
      }

      if (!s.points.length) continue;
      drawPathStroke(ctx, s, themeColors, scale);
    }
    ctx.restore();

    // Draw grid and background (behind strokes)
    ctx.save();
    ctx.globalCompositeOperation = 'destination-over';
    ctx.save();
    ctx.translate(panX, panY);
    ctx.scale(scale, scale);
    drawGrid(ctx, canvas, viewRef.current, themeColors);
    ctx.restore();
    ctx.fillStyle = themeColors.bg;
    ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    ctx.globalCompositeOperation = 'source-over';
    ctx.restore();

    rafRef.current = requestAnimationFrame(draw);
  }, [themeColors, ctxRef, viewRef, strokesRef]);

  // Start render loop
  React.useEffect(() => {
    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [draw]);

  // Update stroke modes when theme changes
  React.useEffect(() => {
    for (const s of strokesRef.current) {
      if (!s.mode) s.mode = 'theme';
    }
  }, [theme, strokesRef]);

  // Update cursor based on tool
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.style.cursor = tool?.kind === 'select' ? 'grab' : 'crosshair';
  }, [tool]);

  // Pointer handlers
  const onPointerDown = (e) => {
    const canvas = canvasRef.current;

    // Handle touch (pinch/double-tap)
    if (e.pointerType === 'touch') {
      handleTouchStart(e);
    }

    const { spaceHeld } = stateRef.current;
    const isMiddle = e.button === 1;
    const panning = spaceHeld || isMiddle;

    canvas.setPointerCapture(e.pointerId);
    stateRef.current.pointerId = e.pointerId;
    stateRef.current.lastX = e.clientX;
    stateRef.current.lastY = e.clientY;
    stateRef.current.panning = panning;
    stateRef.current.drawing = !panning && e.button === 0 && tool?.kind !== 'select';

    if (stateRef.current.panning) {
      canvas.style.cursor = 'grabbing';
      return;
    }

    if (stateRef.current.drawing) {
      clearRedoStack();
      const { x, y } = screenToWorld(e.clientX, e.clientY);
      const stroke = createStroke(tool, x, y, e.pressure);
      strokesRef.current.push(stroke);
      return;
    }

    // Select tool logic
    if (tool?.kind === 'select') {
      handleSelectToolDown(e, screenToWorld, stateRef, strokesRef, viewRef, canvasRef);
    }
  };

  const onPointerMove = (e) => {
    // Handle touch pinch
    if (e.pointerType === 'touch' && handleTouchMove(e)) {
      return;
    }

    if (stateRef.current.pointerId !== e.pointerId) return;

    const dx = e.clientX - stateRef.current.lastX;
    const dy = e.clientY - stateRef.current.lastY;
    stateRef.current.lastX = e.clientX;
    stateRef.current.lastY = e.clientY;

    if (stateRef.current.panning) {
      viewRef.current.panX += dx;
      viewRef.current.panY += dy;
      return;
    }

    if (stateRef.current.drawing) {
      const { x, y } = screenToWorld(e.clientX, e.clientY);
      const stroke = strokesRef.current[strokesRef.current.length - 1];
      if (stroke) stroke.points.push({ x, y, p: e.pressure ?? 0.5 });
      return;
    }

    // Image drag/resize
    if (stateRef.current.selectedImageIndex >= 0 && stateRef.current.dragHandle) {
      handleImageDrag(e, screenToWorld, stateRef, strokesRef);
    }
  };

  const onPointerUp = (e) => {
    if (e.pointerType === 'touch') {
      handleTouchEnd(e);
    }

    if (stateRef.current.pointerId !== e.pointerId) return;
    stateRef.current.pointerId = null;

    if (stateRef.current.panning) {
      stateRef.current.panning = false;
      if (!stateRef.current.spaceHeld) {
        canvasRef.current.style.cursor = 'crosshair';
      }
    }

    stateRef.current.drawing = false;
    stateRef.current.dragHandle = null;
  };

  const onPointerCancel = () => {
    stateRef.current.pointerId = null;
    stateRef.current.drawing = false;
    stateRef.current.panning = false;
    stateRef.current.pinch = null;
  };

  // Expose undo/redo to parent
  useImperativeHandle(ref, () => ({ undo, redo }), [undo, redo]);

  return (
    <canvas
      ref={canvasRef}
      className={styles.board}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      onDoubleClick={resetView}
    />
  );
});

// Helper: Draw an image stroke with selection handles
function drawImageStroke(ctx, s, index, selectedIndex, view) {
  ctx.save();
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
  ctx.drawImage(s.image, s.x, s.y, s.width, s.height);
  ctx.restore();

  if (index === selectedIndex) {
    const strokeWidth = 2 / Math.max(0.0001, view.scale);
    ctx.strokeStyle = '#00f';
    ctx.lineWidth = strokeWidth;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(s.x, s.y, s.width, s.height);
    ctx.setLineDash([]);

    const handleSize = 10 / view.scale;
    ctx.fillStyle = '#00f';
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1 / view.scale;

    const corners = [
      { x: s.x, y: s.y },
      { x: s.x + s.width, y: s.y },
      { x: s.x + s.width, y: s.y + s.height },
      { x: s.x, y: s.y + s.height },
    ];
    corners.forEach((corner) => {
      ctx.fillRect(corner.x - handleSize / 2, corner.y - handleSize / 2, handleSize, handleSize);
      ctx.strokeRect(corner.x - handleSize / 2, corner.y - handleSize / 2, handleSize, handleSize);
    });
  }
}

// Helper: Draw a path stroke
function drawPathStroke(ctx, s, themeColors, scale) {
  ctx.beginPath();
  ctx.lineJoin = s.join || 'round';
  ctx.lineCap = s.cap || 'round';
  ctx.strokeStyle = s.mode === 'custom' && s.color ? s.color : themeColors.stroke;
  ctx.lineWidth = (s.size || 2) / Math.max(0.0001, scale);
  ctx.globalAlpha = s.alpha ?? 1;
  ctx.globalCompositeOperation = s.erase ? 'destination-out' : 'source-over';

  const first = s.points[0];
  ctx.moveTo(first.x, first.y);
  for (let i = 1; i < s.points.length; i++) {
    ctx.lineTo(s.points[i].x, s.points[i].y);
  }
  ctx.stroke();

  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
}

// Helper: Create a new stroke from tool settings
function createStroke(tool, x, y, pressure) {
  const t = tool || { kind: 'pen', size: 2, color: undefined };
  return {
    mode: t.kind !== 'eraser' && t.color ? 'custom' : 'theme',
    size:
      t.kind === 'marker'
        ? Math.max(4, t.size * 2)
        : t.kind === 'highlighter'
          ? Math.max(10, t.size * 6)
          : t.kind === 'eraser'
            ? Math.max(8, t.size * 6)
            : t.size || 2,
    alpha: t.kind === 'highlighter' ? 0.28 : 1,
    erase: t.kind === 'eraser',
    color: t.kind !== 'eraser' ? t.color : undefined,
    cap: 'round',
    join: 'round',
    points: [{ x, y, p: pressure ?? 0.5 }],
  };
}

// Helper: Handle select tool pointer down
function handleSelectToolDown(e, screenToWorld, stateRef, strokesRef, viewRef, canvasRef) {
  const { x, y } = screenToWorld(e.clientX, e.clientY);
  const canvas = canvasRef.current;

  // Check resize handles first
  const handle = getHandleAt(x, y, e, stateRef, strokesRef, viewRef, canvasRef);
  if (handle) {
    stateRef.current.dragHandle = handle.type;
    stateRef.current.dragOffsetX = handle.offsetX;
    stateRef.current.dragOffsetY = handle.offsetY;
    return;
  }

  // Check image bounding box
  const imgIndex = getImageAt(x, y, strokesRef);
  if (imgIndex >= 0) {
    stateRef.current.selectedImageIndex = imgIndex;
    const img = strokesRef.current[imgIndex];
    stateRef.current.dragHandle = 'move';
    stateRef.current.dragOffsetX = x - img.x;
    stateRef.current.dragOffsetY = y - img.y;
    return;
  }

  // Deselect and start panning
  stateRef.current.selectedImageIndex = -1;
  stateRef.current.dragHandle = null;
  stateRef.current.panning = true;
  canvas.style.cursor = 'grabbing';
}

// Helper: Handle image drag/resize
function handleImageDrag(e, screenToWorld, stateRef, strokesRef) {
  const selIndex = stateRef.current.selectedImageIndex;
  const img = strokesRef.current[selIndex];
  const { x: wx, y: wy } = screenToWorld(e.clientX, e.clientY);

  if (stateRef.current.dragHandle === 'move') {
    img.x = wx - stateRef.current.dragOffsetX;
    img.y = wy - stateRef.current.dragOffsetY;
  } else {
    switch (stateRef.current.dragHandle) {
      case 'tl':
        img.width = img.x + img.width - wx;
        img.height = img.y + img.height - wy;
        img.x = wx;
        img.y = wy;
        break;
      case 'tr':
        img.width = wx - img.x;
        img.height = img.y + img.height - wy;
        img.y = wy;
        break;
      case 'bl':
        img.width = img.x + img.width - wx;
        img.height = wy - img.y;
        img.x = wx;
        break;
      case 'br':
        img.width = wx - img.x;
        img.height = wy - img.y;
        break;
    }
    img.width = Math.max(10, img.width);
    img.height = Math.max(10, img.height);
  }
}

// Helper: Find image at world coordinates
function getImageAt(wx, wy, strokesRef) {
  for (let i = 0; i < strokesRef.current.length; i++) {
    const stroke = strokesRef.current[i];
    if (stroke.mode === 'image') {
      if (wx >= stroke.x && wx <= stroke.x + stroke.width && wy >= stroke.y && wy <= stroke.y + stroke.height) {
        return i;
      }
    }
  }
  return -1;
}

// Helper: Find resize handle at position
function getHandleAt(wx, wy, e, stateRef, strokesRef, viewRef, canvasRef) {
  const selIndex = stateRef.current.selectedImageIndex;
  if (selIndex < 0) return null;

  const stroke = strokesRef.current[selIndex];
  const rect = canvasRef.current.getBoundingClientRect();
  const handleSize = 20 / viewRef.current.scale;

  const handles = [
    { type: 'tl', hx: stroke.x, hy: stroke.y },
    { type: 'tr', hx: stroke.x + stroke.width, hy: stroke.y },
    { type: 'bl', hx: stroke.x, hy: stroke.y + stroke.height },
    { type: 'br', hx: stroke.x + stroke.width, hy: stroke.y + stroke.height },
  ];

  for (const h of handles) {
    const sx = h.hx * viewRef.current.scale + viewRef.current.panX + rect.left;
    const sy = h.hy * viewRef.current.scale + viewRef.current.panY + rect.top;
    const dx = e.clientX - sx;
    const dy = e.clientY - sy;
    if (Math.hypot(dx, dy) < handleSize) {
      return {
        type: h.type,
        offsetX: dx / viewRef.current.scale,
        offsetY: dy / viewRef.current.scale,
      };
    }
  }
  return null;
}

export default CanvasWhiteboard;

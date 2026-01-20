import React, { forwardRef, useImperativeHandle } from 'react';
import styles from './Canvas.module.css';
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
import { TOOL_KINDS, DEFAULT_TOOL, getStrokeSize, getToolAlpha, isEraserTool } from '../../constants/tools';
import { isPointNearStroke } from '../../../../utils/math';

const Canvas = forwardRef(({ theme, tool }, ref) => {
  const canvasRef = React.useRef(null);
  const strokeCanvasRef = React.useRef(null); // Offscreen canvas for strokes
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
    strokeErasing: false,
    // Cursor position for eraser visualization
    cursorX: 0,
    cursorY: 0,
    cursorVisible: false,
  });

  const toolRef = React.useRef(tool);
  React.useEffect(() => {
    toolRef.current = tool;
  }, [tool]);

  // Custom hooks
  const { ctxRef } = useCanvasSetup(canvasRef);
  const { viewRef, screenToWorld, resetView } = useCanvasView();
  const { strokesRef, redoRef, undo, redo, clearRedoStack, clearCanvas, deleteStroke, deleteStrokes, registerStroke } =
    useStrokeManager();

  useKeyboardShortcuts(canvasRef, stateRef, strokesRef, undo, redo);
  useWheelZoom(canvasRef, viewRef);
  useImagePaste(canvasRef, viewRef, strokesRef, redoRef);

  const { handleTouchStart, handleTouchMove, handleTouchEnd } = usePinchZoom(canvasRef, viewRef, stateRef);

  // Theme colors
  const themeColorsRef = React.useRef(getThemeColors(theme));
  React.useEffect(() => {
    themeColorsRef.current = getThemeColors(theme);
  }, [theme]);

  // Main draw loop
  const draw = React.useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;

    const { panX, panY, scale } = viewRef.current;
    const themeColors = themeColorsRef.current;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const strokes = strokesRef.current;
    const selectedIdx = stateRef.current.selectedImageIndex;

    if (!strokeCanvasRef.current) {
      // Avoid image deletion when erasing
      strokeCanvasRef.current = document.createElement('canvas');
    }
    const strokeCanvas = strokeCanvasRef.current;
    if (strokeCanvas.width !== canvas.width || strokeCanvas.height !== canvas.height) {
      strokeCanvas.width = canvas.width;
      strokeCanvas.height = canvas.height;
    }
    const strokeCtx = strokeCanvas.getContext('2d');
    strokeCtx.clearRect(0, 0, strokeCanvas.width, strokeCanvas.height);

    // Draw strokes to offscreen canvas
    strokeCtx.save();
    strokeCtx.setTransform(ctx.getTransform());
    strokeCtx.translate(panX, panY);
    strokeCtx.scale(scale, scale);

    // Draw non-erase strokes
    for (let i = 0; i < strokes.length; i++) {
      const s = strokes[i];
      if (s.mode === 'image' || s.erase) continue;
      if (!s.points || !s.points.length) continue;
      drawPathStroke(strokeCtx, s, themeColors, scale);
    }

    // Apply erase strokes
    for (let i = 0; i < strokes.length; i++) {
      const s = strokes[i];
      if (!s.erase) continue;
      if (!s.points || !s.points.length) continue;
      drawPathStroke(strokeCtx, s, themeColors, scale);
    }
    strokeCtx.restore();

    // Draw images to main canvas first
    ctx.save();
    ctx.translate(panX, panY);
    ctx.scale(scale, scale);
    for (let i = 0; i < strokes.length; i++) {
      const s = strokes[i];
      if (s.mode === 'image' && s.image) {
        drawImageStroke(ctx, s, i, selectedIdx, viewRef.current);
      }
    }
    ctx.restore();
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(strokeCanvas, 0, 0);
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

    // Draw eraser cursor
    const currentTool = toolRef.current;
    const { cursorVisible, cursorX, cursorY } = stateRef.current;
    if (cursorVisible && isEraserTool(currentTool?.kind)) {
      const eraserSize = getStrokeSize(currentTool.kind, currentTool.size || 2);
      const screenRadius = eraserSize / 2;

      ctx.save();
      ctx.beginPath();
      ctx.arc(cursorX, cursorY, screenRadius, 0, Math.PI * 2);
      ctx.strokeStyle = themeColors.stroke;
      ctx.globalAlpha = 0.4;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 3]);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }

    rafRef.current = requestAnimationFrame(draw);
  }, []);

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

    if (isEraserTool(tool?.kind)) {
      canvas.style.cursor = 'none';
    } else if (tool?.kind === TOOL_KINDS.SELECT) {
      canvas.style.cursor = 'grab';
    } else {
      canvas.style.cursor = 'crosshair';
    }
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
    stateRef.current.drawing = !panning && e.button === 0 && tool?.kind !== TOOL_KINDS.SELECT;

    if (stateRef.current.panning) {
      canvas.style.cursor = 'grabbing';
      return;
    }

    if (stateRef.current.drawing) {
      clearRedoStack();
      const { x, y } = screenToWorld(e.clientX, e.clientY);

      // Stroke eraser mode - deletes entire strokes immediately when touched
      if (tool?.kind === TOOL_KINDS.STROKE_ERASER) {
        stateRef.current.strokeErasing = true;
        const eraserSize = getStrokeSize(TOOL_KINDS.STROKE_ERASER, tool.size || 2) / viewRef.current.scale;
        const indices = findStrokesAtPoint(x, y, eraserSize, strokesRef);
        if (indices.length > 0) {
          deleteStrokes(indices);
        }
        return;
      }

      const stroke = createStroke(tool, x, y, e.pressure);
      strokesRef.current.push(stroke);
      return;
    }

    // Select tool logic
    if (tool?.kind === TOOL_KINDS.SELECT) {
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

      // Stroke eraser move - delete strokes immediately
      if (stateRef.current.strokeErasing) {
        const eraserSize = getStrokeSize(TOOL_KINDS.STROKE_ERASER, tool?.size || 2) / viewRef.current.scale;
        const indices = findStrokesAtPoint(x, y, eraserSize, strokesRef);
        if (indices.length > 0) {
          deleteStrokes(indices);
        }
        return;
      }

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

    // Register completed stroke for undo
    if (stateRef.current.drawing && !stateRef.current.strokeErasing) {
      const lastStroke = strokesRef.current[strokesRef.current.length - 1];
      if (lastStroke && lastStroke.points?.length > 0) {
        registerStroke(lastStroke);
      }
    }

    stateRef.current.strokeErasing = false;
    stateRef.current.drawing = false;
    stateRef.current.dragHandle = null;
  };

  const onPointerCancel = () => {
    stateRef.current.pointerId = null;
    stateRef.current.drawing = false;
    stateRef.current.panning = false;
    stateRef.current.pinch = null;
    stateRef.current.strokeErasing = false;
  };

  // Track cursor position for eraser visualization
  const onMouseMove = (e) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      stateRef.current.cursorX = e.clientX - rect.left;
      stateRef.current.cursorY = e.clientY - rect.top;
    }
  };

  const onMouseEnter = () => {
    stateRef.current.cursorVisible = true;
  };

  const onMouseLeave = () => {
    stateRef.current.cursorVisible = false;
  };

  // Delete selected image handler
  const deleteSelectedImage = React.useCallback(() => {
    const idx = stateRef.current.selectedImageIndex;
    if (idx >= 0) {
      deleteStroke(idx);
      stateRef.current.selectedImageIndex = -1;
    }
  }, [deleteStroke]);

  // Check if an image is selected
  // const hasSelectedImage = stateRef.current.selectedImageIndex >= 0;

  // Expose methods to parent
  useImperativeHandle(
    ref,
    () => ({
      undo,
      redo,
      clearCanvas,
      deleteSelectedImage,
      hasSelectedImage: () => stateRef.current.selectedImageIndex >= 0,
    }),
    [undo, redo, clearCanvas, deleteSelectedImage]
  );

  return (
    <canvas
      ref={canvasRef}
      className={styles.board}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      onMouseMove={onMouseMove}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
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
  const t = tool || DEFAULT_TOOL;
  const isEraser = t.kind === TOOL_KINDS.ERASER;

  return {
    mode: !isEraser && t.color ? 'custom' : 'theme',
    size: getStrokeSize(t.kind, t.size || 2),
    alpha: getToolAlpha(t.kind),
    erase: isEraser,
    color: !isEraser ? t.color : undefined,
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

// Helper: Find stroke indices that the eraser touches
function findStrokesAtPoint(x, y, eraserSize, strokesRef) {
  const indicesToDelete = [];

  for (let i = 0; i < strokesRef.current.length; i++) {
    const stroke = strokesRef.current[i];

    // Skip images
    if (stroke.mode === 'image') continue;

    // Check if eraser touches any part
    if (isPointNearStroke(x, y, stroke, eraserSize)) {
      indicesToDelete.push(i);
    }
  }

  return indicesToDelete;
}

export default Canvas;

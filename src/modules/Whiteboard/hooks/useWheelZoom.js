import React from 'react';
import { clamp } from '../utils/canvas';

/**
 * Handles mouse wheel zoom and trackpad pan
 * @param {React.RefObject<HTMLCanvasElement>} canvasRef
 * @param {React.RefObject} viewRef - View state ref { panX, panY, scale }
 */
export default function useWheelZoom(canvasRef, viewRef) {
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onWheel = (e) => {
      e.preventDefault();

      const { panX, panY, scale } = viewRef.current;
      const rect = canvas.getBoundingClientRect();
      const sx = e.clientX - rect.left;
      const sy = e.clientY - rect.top;
      const wx = (sx - panX) / scale;
      const wy = (sy - panY) / scale;

      const absX = Math.abs(e.deltaX);
      const absY = Math.abs(e.deltaY);
      const likelyMouseWheel = e.deltaMode === 1 || (absY >= 120 && absX < 1);
      const forceZoom = e.altKey;

      if (e.ctrlKey || forceZoom || likelyMouseWheel) {
        // Zoom
        const factor = e.ctrlKey ? 1.02 : 1.0015;
        const zoom = Math.pow(factor, -e.deltaY);
        const next = clamp(scale * zoom, 0.05, 20);
        viewRef.current.scale = next;
        viewRef.current.panX = sx - wx * next;
        viewRef.current.panY = sy - wy * next;
      } else {
        // Pan (trackpad scroll)
        viewRef.current.panX -= e.deltaX;
        viewRef.current.panY -= e.deltaY;
      }
    };

    canvas.addEventListener('wheel', onWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', onWheel);
  }, [canvasRef, viewRef]);
}

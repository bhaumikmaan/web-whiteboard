import React from 'react';
import { clamp } from '../utils/canvas';

// Module-level touch cache (shared across instances)
const touchCache = new Map();

/**
 * Handles touch pinch-to-zoom gesture
 * @param {React.RefObject<HTMLCanvasElement>} canvasRef
 * @param {React.RefObject} viewRef - View state ref { panX, panY, scale }
 * @param {object} stateRef - Mutable state ref with pinch property
 * @returns {{ handleTouchStart: (e) => void, handleTouchMove: (e) => boolean, handleTouchEnd: (e) => void }}
 */
export default function usePinchZoom(canvasRef, viewRef, stateRef) {
  const lastTapRef = React.useRef({ t: 0, x: 0, y: 0 });

  const handleTouchStart = React.useCallback(
    (e) => {
      const canvas = canvasRef.current;

      // Double-tap to reset view
      const now = performance.now();
      const dt = now - lastTapRef.current.t;
      const dx = e.clientX - lastTapRef.current.x;
      const dy = e.clientY - lastTapRef.current.y;
      if (dt < 300 && dx * dx + dy * dy < 30 * 30) {
        viewRef.current.panX = 0;
        viewRef.current.panY = 0;
        viewRef.current.scale = 1;
      }
      lastTapRef.current = { t: now, x: e.clientX, y: e.clientY };

      // Track touch point
      touchCache.set(e.pointerId, { x: e.clientX, y: e.clientY });

      // Start pinch when 2 fingers detected
      if (touchCache.size === 2 && !stateRef.current.pinch) {
        const [a, b] = [...touchCache.values()];
        const startDist = Math.hypot(a.x - b.x, a.y - b.y);
        const rect = canvas.getBoundingClientRect();
        const originX = (a.x + b.x) / 2 - rect.left;
        const originY = (a.y + b.y) / 2 - rect.top;
        const [id1, id2] = [...touchCache.keys()];

        stateRef.current.pinch = {
          id1,
          id2,
          startDist,
          startScale: viewRef.current.scale,
          startPanX: viewRef.current.panX,
          startPanY: viewRef.current.panY,
          originX,
          originY,
        };
      }
    },
    [canvasRef, viewRef, stateRef]
  );

  const handleTouchMove = React.useCallback(
    (e) => {
      if (!touchCache.has(e.pointerId)) return false;

      touchCache.set(e.pointerId, { x: e.clientX, y: e.clientY });

      const pinch = stateRef.current.pinch;
      if (!pinch) return false;

      const a = touchCache.get(pinch.id1);
      const b = touchCache.get(pinch.id2);
      if (!a || !b) return false;

      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      const ratio = dist / Math.max(1e-3, pinch.startDist);
      const next = clamp(pinch.startScale * ratio, 0.05, 20);
      const { originX, originY } = pinch;
      const wx = (originX - pinch.startPanX) / pinch.startScale;
      const wy = (originY - pinch.startPanY) / pinch.startScale;

      viewRef.current.scale = next;
      viewRef.current.panX = originX - wx * next;
      viewRef.current.panY = originY - wy * next;

      return true; // Consumed the event
    },
    [viewRef, stateRef]
  );

  const handleTouchEnd = React.useCallback(
    (e) => {
      touchCache.delete(e.pointerId);
      const pinch = stateRef.current.pinch;
      if (pinch && (e.pointerId === pinch.id1 || e.pointerId === pinch.id2)) {
        stateRef.current.pinch = null;
      }
    },
    [stateRef]
  );

  return { handleTouchStart, handleTouchMove, handleTouchEnd };
}

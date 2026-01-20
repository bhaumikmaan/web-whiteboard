import React from 'react';

/**
 * Manages canvas view state (pan, zoom, scale)
 * @returns {{ viewRef: React.RefObject, screenToWorld: (sx: number, sy: number) => {x: number, y: number}, resetView: () => void }}
 */
export default function useCanvasView() {
  const viewRef = React.useRef({
    panX: 0,
    panY: 0,
    scale: 1,
  });

  const screenToWorld = React.useCallback((sx, sy) => {
    const { panX, panY, scale } = viewRef.current;
    return {
      x: (sx - panX) / scale,
      y: (sy - panY) / scale,
    };
  }, []);

  const resetView = React.useCallback(() => {
    viewRef.current.panX = 0;
    viewRef.current.panY = 0;
    viewRef.current.scale = 1;
  }, []);

  return { viewRef, screenToWorld, resetView };
}

import React from 'react';

/**
 * Handles canvas sizing, DPR scaling, and ResizeObserver
 * @param {React.RefObject<HTMLCanvasElement>} canvasRef
 * @returns {{ ctxRef: React.RefObject, dprRef: React.RefObject, resizeCanvas: () => void }}
 */
export default function useCanvasSetup(canvasRef) {
  const ctxRef = React.useRef(null);
  const dprRef = React.useRef(1);

  const resizeCanvas = React.useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    dprRef.current = dpr;

    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.max(1, Math.floor(rect.width * dpr));
    canvas.height = Math.max(1, Math.floor(rect.height * dpr));

    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctxRef.current = ctx;
  }, [canvasRef]);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    resizeCanvas();

    const ro = new ResizeObserver(() => resizeCanvas());
    ro.observe(canvas);

    return () => ro.disconnect();
  }, [canvasRef, resizeCanvas]);

  return { ctxRef, dprRef, resizeCanvas };
}

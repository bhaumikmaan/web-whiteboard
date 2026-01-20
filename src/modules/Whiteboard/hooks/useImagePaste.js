import React from 'react';

/**
 * Handles image paste and drag-drop onto canvas
 * @param {React.RefObject<HTMLCanvasElement>} canvasRef
 * @param {React.RefObject} viewRef - View state ref { panX, panY, scale }
 * @param {React.RefObject<Array>} strokesRef
 * @param {React.RefObject<Array>} redoRef
 */
export default function useImagePaste(canvasRef, viewRef, strokesRef, redoRef) {
  const pasteImageBlob = React.useCallback(
    (blob) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const { panX, panY, scale } = viewRef.current;

        // Target screen size: ~60% of the visible canvas area (in screen pixels)
        const screenMaxW = rect.width * 0.6;
        const screenMaxH = rect.height * 0.6;

        // Scale factor to fit image within screen bounds
        const factor = Math.min(1, screenMaxW / img.width, screenMaxH / img.height);

        // Calculate screen dimensions, then convert to world units
        // Dividing by scale ensures the image appears the same screen size regardless of zoom
        const w = (img.width * factor) / scale;
        const h = (img.height * factor) / scale;

        // Center in current view
        const cx = (rect.width / 2 - panX) / scale;
        const cy = (rect.height / 2 - panY) / scale;

        const stroke = {
          mode: 'image',
          image: img,
          x: cx - w / 2,
          y: cy - h / 2,
          width: w,
          height: h,
          points: [],
        };

        strokesRef.current.push(stroke);
        redoRef.current.length = 0;
      };
      img.src = URL.createObjectURL(blob);
    },
    [canvasRef, viewRef, strokesRef, redoRef]
  );

  // Drag and drop
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onDragOver = (e) => e.preventDefault();

    const onDrop = (e) => {
      e.preventDefault();
      const files = e.dataTransfer?.files || [];
      for (const file of files) {
        if (file.type.startsWith('image/')) {
          pasteImageBlob(file);
          break;
        }
      }
    };

    canvas.addEventListener('dragover', onDragOver);
    canvas.addEventListener('drop', onDrop);

    return () => {
      canvas.removeEventListener('dragover', onDragOver);
      canvas.removeEventListener('drop', onDrop);
    };
  }, [canvasRef, pasteImageBlob]);

  // Clipboard paste
  React.useEffect(() => {
    const handlePaste = async (e) => {
      const active = document.activeElement;
      if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable)) {
        return;
      }

      e.preventDefault();

      // Modern clipboard API
      try {
        if (navigator.clipboard && typeof navigator.clipboard.read === 'function') {
          const items = await navigator.clipboard.read();
          for (const item of items) {
            const type = item.types.find((t) => t.startsWith('image/'));
            if (!type) continue;
            const blob = await item.getType(type);
            pasteImageBlob(blob);
            return;
          }
        }
      } catch {
        // Fall through to legacy path
      }

      // Legacy clipboard
      const files = e.clipboardData?.files || [];
      for (const file of files) {
        if (file.type.startsWith('image/')) {
          pasteImageBlob(file);
          return;
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [pasteImageBlob]);
}

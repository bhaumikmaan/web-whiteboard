import React from 'react';

/**
 * Returns a callback that captures the current canvas view (via ref's captureView)
 * and triggers a PNG download. Uses async toBlob to avoid blocking the main thread.
 * @param {React.RefObject<{ captureView: () => Promise<Blob | null> | null }>} canvasRef
 * @returns {() => void} Callback to capture and download
 */
export default function useCanvasScreenshot(canvasRef) {
  return React.useCallback(() => {
    const capture = canvasRef.current?.captureView;
    if (!capture) return;

    capture().then((blob) => {
      if (!blob) return;
      const now = new Date();
      const pad = (n) => String(n).padStart(2, '0');
      const local =
        `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}` +
        `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `whiteboard-${local}.png`;
      a.click();
      URL.revokeObjectURL(url);
    });
  }, [canvasRef]);
}

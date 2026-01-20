import React from 'react';

/**
 * Handles keyboard shortcuts for canvas (undo, redo, space-to-pan, escape)
 * @param {React.RefObject<HTMLCanvasElement>} canvasRef
 * @param {object} stateRef - Mutable state ref
 * @param {React.RefObject<Array>} strokesRef
 * @param {React.RefObject<Array>} redoRef
 */
export default function useKeyboardShortcuts(canvasRef, stateRef, strokesRef, redoRef) {
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onKeyDown = (e) => {
      // Space to pan
      if (e.code === 'Space') {
        e.preventDefault();
        stateRef.current.spaceHeld = true;
        canvas.style.cursor = 'grabbing';
        return;
      }

      const mod = e.metaKey || e.ctrlKey;
      if (!mod) return;

      // Undo: Cmd/Ctrl+Z
      if (e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (stateRef.current.drawing) {
          stateRef.current.drawing = false;
        }
        const s = strokesRef.current.pop();
        if (s) redoRef.current.push(s);
        return;
      }

      // Redo: Cmd/Ctrl+Shift+Z or Cmd/Ctrl+Y
      if ((e.key.toLowerCase() === 'z' && e.shiftKey) || e.key.toLowerCase() === 'y') {
        e.preventDefault();
        const s = redoRef.current.pop();
        if (s) strokesRef.current.push(s);
        return;
      }
    };

    const onKeyUp = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        stateRef.current.spaceHeld = false;
        if (!stateRef.current.panning) {
          canvas.style.cursor = 'crosshair';
        }
      }
    };

    // Escape to cancel current stroke
    const onEsc = (e) => {
      if (e.key === 'Escape' && stateRef.current.drawing) {
        e.preventDefault();
        const last = strokesRef.current[strokesRef.current.length - 1];
        if (last && last.points && last.points.length <= 1) {
          strokesRef.current.pop();
        }
        stateRef.current.drawing = false;
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keydown', onEsc);
    window.addEventListener('keyup', onKeyUp);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keydown', onEsc);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [canvasRef, stateRef, strokesRef, redoRef]);
}

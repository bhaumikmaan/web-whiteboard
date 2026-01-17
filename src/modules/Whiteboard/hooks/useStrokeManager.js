import React from 'react';

/**
 * Manages stroke history with undo/redo support
 * @returns {{
 *   strokesRef: React.RefObject<Array>,
 *   redoRef: React.RefObject<Array>,
 *   addStroke: (stroke: object) => void,
 *   undo: () => void,
 *   redo: () => void,
 *   clearRedoStack: () => void
 * }}
 */
export default function useStrokeManager() {
  const strokesRef = React.useRef([]);
  const redoRef = React.useRef([]);

  const addStroke = React.useCallback((stroke) => {
    strokesRef.current.push(stroke);
    redoRef.current.length = 0;
  }, []);

  const undo = React.useCallback(() => {
    const s = strokesRef.current.pop();
    if (s) redoRef.current.push(s);
  }, []);

  const redo = React.useCallback(() => {
    const s = redoRef.current.pop();
    if (s) strokesRef.current.push(s);
  }, []);

  const clearRedoStack = React.useCallback(() => {
    redoRef.current.length = 0;
  }, []);

  return { strokesRef, redoRef, addStroke, undo, redo, clearRedoStack };
}

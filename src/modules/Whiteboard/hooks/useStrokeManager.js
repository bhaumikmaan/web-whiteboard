import React from 'react';

/**
 * Manages stroke history with operation-based undo/redo support
 * Operations: 'add_stroke', 'delete_strokes', 'clear'
 * @returns {{
 *   strokesRef: React.RefObject<Array>,
 *   undoStackRef: React.RefObject<Array>,
 *   redoStackRef: React.RefObject<Array>,
 *   addStroke: (stroke: object) => void,
 *   registerStroke: (stroke: object) => void,
 *   undo: () => void,
 *   redo: () => void,
 *   clearRedoStack: () => void,
 *   clearCanvas: () => void,
 *   deleteStroke: (index: number) => void,
 *   deleteStrokes: (indices: number[]) => void
 * }}
 */
export default function useStrokeManager() {
  const strokesRef = React.useRef([]);
  const undoStackRef = React.useRef([]);
  const redoStackRef = React.useRef([]);

  const addStroke = React.useCallback((stroke) => {
    strokesRef.current.push(stroke);
    undoStackRef.current.push({ type: 'add_stroke', stroke });
    redoStackRef.current.length = 0;
  }, []);

  // Register a stroke that was already added to strokesRef (for incremental drawing)
  const registerStroke = React.useCallback((stroke) => {
    undoStackRef.current.push({ type: 'add_stroke', stroke });
    // Note: don't clear redo stack here as it was already cleared when drawing started
  }, []);

  const undo = React.useCallback(() => {
    const op = undoStackRef.current.pop();
    if (!op) return;

    if (op.type === 'add_stroke') {
      // Remove the last added stroke
      strokesRef.current.pop();
      redoStackRef.current.push(op);
    } else if (op.type === 'delete_strokes') {
      // Restore deleted strokes at their original positions
      // Items are stored in ascending index order, so restore in that order
      for (const { stroke, index } of op.items) {
        strokesRef.current.splice(index, 0, stroke);
      }
      redoStackRef.current.push(op);
    } else if (op.type === 'clear') {
      // Restore all cleared strokes
      strokesRef.current.push(...op.strokes);
      redoStackRef.current.push(op);
    }
  }, []);

  const redo = React.useCallback(() => {
    const op = redoStackRef.current.pop();
    if (!op) return;

    if (op.type === 'add_stroke') {
      // Re-add the stroke
      strokesRef.current.push(op.stroke);
      undoStackRef.current.push(op);
    } else if (op.type === 'delete_strokes') {
      // Re-delete the strokes (delete from end first to maintain indices)
      const sorted = [...op.items].sort((a, b) => b.index - a.index);
      for (const { index } of sorted) {
        strokesRef.current.splice(index, 1);
      }
      undoStackRef.current.push(op);
    } else if (op.type === 'clear') {
      // Re-clear the canvas
      strokesRef.current.length = 0;
      undoStackRef.current.push(op);
    }
  }, []);

  const clearRedoStack = React.useCallback(() => {
    redoStackRef.current.length = 0;
  }, []);

  const clearCanvas = React.useCallback(() => {
    const allStrokes = [...strokesRef.current];
    if (allStrokes.length > 0) {
      undoStackRef.current.push({ type: 'clear', strokes: allStrokes });
      redoStackRef.current.length = 0;
      strokesRef.current.length = 0;
    }
  }, []);

  const deleteStroke = React.useCallback((index) => {
    if (index >= 0 && index < strokesRef.current.length) {
      const deleted = strokesRef.current.splice(index, 1)[0];
      undoStackRef.current.push({ type: 'delete_strokes', items: [{ stroke: deleted, index }] });
      redoStackRef.current.length = 0;
    }
  }, []);

  const deleteStrokes = React.useCallback((indices) => {
    if (!indices.length) return;
    // Sort indices in descending order to delete from the end first
    const sorted = [...indices].sort((a, b) => b - a);
    const deleted = [];
    for (const idx of sorted) {
      if (idx >= 0 && idx < strokesRef.current.length) {
        deleted.push({ stroke: strokesRef.current.splice(idx, 1)[0], index: idx });
      }
    }
    if (deleted.length > 0) {
      // Store in ascending index order for proper restoration
      undoStackRef.current.push({ type: 'delete_strokes', items: deleted.reverse() });
      redoStackRef.current.length = 0;
    }
  }, []);

  // Legacy alias for backwards compatibility
  const redoRef = redoStackRef;

  return {
    strokesRef,
    undoStackRef,
    redoStackRef,
    redoRef,
    addStroke,
    registerStroke,
    undo,
    redo,
    clearRedoStack,
    clearCanvas,
    deleteStroke,
    deleteStrokes,
  };
}

import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useStrokeManager from './useStrokeManager';

describe('useStrokeManager', () => {
  it('initializes with empty stroke arrays', () => {
    const { result } = renderHook(() => useStrokeManager());

    expect(result.current.strokesRef.current).toEqual([]);
    expect(result.current.redoStackRef.current).toEqual([]);
    expect(result.current.undoStackRef.current).toEqual([]);
  });

  it('adds strokes and clears redo stack', () => {
    const { result } = renderHook(() => useStrokeManager());

    const stroke = { points: [{ x: 0, y: 0 }], color: 'red' };

    act(() => {
      result.current.addStroke(stroke);
    });

    expect(result.current.strokesRef.current).toHaveLength(1);
    expect(result.current.strokesRef.current[0]).toBe(stroke);
    expect(result.current.undoStackRef.current).toHaveLength(1);
  });

  it('undo moves stroke to redo stack', () => {
    const { result } = renderHook(() => useStrokeManager());

    const stroke1 = { id: 1 };
    const stroke2 = { id: 2 };

    act(() => {
      result.current.addStroke(stroke1);
      result.current.addStroke(stroke2);
    });

    expect(result.current.strokesRef.current).toHaveLength(2);

    act(() => {
      result.current.undo();
    });

    expect(result.current.strokesRef.current).toHaveLength(1);
    expect(result.current.strokesRef.current[0]).toBe(stroke1);
    expect(result.current.redoStackRef.current).toHaveLength(1);
    expect(result.current.redoStackRef.current[0]).toEqual({ type: 'add_stroke', stroke: stroke2 });
  });

  it('redo moves stroke back from redo stack', () => {
    const { result } = renderHook(() => useStrokeManager());

    const stroke = { id: 1 };

    act(() => {
      result.current.addStroke(stroke);
      result.current.undo();
    });

    expect(result.current.strokesRef.current).toHaveLength(0);
    expect(result.current.redoStackRef.current).toHaveLength(1);

    act(() => {
      result.current.redo();
    });

    expect(result.current.strokesRef.current).toHaveLength(1);
    expect(result.current.strokesRef.current[0]).toBe(stroke);
    expect(result.current.redoStackRef.current).toHaveLength(0);
  });

  it('undo does nothing when undo stack is empty', () => {
    const { result } = renderHook(() => useStrokeManager());

    act(() => {
      result.current.undo();
    });

    expect(result.current.strokesRef.current).toHaveLength(0);
    expect(result.current.redoStackRef.current).toHaveLength(0);
  });

  it('redo does nothing when redo stack is empty', () => {
    const { result } = renderHook(() => useStrokeManager());

    act(() => {
      result.current.redo();
    });

    expect(result.current.strokesRef.current).toHaveLength(0);
  });

  it('adding new stroke clears redo stack', () => {
    const { result } = renderHook(() => useStrokeManager());

    act(() => {
      result.current.addStroke({ id: 1 });
      result.current.addStroke({ id: 2 });
      result.current.undo(); // stroke2 goes to redo
    });

    expect(result.current.redoStackRef.current).toHaveLength(1);

    act(() => {
      result.current.addStroke({ id: 3 }); // Should clear redo
    });

    expect(result.current.redoStackRef.current).toHaveLength(0);
    expect(result.current.strokesRef.current).toHaveLength(2);
  });

  it('clearRedoStack empties the redo array', () => {
    const { result } = renderHook(() => useStrokeManager());

    act(() => {
      result.current.addStroke({ id: 1 });
      result.current.undo();
    });

    expect(result.current.redoStackRef.current).toHaveLength(1);

    act(() => {
      result.current.clearRedoStack();
    });

    expect(result.current.redoStackRef.current).toHaveLength(0);
  });

  it('supports multiple undo/redo operations', () => {
    const { result } = renderHook(() => useStrokeManager());

    act(() => {
      result.current.addStroke({ id: 1 });
      result.current.addStroke({ id: 2 });
      result.current.addStroke({ id: 3 });
    });

    // Undo all
    act(() => {
      result.current.undo();
      result.current.undo();
      result.current.undo();
    });

    expect(result.current.strokesRef.current).toHaveLength(0);
    expect(result.current.redoStackRef.current).toHaveLength(3);

    // Redo all
    act(() => {
      result.current.redo();
      result.current.redo();
      result.current.redo();
    });

    expect(result.current.strokesRef.current).toHaveLength(3);
    expect(result.current.redoStackRef.current).toHaveLength(0);
  });

  // Tests for erase undo/redo
  it('deleteStrokes can be undone', () => {
    const { result } = renderHook(() => useStrokeManager());

    const stroke1 = { id: 1 };
    const stroke2 = { id: 2 };
    const stroke3 = { id: 3 };

    act(() => {
      result.current.addStroke(stroke1);
      result.current.addStroke(stroke2);
      result.current.addStroke(stroke3);
    });

    expect(result.current.strokesRef.current).toHaveLength(3);

    // Delete stroke at index 1 (stroke2)
    act(() => {
      result.current.deleteStrokes([1]);
    });

    expect(result.current.strokesRef.current).toHaveLength(2);
    expect(result.current.strokesRef.current[0]).toBe(stroke1);
    expect(result.current.strokesRef.current[1]).toBe(stroke3);

    // Undo the delete
    act(() => {
      result.current.undo();
    });

    expect(result.current.strokesRef.current).toHaveLength(3);
    expect(result.current.strokesRef.current[0]).toBe(stroke1);
    expect(result.current.strokesRef.current[1]).toBe(stroke2);
    expect(result.current.strokesRef.current[2]).toBe(stroke3);
  });

  it('deleteStrokes can be redone after undo', () => {
    const { result } = renderHook(() => useStrokeManager());

    const stroke1 = { id: 1 };
    const stroke2 = { id: 2 };

    act(() => {
      result.current.addStroke(stroke1);
      result.current.addStroke(stroke2);
    });

    // Delete stroke1
    act(() => {
      result.current.deleteStrokes([0]);
    });

    expect(result.current.strokesRef.current).toHaveLength(1);

    // Undo
    act(() => {
      result.current.undo();
    });

    expect(result.current.strokesRef.current).toHaveLength(2);

    // Redo the delete
    act(() => {
      result.current.redo();
    });

    expect(result.current.strokesRef.current).toHaveLength(1);
    expect(result.current.strokesRef.current[0]).toBe(stroke2);
  });

  it('clearCanvas can be undone', () => {
    const { result } = renderHook(() => useStrokeManager());

    const stroke1 = { id: 1 };
    const stroke2 = { id: 2 };

    act(() => {
      result.current.addStroke(stroke1);
      result.current.addStroke(stroke2);
    });

    // Clear canvas
    act(() => {
      result.current.clearCanvas();
    });

    expect(result.current.strokesRef.current).toHaveLength(0);

    // Undo clear
    act(() => {
      result.current.undo();
    });

    expect(result.current.strokesRef.current).toHaveLength(2);
    expect(result.current.strokesRef.current[0]).toEqual(stroke1);
    expect(result.current.strokesRef.current[1]).toEqual(stroke2);
  });

  it('mixed operations undo/redo correctly', () => {
    const { result } = renderHook(() => useStrokeManager());

    const stroke1 = { id: 1 };
    const stroke2 = { id: 2 };
    const stroke3 = { id: 3 };

    // Add strokes
    act(() => {
      result.current.addStroke(stroke1);
      result.current.addStroke(stroke2);
    });

    // Delete stroke1
    act(() => {
      result.current.deleteStrokes([0]);
    });

    // Add stroke3
    act(() => {
      result.current.addStroke(stroke3);
    });

    expect(result.current.strokesRef.current).toEqual([stroke2, stroke3]);

    // Undo add stroke3
    act(() => {
      result.current.undo();
    });

    expect(result.current.strokesRef.current).toEqual([stroke2]);

    // Undo delete stroke1
    act(() => {
      result.current.undo();
    });

    expect(result.current.strokesRef.current).toEqual([stroke1, stroke2]);

    // Redo delete stroke1
    act(() => {
      result.current.redo();
    });

    expect(result.current.strokesRef.current).toEqual([stroke2]);
  });
});

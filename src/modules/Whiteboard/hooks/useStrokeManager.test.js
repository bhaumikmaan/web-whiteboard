import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useStrokeManager from './useStrokeManager';

describe('useStrokeManager', () => {
  it('initializes with empty stroke arrays', () => {
    const { result } = renderHook(() => useStrokeManager());

    expect(result.current.strokesRef.current).toEqual([]);
    expect(result.current.redoRef.current).toEqual([]);
  });

  it('adds strokes and clears redo stack', () => {
    const { result } = renderHook(() => useStrokeManager());

    const stroke = { points: [{ x: 0, y: 0 }], color: 'red' };

    act(() => {
      result.current.addStroke(stroke);
    });

    expect(result.current.strokesRef.current).toHaveLength(1);
    expect(result.current.strokesRef.current[0]).toBe(stroke);
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
    expect(result.current.redoRef.current).toHaveLength(1);
    expect(result.current.redoRef.current[0]).toBe(stroke2);
  });

  it('redo moves stroke back from redo stack', () => {
    const { result } = renderHook(() => useStrokeManager());

    const stroke = { id: 1 };

    act(() => {
      result.current.addStroke(stroke);
      result.current.undo();
    });

    expect(result.current.strokesRef.current).toHaveLength(0);
    expect(result.current.redoRef.current).toHaveLength(1);

    act(() => {
      result.current.redo();
    });

    expect(result.current.strokesRef.current).toHaveLength(1);
    expect(result.current.strokesRef.current[0]).toBe(stroke);
    expect(result.current.redoRef.current).toHaveLength(0);
  });

  it('undo does nothing when strokes array is empty', () => {
    const { result } = renderHook(() => useStrokeManager());

    act(() => {
      result.current.undo();
    });

    expect(result.current.strokesRef.current).toHaveLength(0);
    expect(result.current.redoRef.current).toHaveLength(0);
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

    expect(result.current.redoRef.current).toHaveLength(1);

    act(() => {
      result.current.addStroke({ id: 3 }); // Should clear redo
    });

    expect(result.current.redoRef.current).toHaveLength(0);
    expect(result.current.strokesRef.current).toHaveLength(2);
  });

  it('clearRedoStack empties the redo array', () => {
    const { result } = renderHook(() => useStrokeManager());

    act(() => {
      result.current.addStroke({ id: 1 });
      result.current.undo();
    });

    expect(result.current.redoRef.current).toHaveLength(1);

    act(() => {
      result.current.clearRedoStack();
    });

    expect(result.current.redoRef.current).toHaveLength(0);
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
    expect(result.current.redoRef.current).toHaveLength(3);

    // Redo all
    act(() => {
      result.current.redo();
      result.current.redo();
      result.current.redo();
    });

    expect(result.current.strokesRef.current).toHaveLength(3);
    expect(result.current.redoRef.current).toHaveLength(0);
  });
});

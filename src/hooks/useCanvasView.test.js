import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useCanvasView from './useCanvasView';

describe('useCanvasView', () => {
  it('initializes with default view state', () => {
    const { result } = renderHook(() => useCanvasView());

    expect(result.current.viewRef.current).toEqual({
      panX: 0,
      panY: 0,
      scale: 1,
    });
  });

  it('converts screen to world coordinates correctly', () => {
    const { result } = renderHook(() => useCanvasView());

    // At default (no pan, scale 1)
    const world = result.current.screenToWorld(100, 200);
    expect(world).toEqual({ x: 100, y: 200 });
  });

  it('converts screen to world with pan offset', () => {
    const { result } = renderHook(() => useCanvasView());

    // Set pan offset
    result.current.viewRef.current.panX = 50;
    result.current.viewRef.current.panY = 100;

    const world = result.current.screenToWorld(150, 300);
    expect(world).toEqual({ x: 100, y: 200 });
  });

  it('converts screen to world with scale', () => {
    const { result } = renderHook(() => useCanvasView());

    // Set scale to 2x
    result.current.viewRef.current.scale = 2;

    const world = result.current.screenToWorld(200, 400);
    expect(world).toEqual({ x: 100, y: 200 });
  });

  it('converts screen to world with pan and scale', () => {
    const { result } = renderHook(() => useCanvasView());

    result.current.viewRef.current.panX = 100;
    result.current.viewRef.current.panY = 100;
    result.current.viewRef.current.scale = 2;

    // screen(300, 300) -> world((300-100)/2, (300-100)/2) = (100, 100)
    const world = result.current.screenToWorld(300, 300);
    expect(world).toEqual({ x: 100, y: 100 });
  });

  it('resets view to default state', () => {
    const { result } = renderHook(() => useCanvasView());

    // Modify view state
    result.current.viewRef.current.panX = 500;
    result.current.viewRef.current.panY = 300;
    result.current.viewRef.current.scale = 5;

    // Reset
    act(() => {
      result.current.resetView();
    });

    expect(result.current.viewRef.current).toEqual({
      panX: 0,
      panY: 0,
      scale: 1,
    });
  });
});

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import useCanvasSetup from './useCanvasSetup';

describe('useCanvasSetup', () => {
  let mockCanvas;
  let mockCtx;

  beforeEach(() => {
    mockCtx = {
      setTransform: vi.fn(),
    };

    mockCanvas = {
      getBoundingClientRect: () => ({ width: 800, height: 600 }),
      getContext: vi.fn(() => mockCtx),
      width: 0,
      height: 0,
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('initializes with null context', () => {
    const canvasRef = { current: null };
    const { result } = renderHook(() => useCanvasSetup(canvasRef));

    expect(result.current.ctxRef.current).toBeNull();
  });

  it('sets up canvas with correct dimensions', () => {
    const canvasRef = { current: mockCanvas };

    // Mock devicePixelRatio
    Object.defineProperty(window, 'devicePixelRatio', { value: 2, writable: true });

    renderHook(() => useCanvasSetup(canvasRef));

    // Canvas dimensions should be multiplied by DPR
    expect(mockCanvas.width).toBe(1600); // 800 * 2
    expect(mockCanvas.height).toBe(1200); // 600 * 2
  });

  it('sets transform based on devicePixelRatio', () => {
    const canvasRef = { current: mockCanvas };

    Object.defineProperty(window, 'devicePixelRatio', { value: 2, writable: true });

    renderHook(() => useCanvasSetup(canvasRef));

    expect(mockCtx.setTransform).toHaveBeenCalledWith(2, 0, 0, 2, 0, 0);
  });

  it('stores DPR in dprRef', () => {
    const canvasRef = { current: mockCanvas };

    Object.defineProperty(window, 'devicePixelRatio', { value: 3, writable: true });

    const { result } = renderHook(() => useCanvasSetup(canvasRef));

    expect(result.current.dprRef.current).toBe(3);
  });

  it('defaults to DPR of 1 when not available', () => {
    const canvasRef = { current: mockCanvas };

    Object.defineProperty(window, 'devicePixelRatio', { value: undefined, writable: true });

    const { result } = renderHook(() => useCanvasSetup(canvasRef));

    expect(result.current.dprRef.current).toBe(1);
  });

  it('stores context reference', () => {
    const canvasRef = { current: mockCanvas };

    const { result } = renderHook(() => useCanvasSetup(canvasRef));

    expect(result.current.ctxRef.current).toBe(mockCtx);
  });

  it('provides resizeCanvas function', () => {
    const canvasRef = { current: mockCanvas };

    const { result } = renderHook(() => useCanvasSetup(canvasRef));

    expect(typeof result.current.resizeCanvas).toBe('function');
  });
});

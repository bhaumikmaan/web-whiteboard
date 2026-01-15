import { describe, it, expect } from 'vitest';
import { TOOL_KINDS, DRAWING_TOOLS, DEFAULT_TOOL, isDrawingTool, getStrokeSize, getToolAlpha } from './tools';

describe('TOOL_KINDS', () => {
  it('has all expected tool types', () => {
    expect(TOOL_KINDS.SELECT).toBe('select');
    expect(TOOL_KINDS.PEN).toBe('pen');
    expect(TOOL_KINDS.MARKER).toBe('marker');
    expect(TOOL_KINDS.HIGHLIGHTER).toBe('highlighter');
    expect(TOOL_KINDS.ERASER).toBe('eraser');
  });
});

describe('DRAWING_TOOLS', () => {
  it('includes pen, marker, highlighter, eraser', () => {
    expect(DRAWING_TOOLS).toContain('pen');
    expect(DRAWING_TOOLS).toContain('marker');
    expect(DRAWING_TOOLS).toContain('highlighter');
    expect(DRAWING_TOOLS).toContain('eraser');
  });

  it('does not include select', () => {
    expect(DRAWING_TOOLS).not.toContain('select');
  });
});

describe('DEFAULT_TOOL', () => {
  it('defaults to pen with size 2', () => {
    expect(DEFAULT_TOOL.kind).toBe('pen');
    expect(DEFAULT_TOOL.size).toBe(2);
    expect(DEFAULT_TOOL.color).toBeUndefined();
  });
});

describe('isDrawingTool', () => {
  it('returns true for drawing tools', () => {
    expect(isDrawingTool('pen')).toBe(true);
    expect(isDrawingTool('marker')).toBe(true);
    expect(isDrawingTool('highlighter')).toBe(true);
    expect(isDrawingTool('eraser')).toBe(true);
  });

  it('returns false for non-drawing tools', () => {
    expect(isDrawingTool('select')).toBe(false);
    expect(isDrawingTool('unknown')).toBe(false);
  });
});

describe('getStrokeSize', () => {
  it('returns base size for pen', () => {
    expect(getStrokeSize('pen', 2)).toBe(2);
    expect(getStrokeSize('pen', 4)).toBe(4);
  });

  it('doubles size for marker with minimum 4', () => {
    expect(getStrokeSize('marker', 2)).toBe(4); // 2*2 = 4, min 4
    expect(getStrokeSize('marker', 4)).toBe(8); // 4*2 = 8
    expect(getStrokeSize('marker', 1)).toBe(4); // 1*2 = 2, clamped to min 4
  });

  it('multiplies by 6 for highlighter with minimum 10', () => {
    expect(getStrokeSize('highlighter', 2)).toBe(12); // 2*6 = 12
    expect(getStrokeSize('highlighter', 1)).toBe(10); // 1*6 = 6, clamped to min 10
  });

  it('multiplies by 6 for eraser with minimum 8', () => {
    expect(getStrokeSize('eraser', 2)).toBe(12); // 2*6 = 12
    expect(getStrokeSize('eraser', 1)).toBe(8); // 1*6 = 6, clamped to min 8
  });
});

describe('getToolAlpha', () => {
  it('returns 0.28 for highlighter', () => {
    expect(getToolAlpha('highlighter')).toBe(0.28);
  });

  it('returns 1 for other tools', () => {
    expect(getToolAlpha('pen')).toBe(1);
    expect(getToolAlpha('marker')).toBe(1);
    expect(getToolAlpha('eraser')).toBe(1);
  });
});

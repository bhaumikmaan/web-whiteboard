import { describe, it, expect } from 'vitest';
import { BRUSH_SIZES, DEFAULT_SIZE, MIN_SIZE, MAX_SIZE, getSwatchHeight } from './sizes';

describe('BRUSH_SIZES', () => {
  it('has expected size options', () => {
    expect(BRUSH_SIZES).toEqual([1, 2, 4, 6, 8, 12, 16]);
  });

  it('is sorted in ascending order', () => {
    const sorted = [...BRUSH_SIZES].sort((a, b) => a - b);
    expect(BRUSH_SIZES).toEqual(sorted);
  });
});

describe('DEFAULT_SIZE', () => {
  it('is 2', () => {
    expect(DEFAULT_SIZE).toBe(2);
  });

  it('is included in BRUSH_SIZES', () => {
    expect(BRUSH_SIZES).toContain(DEFAULT_SIZE);
  });
});

describe('size bounds', () => {
  it('MIN_SIZE matches first brush size', () => {
    expect(MIN_SIZE).toBe(BRUSH_SIZES[0]);
  });

  it('MAX_SIZE matches last brush size', () => {
    expect(MAX_SIZE).toBe(BRUSH_SIZES[BRUSH_SIZES.length - 1]);
  });
});

describe('getSwatchHeight', () => {
  it('returns at least 2 for visibility', () => {
    expect(getSwatchHeight(1)).toBe(2);
    expect(getSwatchHeight(0)).toBe(2);
  });

  it('returns actual size when >= 2', () => {
    expect(getSwatchHeight(2)).toBe(2);
    expect(getSwatchHeight(4)).toBe(4);
    expect(getSwatchHeight(16)).toBe(16);
  });
});

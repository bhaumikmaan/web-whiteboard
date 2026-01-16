import { describe, it, expect } from 'vitest';
import { STROKE_COLORS, DEFAULT_COLOR, getDefaultSwatchColor } from './colors';

describe('STROKE_COLORS', () => {
  it('has expected color options', () => {
    expect(STROKE_COLORS).toHaveLength(5);
    expect(STROKE_COLORS.map((c) => c.name)).toEqual(['Blue', 'Red', 'Green', 'Yellow', 'Pink']);
  });

  it('has css values for each color', () => {
    STROKE_COLORS.forEach((c) => {
      expect(c.css).toBeDefined();
      expect(typeof c.css).toBe('string');
    });
  });
});

describe('DEFAULT_COLOR', () => {
  it('is undefined (theme-based)', () => {
    expect(DEFAULT_COLOR).toBeUndefined();
  });
});

describe('getDefaultSwatchColor', () => {
  it('returns white for dark theme', () => {
    expect(getDefaultSwatchColor('dark')).toBe('#ffffff');
  });

  it('returns black for light theme', () => {
    expect(getDefaultSwatchColor('light')).toBe('#000000');
  });
});

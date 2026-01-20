import { describe, it, expect } from 'vitest';
import { clamp, getThemeColors } from './canvas';

describe('clamp', () => {
  it('returns value when within range', () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });

  it('returns min when value is below range', () => {
    expect(clamp(-5, 0, 10)).toBe(0);
  });

  it('returns max when value is above range', () => {
    expect(clamp(15, 0, 10)).toBe(10);
  });

  it('handles equal min and max', () => {
    expect(clamp(5, 5, 5)).toBe(5);
  });

  it('handles negative ranges', () => {
    expect(clamp(-5, -10, -1)).toBe(-5);
    expect(clamp(-15, -10, -1)).toBe(-10);
    expect(clamp(0, -10, -1)).toBe(-1);
  });

  it('handles decimal values', () => {
    expect(clamp(0.5, 0.1, 0.9)).toBe(0.5);
    expect(clamp(0.05, 0.1, 0.9)).toBe(0.1);
  });
});

describe('getThemeColors', () => {
  it('returns dark theme colors', () => {
    const colors = getThemeColors('dark');
    expect(colors.bg).toBe('#0f1115');
    expect(colors.grid).toBe('#2a2f3a');
    expect(colors.stroke).toBe('#e6e6e6');
  });

  it('returns light theme colors', () => {
    const colors = getThemeColors('light');
    expect(colors.bg).toBe('#ffffff');
    expect(colors.grid).toBe('#e6e6e6');
    expect(colors.stroke).toBe('#222222');
  });

  it('defaults to light theme for unknown values', () => {
    const colors = getThemeColors('unknown');
    expect(colors.bg).toBe('#ffffff');
  });
});

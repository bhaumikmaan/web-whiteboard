import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useTheme from './useTheme';

describe('useTheme', () => {
  let originalMatchMedia;

  beforeEach(() => {
    originalMatchMedia = window.matchMedia;

    // Mock matchMedia
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
    document.documentElement.removeAttribute('data-theme');
  });

  it('defaults to light theme when system prefers light', () => {
    window.matchMedia = vi.fn().mockImplementation(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe('light');
  });

  it('defaults to dark theme when system prefers dark', () => {
    window.matchMedia = vi.fn().mockImplementation(() => ({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe('dark');
  });

  it('sets data-theme attribute on document', () => {
    const { result } = renderHook(() => useTheme());

    expect(document.documentElement.getAttribute('data-theme')).toBe(result.current.theme);
  });

  it('toggleTheme switches between light and dark', () => {
    const { result } = renderHook(() => useTheme());

    const initialTheme = result.current.theme;

    act(() => {
      result.current.toggleTheme();
    });

    expect(result.current.theme).toBe(initialTheme === 'light' ? 'dark' : 'light');

    act(() => {
      result.current.toggleTheme();
    });

    expect(result.current.theme).toBe(initialTheme);
  });

  it('setTheme changes theme directly', () => {
    const { result } = renderHook(() => useTheme());

    act(() => {
      result.current.setTheme('dark');
    });

    expect(result.current.theme).toBe('dark');

    act(() => {
      result.current.setTheme('light');
    });

    expect(result.current.theme).toBe('light');
  });

  it('updates document attribute when theme changes', () => {
    const { result } = renderHook(() => useTheme());

    act(() => {
      result.current.setTheme('dark');
    });

    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');

    act(() => {
      result.current.setTheme('light');
    });

    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });
});

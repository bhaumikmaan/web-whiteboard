/**
 * Brush size options for the whiteboard
 */

export const BRUSH_SIZES = [1, 2, 4, 6, 8, 12, 16];

export const DEFAULT_SIZE = 2;

export const MIN_SIZE = 1;
export const MAX_SIZE = 16;

/**
 * Swatch display height (minimum 2px for visibility)
 */
export function getSwatchHeight(size) {
  return Math.max(2, size);
}

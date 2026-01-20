/**
 * Color palette definitions for the whiteboard
 */

export const STROKE_COLORS = [
  { name: 'Blue', css: 'blue' },
  { name: 'Red', css: 'red' },
  { name: 'Green', css: 'green' },
  { name: 'Yellow', css: 'yellow' },
  { name: 'Pink', css: 'pink' },
];

/**
 * Default stroke color (undefined = theme-based)
 */
export const DEFAULT_COLOR = undefined;

/**
 * Get the display color for "default" swatch based on theme
 */
export function getDefaultSwatchColor(theme) {
  return theme === 'dark' ? '#ffffff' : '#000000';
}

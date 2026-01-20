/**
 * Clamp a value between min and max
 * @param {number} v - Value to clamp
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number}
 */
export function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v));
}

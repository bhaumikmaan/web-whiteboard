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

/**
 * Draw infinite grid on canvas
 * @param {CanvasRenderingContext2D} ctx
 * @param {HTMLCanvasElement} canvas
 * @param {{ panX: number, panY: number, scale: number }} view
 * @param {{ grid: string }} themeColors
 * @param {number} gridSize - Grid cell size in world units (default 100)
 */
export function drawGrid(ctx, canvas, view, themeColors, gridSize = 100) {
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  const left = -view.panX / view.scale;
  const top = -view.panY / view.scale;
  const right = left + w / view.scale;
  const bottom = top + h / view.scale;

  ctx.save();
  ctx.lineWidth = 1 / Math.max(0.0001, view.scale);
  ctx.strokeStyle = themeColors.grid;
  ctx.beginPath();

  const startX = Math.floor(left / gridSize) * gridSize;
  const endX = Math.ceil(right / gridSize) * gridSize;
  const startY = Math.floor(top / gridSize) * gridSize;
  const endY = Math.ceil(bottom / gridSize) * gridSize;

  for (let x = startX; x <= endX; x += gridSize) {
    ctx.moveTo(x, startY);
    ctx.lineTo(x, endY);
  }
  for (let y = startY; y <= endY; y += gridSize) {
    ctx.moveTo(startX, y);
    ctx.lineTo(endX, y);
  }

  ctx.stroke();
  ctx.restore();
}

/**
 * Get theme colors based on current theme
 * @param {'light' | 'dark'} theme
 * @returns {{ bg: string, grid: string, stroke: string }}
 */
export function getThemeColors(theme) {
  return theme === 'dark'
    ? { bg: '#0f1115', grid: '#2a2f3a', stroke: '#e6e6e6' }
    : { bg: '#ffffff', grid: '#e6e6e6', stroke: '#222222' };
}

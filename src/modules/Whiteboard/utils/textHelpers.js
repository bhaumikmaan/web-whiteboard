/**
 * Text stroke rendering and hit detection utilities
 */

/**
 * Draw a text stroke on the canvas
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Object} s - Text stroke object
 * @param {Object} themeColors - Theme color configuration
 */
export function drawTextStroke(ctx, s, themeColors) {
  ctx.save();
  const fontSize = s.size || 32;
  const fontWeight = s.bold ? 'bold' : 'normal';
  const fontStyle = s.italic ? 'italic' : 'normal';
  const fontFamily = s.font || 'sans-serif';

  ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
  ctx.fillStyle = s.color || themeColors.stroke;
  ctx.textBaseline = 'top';
  ctx.textAlign = s.align || 'left';
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';

  const lines = s.text.split('\n');
  const lineHeight = fontSize * 1.2;

  lines.forEach((line, index) => {
    const y = s.y + index * lineHeight;
    const metrics = ctx.measureText(line);
    let startX = s.x;
    if (s.align === 'center') startX -= metrics.width / 2;
    if (s.align === 'right') startX -= metrics.width;

    // Draw highlight/background color first
    if (s.highlightColor) {
      ctx.fillStyle = s.highlightColor;
      ctx.fillRect(startX - 2, y - 2, metrics.width + 4, fontSize + 4);
      ctx.fillStyle = s.color || themeColors.stroke;
    }

    // Draw text
    ctx.fillText(line, s.x, y);

    // Draw underline
    if (s.underline) {
      const underlineY = y + fontSize * 0.9;
      ctx.strokeStyle = ctx.fillStyle;
      ctx.lineWidth = Math.max(1, fontSize * 0.05);
      ctx.beginPath();
      ctx.moveTo(startX, underlineY);
      ctx.lineTo(startX + metrics.width, underlineY);
      ctx.stroke();
    }

    // Draw strikethrough
    if (s.strikethrough) {
      const strikeY = y + fontSize * 0.5;
      ctx.strokeStyle = ctx.fillStyle;
      ctx.lineWidth = Math.max(1, fontSize * 0.05);
      ctx.beginPath();
      ctx.moveTo(startX, strikeY);
      ctx.lineTo(startX + metrics.width, strikeY);
      ctx.stroke();
    }
  });

  ctx.restore();
}

/**
 * Find text stroke at world coordinates
 * @param {number} wx - World X coordinate
 * @param {number} wy - World Y coordinate
 * @param {Object} strokesRef - Ref containing strokes array
 * @returns {number} Index of text stroke or -1 if not found
 */
export function getTextAt(wx, wy, strokesRef) {
  for (let i = strokesRef.current.length - 1; i >= 0; i--) {
    const stroke = strokesRef.current[i];
    if (stroke.mode === 'text') {
      const fontSize = stroke.size || 32;
      const lineHeight = fontSize * 1.2;
      const lines = stroke.text.split('\n');
      const maxLineWidth = Math.max(...lines.map((line) => line.length * fontSize * 0.6));
      const textHeight = lines.length * lineHeight;

      let minX = stroke.x;
      let maxX = stroke.x + maxLineWidth;

      // Adjust bounds based on alignment
      if (stroke.align === 'center') {
        minX = stroke.x - maxLineWidth / 2;
        maxX = stroke.x + maxLineWidth / 2;
      } else if (stroke.align === 'right') {
        minX = stroke.x - maxLineWidth;
        maxX = stroke.x;
      }

      if (wx >= minX && wx <= maxX && wy >= stroke.y && wy <= stroke.y + textHeight) {
        return i;
      }
    }
  }
  return -1;
}

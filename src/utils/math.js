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
 * Calculate distance from a point to a line segment
 * @param {number} px - Point X
 * @param {number} py - Point Y
 * @param {number} x1 - Segment start X
 * @param {number} y1 - Segment start Y
 * @param {number} x2 - Segment end X
 * @param {number} y2 - Segment end Y
 * @returns {number} Distance from point to nearest point on segment
 */
export function distanceToSegment(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lengthSquared = dx * dx + dy * dy;

  if (lengthSquared === 0) {
    return Math.hypot(px - x1, py - y1);
  }

  let t = ((px - x1) * dx + (py - y1) * dy) / lengthSquared;
  t = Math.max(0, Math.min(1, t));

  const nearestX = x1 + t * dx;
  const nearestY = y1 + t * dy;

  return Math.hypot(px - nearestX, py - nearestY);
}

/**
 * Check if a point is within threshold distance of any part of a stroke path
 * @param {number} px - Point X
 * @param {number} py - Point Y
 * @param {object} stroke - Stroke object with points array
 * @param {number} threshold - Distance threshold
 * @returns {boolean} True if point is near the stroke
 */
export function isPointNearStroke(px, py, stroke, threshold) {
  if (!stroke.points || stroke.points.length === 0) return false;
  if (stroke.mode === 'image') return false;

  // Check each point
  for (let i = 0; i < stroke.points.length; i++) {
    const pt = stroke.points[i];
    const dx = px - pt.x;
    const dy = py - pt.y;
    if (dx * dx + dy * dy <= threshold * threshold) {
      return true;
    }
  }

  // Check line segments between points
  for (let i = 0; i < stroke.points.length - 1; i++) {
    const p1 = stroke.points[i];
    const p2 = stroke.points[i + 1];
    if (distanceToSegment(px, py, p1.x, p1.y, p2.x, p2.y) <= threshold) {
      return true;
    }
  }

  return false;
}

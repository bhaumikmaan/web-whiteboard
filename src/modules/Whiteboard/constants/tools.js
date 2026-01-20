/**
 * Tool type definitions for the whiteboard
 */

export const TOOL_KINDS = {
  SELECT: 'select',
  PEN: 'pen',
  MARKER: 'marker',
  HIGHLIGHTER: 'highlighter',
  ERASER: 'eraser',
  STROKE_ERASER: 'stroke_eraser',
};

/**
 * Eraser modes for the eraser tool dropdown
 */
export const ERASER_MODES = {
  PIXEL: 'eraser', // Original pixel-based eraser
  STROKE: 'stroke_eraser', // Erases entire strokes on touch
};

export const PEN_TOOLS = [TOOL_KINDS.PEN, TOOL_KINDS.MARKER, TOOL_KINDS.HIGHLIGHTER];

export const ERASER_TOOLS = [TOOL_KINDS.ERASER, TOOL_KINDS.STROKE_ERASER];

export const DRAWING_TOOLS = [...PEN_TOOLS, ...ERASER_TOOLS];

/**
 * Pen style options (eraser removed - now separate)
 */
export const TOOL_OPTIONS = [
  { key: TOOL_KINDS.PEN, label: 'Pen', icon: '🖊' },
  { key: TOOL_KINDS.MARKER, label: 'Marker', icon: '🖍' },
  { key: TOOL_KINDS.HIGHLIGHTER, label: 'Highlighter', icon: '🖌' },
];

/**
 * Eraser options for the eraser dropdown
 */
export const ERASER_OPTIONS = [
  { key: ERASER_MODES.PIXEL, label: 'Pixel Eraser', icon: '⌫', description: 'Erase pixels where you draw' },
  { key: ERASER_MODES.STROKE, label: 'Stroke Eraser', icon: '🧹', description: 'Erase entire strokes on touch' },
];

/**
 * Check if a tool kind is a pen tool (not eraser)
 */
export function isPenTool(kind) {
  return PEN_TOOLS.includes(kind);
}

/**
 * Check if a tool kind is an eraser tool
 */
export function isEraserTool(kind) {
  return ERASER_TOOLS.includes(kind);
}

/**
 * Tool-specific size multipliers
 */
export const TOOL_SIZE_MULTIPLIERS = {
  [TOOL_KINDS.PEN]: 1,
  [TOOL_KINDS.MARKER]: 2,
  [TOOL_KINDS.HIGHLIGHTER]: 6,
  [TOOL_KINDS.ERASER]: 6,
  [TOOL_KINDS.STROKE_ERASER]: 4,
};

/**
 * Tool-specific minimum sizes
 */
export const TOOL_MIN_SIZES = {
  [TOOL_KINDS.PEN]: 1,
  [TOOL_KINDS.MARKER]: 4,
  [TOOL_KINDS.HIGHLIGHTER]: 10,
  [TOOL_KINDS.ERASER]: 8,
  [TOOL_KINDS.STROKE_ERASER]: 12,
};

/**
 * Tool-specific alpha values
 */
export const TOOL_ALPHAS = {
  [TOOL_KINDS.HIGHLIGHTER]: 0.28,
  default: 1,
};

/**
 * Default tool state
 */
export const DEFAULT_TOOL = {
  kind: TOOL_KINDS.PEN,
  size: 2,
  color: undefined,
};

/**
 * Check if a tool kind is a drawing tool
 */
export function isDrawingTool(kind) {
  return DRAWING_TOOLS.includes(kind);
}

/**
 * Get computed stroke size for a tool
 */
export function getStrokeSize(toolKind, baseSize) {
  const multiplier = TOOL_SIZE_MULTIPLIERS[toolKind] || 1;
  const minSize = TOOL_MIN_SIZES[toolKind] || 1;
  return Math.max(minSize, baseSize * multiplier);
}

/**
 * Get alpha for a tool
 */
export function getToolAlpha(toolKind) {
  return TOOL_ALPHAS[toolKind] ?? TOOL_ALPHAS.default;
}

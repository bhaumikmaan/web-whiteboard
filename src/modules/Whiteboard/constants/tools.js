/**
 * Tool type definitions for the whiteboard
 */

export const TOOL_KINDS = {
  SELECT: 'select',
  PEN: 'pen',
  MARKER: 'marker',
  HIGHLIGHTER: 'highlighter',
  ERASER: 'eraser',
};

export const DRAWING_TOOLS = [TOOL_KINDS.PEN, TOOL_KINDS.MARKER, TOOL_KINDS.HIGHLIGHTER, TOOL_KINDS.ERASER];

export const TOOL_OPTIONS = [
  { key: TOOL_KINDS.PEN, label: 'Pen', icon: '🖊' },
  { key: TOOL_KINDS.MARKER, label: 'Marker', icon: '🖍' },
  { key: TOOL_KINDS.HIGHLIGHTER, label: 'Highlighter', icon: '🖌' },
  { key: TOOL_KINDS.ERASER, label: 'Eraser', icon: '⌫' },
];

/**
 * Tool-specific size multipliers
 */
export const TOOL_SIZE_MULTIPLIERS = {
  [TOOL_KINDS.PEN]: 1,
  [TOOL_KINDS.MARKER]: 2,
  [TOOL_KINDS.HIGHLIGHTER]: 6,
  [TOOL_KINDS.ERASER]: 6,
};

/**
 * Tool-specific minimum sizes
 */
export const TOOL_MIN_SIZES = {
  [TOOL_KINDS.PEN]: 1,
  [TOOL_KINDS.MARKER]: 4,
  [TOOL_KINDS.HIGHLIGHTER]: 10,
  [TOOL_KINDS.ERASER]: 8,
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

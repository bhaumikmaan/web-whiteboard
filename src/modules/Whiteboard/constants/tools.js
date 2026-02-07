/**
 * Tool type definitions for the whiteboard
 */

export const TOOL_KINDS = {
  SELECT: 'select',
  PEN: 'pen',
  MARKER: 'marker',
  HIGHLIGHTER: 'highlighter',
  ERASER: 'eraser',
  TEXT: 'text',
};

export const DRAWING_TOOLS = [TOOL_KINDS.PEN, TOOL_KINDS.MARKER, TOOL_KINDS.HIGHLIGHTER, TOOL_KINDS.ERASER];

export const TOOL_OPTIONS = [
  { key: TOOL_KINDS.PEN, label: 'Pen', icon: 'penTool' },
  { key: TOOL_KINDS.MARKER, label: 'Marker', icon: 'marker' },
  { key: TOOL_KINDS.HIGHLIGHTER, label: 'Highlighter', icon: 'highlighter' },
  { key: TOOL_KINDS.ERASER, label: 'Eraser', icon: 'eraser' },
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
 * Text size range (in px)
 */
export const TEXT_SIZE_MIN = 8;
export const TEXT_SIZE_MAX = 288;
export const TEXT_SIZE_STEP = 4;

/**
 * Common text sizes for dropdown
 */
export const COMMON_TEXT_SIZES = [12, 18, 24, 36, 48, 64, 80, 144, 288];

/**
 * Text alignment options
 */
export const TEXT_ALIGNMENTS = [
  { value: 'left', label: 'Left', icon: 'alignLeft' },
  { value: 'center', label: 'Center', icon: 'alignCenter' },
  { value: 'right', label: 'Right', icon: 'alignRight' },
];

/**
 * Text style options
 */
export const TEXT_STYLES = {
  BOLD: 'bold',
  ITALIC: 'italic',
  UNDERLINE: 'underline',
  STRIKETHROUGH: 'strikethrough',
};

/**
 * Font families
 */
export const FONT_FAMILIES = [
  { value: 'sans-serif', label: 'Sans Serif' },
  { value: 'serif', label: 'Serif' },
  { value: 'monospace', label: 'Monospace' },
  { value: 'cursive', label: 'Cursive' },
  { value: 'fantasy', label: 'Fantasy' },
  { value: 'Arial', label: 'Arial' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Times New Roman', label: 'Times New Roman' },
  { value: 'Courier New', label: 'Courier New' },
  { value: 'Verdana', label: 'Verdana' },
];

/**
 * Default tool state
 */
export const DEFAULT_TOOL = {
  kind: TOOL_KINDS.PEN,
  size: 2,
  color: undefined,
  textSize: 32,
  textAlign: 'left',
  textBold: false,
  textItalic: false,
  textUnderline: false,
  textStrikethrough: false,
  textFont: 'sans-serif',
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

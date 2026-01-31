import React from 'react';
import { TOOL_KINDS } from '../constants/tools';

/**
 * Custom hook for managing text editing state and operations
 */
export default function useTextEditor({ tool, onToolChange, strokesRef, clearRedoStack }) {
  const [textEdit, setTextEdit] = React.useState(null);
  const textInputRef = React.useRef(null);
  const textEditingRef = React.useRef(false);

  // Custom color state for pickers
  const [customTextColor, setCustomTextColor] = React.useState('#6366f1');
  const [customHighlightColor, setCustomHighlightColor] = React.useState('#fbbf24');
  const textColorInputRef = React.useRef(null);
  const highlightColorInputRef = React.useRef(null);

  // Menu visibility state
  const [showAlignMenu, setShowAlignMenu] = React.useState(false);
  const [showStyleMenu, setShowStyleMenu] = React.useState(false);
  const [showFontMenu, setShowFontMenu] = React.useState(false);
  const [showSizeMenu, setShowSizeMenu] = React.useState(false);
  const [showColorMenu, setShowColorMenu] = React.useState(false);
  const [showHighlightMenu, setShowHighlightMenu] = React.useState(false);

  // Close all menus
  const closeAllMenus = React.useCallback(() => {
    setShowAlignMenu(false);
    setShowStyleMenu(false);
    setShowFontMenu(false);
    setShowSizeMenu(false);
    setShowColorMenu(false);
    setShowHighlightMenu(false);
  }, []);

  // Save text as a stroke (updates existing or creates new)
  const saveTextStroke = React.useCallback(() => {
    if (!textEdit || !textEdit.text.trim()) return;

    const textStroke = {
      mode: 'text',
      text: textEdit.text,
      x: textEdit.worldX,
      y: textEdit.worldY,
      size: textEdit.size,
      color: textEdit.color,
      highlightColor: textEdit.highlightColor,
      align: textEdit.align,
      bold: textEdit.bold,
      italic: textEdit.italic,
      underline: textEdit.underline,
      strikethrough: textEdit.strikethrough,
      font: textEdit.font,
    };

    if (textEdit.strokeIndex !== undefined) {
      // Update existing stroke
      strokesRef.current[textEdit.strokeIndex] = textStroke;
    } else {
      // Create new stroke
      clearRedoStack();
      strokesRef.current.push(textStroke);
    }
  }, [textEdit, clearRedoStack, strokesRef]);

  // Close text editor and update tool settings for next text
  const closeTextEditor = React.useCallback(() => {
    saveTextStroke();

    // Update tool settings for future texts only if creating NEW text (not editing existing)
    if (textEdit && !textEdit.isEditing && onToolChange) {
      onToolChange((prev) => ({
        ...prev,
        textSize: textEdit.size,
        textColor: textEdit.color,
        textHighlight: textEdit.highlightColor,
        textAlign: textEdit.align,
        textBold: textEdit.bold,
        textItalic: textEdit.italic,
        textUnderline: textEdit.underline,
        textStrikethrough: textEdit.strikethrough,
        textFont: textEdit.font,
      }));
    }

    setTextEdit(null);
    closeAllMenus();
    textEditingRef.current = false;
  }, [saveTextStroke, textEdit, onToolChange, closeAllMenus]);

  // Start editing text
  const startTextEdit = React.useCallback((config) => {
    setTextEdit(config);
    textEditingRef.current = true;
  }, []);

  // Handle text input key events
  const handleTextKeyDown = React.useCallback(
    (e) => {
      if (e.key === 'Escape') {
        closeTextEditor();
      } else if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        closeTextEditor();
      }
    },
    [closeTextEditor]
  );

  // Custom color picker handlers
  const handleCustomTextColorClick = React.useCallback((e) => {
    e.stopPropagation();
    textColorInputRef.current?.click();
  }, []);

  const handleCustomTextColorChange = React.useCallback((e) => {
    e.stopPropagation();
    const newColor = e.target.value;
    setCustomTextColor(newColor);
    setTextEdit((prev) => ({ ...prev, color: newColor }));
  }, []);

  const handleCustomHighlightColorClick = React.useCallback((e) => {
    e.stopPropagation();
    highlightColorInputRef.current?.click();
  }, []);

  const handleCustomHighlightColorChange = React.useCallback((e) => {
    e.stopPropagation();
    const newColor = e.target.value;
    setCustomHighlightColor(newColor);
    setTextEdit((prev) => ({ ...prev, highlightColor: newColor }));
  }, []);

  // Focus text input when text edit starts
  React.useEffect(() => {
    if (textEdit && textInputRef.current) {
      setTimeout(() => {
        textInputRef.current?.focus();
      }, 0);
    }
  }, [textEdit]);

  // Auto-close text editor when tool changes away from TEXT
  React.useEffect(() => {
    if (textEdit && tool?.kind !== TOOL_KINDS.TEXT) {
      closeTextEditor();
    }
  }, [tool?.kind, textEdit, closeTextEditor]);

  return {
    // State
    textEdit,
    setTextEdit,
    textEditingRef,
    textInputRef,

    // Custom colors
    customTextColor,
    customHighlightColor,
    textColorInputRef,
    highlightColorInputRef,

    // Menu visibility
    showAlignMenu,
    setShowAlignMenu,
    showStyleMenu,
    setShowStyleMenu,
    showFontMenu,
    setShowFontMenu,
    showSizeMenu,
    setShowSizeMenu,
    showColorMenu,
    setShowColorMenu,
    showHighlightMenu,
    setShowHighlightMenu,
    closeAllMenus,

    // Actions
    startTextEdit,
    closeTextEditor,
    handleTextKeyDown,
    handleCustomTextColorClick,
    handleCustomTextColorChange,
    handleCustomHighlightColorClick,
    handleCustomHighlightColorChange,
  };
}

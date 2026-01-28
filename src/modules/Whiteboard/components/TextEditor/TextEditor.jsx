import React from 'react';
import styles from './TextEditor.module.css';
import toolbarStyles from '../TextToolbar/TextToolbar.module.css';
import TextToolbar from '../TextToolbar';

export default function TextEditor({
  textEdit,
  setTextEdit,
  textInputRef,
  handleTextKeyDown,
  closeTextEditor,
  canvasRef,
  viewRef,
  theme,
  themeColors,
  // Menu states
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
  // Custom colors
  customTextColor,
  customHighlightColor,
  textColorInputRef,
  highlightColorInputRef,
  handleCustomTextColorClick,
  handleCustomTextColorChange,
  handleCustomHighlightColorClick,
  handleCustomHighlightColorChange,
}) {
  // Track textarea dimensions for resizing
  const [textareaWidth, setTextareaWidth] = React.useState(null);
  const [textareaHeight, setTextareaHeight] = React.useState(null);
  const resizeRef = React.useRef({ isResizing: false, startX: 0, startY: 0, startWidth: 0, startHeight: 0 });

  // Close menus when clicking outside toolbar
  React.useEffect(() => {
    const closeAllMenus = () => {
      setShowAlignMenu(false);
      setShowStyleMenu(false);
      setShowFontMenu(false);
      setShowSizeMenu(false);
      setShowColorMenu(false);
      setShowHighlightMenu(false);
    };

    const handleClickOutside = (e) => {
      if (!textEdit) return;
      const target = e.target;
      if (!target.closest(`.${toolbarStyles.textToolbar}`)) {
        closeAllMenus();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [
    textEdit,
    setShowAlignMenu,
    setShowStyleMenu,
    setShowFontMenu,
    setShowSizeMenu,
    setShowColorMenu,
    setShowHighlightMenu,
  ]);

  // Handle resize
  const handleResizeStart = (e) => {
    e.stopPropagation();
    e.preventDefault();

    const textarea = textInputRef.current;
    if (!textarea) return;

    const rect = textarea.getBoundingClientRect();
    resizeRef.current = {
      isResizing: true,
      startX: e.clientX,
      startY: e.clientY,
      startWidth: rect.width,
      startHeight: rect.height,
    };
  };

  React.useEffect(() => {
    const handleResizeMove = (e) => {
      if (!resizeRef.current.isResizing) return;

      const deltaX = e.clientX - resizeRef.current.startX;
      const deltaY = e.clientY - resizeRef.current.startY;

      const newWidth = Math.max(200, Math.min(800, resizeRef.current.startWidth + deltaX));
      const newHeight = Math.max(40, resizeRef.current.startHeight + deltaY);

      setTextareaWidth(newWidth);
      setTextareaHeight(newHeight);
    };

    const handleResizeEnd = () => {
      if (resizeRef.current.isResizing) {
        resizeRef.current.isResizing = false;
      }
    };

    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeEnd);

    return () => {
      document.removeEventListener('mousemove', handleResizeMove);
      document.removeEventListener('mouseup', handleResizeEnd);
    };
  }, []);

  if (!textEdit) return null;

  const canvas = canvasRef.current;
  if (!canvas) return null;

  const canvasRect = canvas.getBoundingClientRect();
  const { panX, panY, scale } = viewRef.current;

  // Calculate text input position
  let screenX = textEdit.worldX * scale + panX;
  let screenY = textEdit.worldY * scale + panY;
  const fontSize = (textEdit.size || 32) * scale;

  const maxWidth = 800;
  const minWidth = 200;
  const estimatedHeight = fontSize * 2;

  // Keep within horizontal bounds
  if (screenX + minWidth > canvasRect.width) {
    screenX = Math.max(0, canvasRect.width - minWidth);
  }
  if (screenX < 0) {
    screenX = 0;
  }

  // Keep within vertical bounds
  if (screenY + estimatedHeight > canvasRect.height) {
    screenY = Math.max(0, canvasRect.height - estimatedHeight);
  }
  if (screenY < 0) {
    screenY = 0;
  }

  // Calculate default dimensions if not manually resized
  const isMobile = window.innerWidth < 768;
  const defaultWidth = isMobile ? 200 : 450; // Match toolbar width on desktop
  const defaultHeight = Math.max(60, fontSize * 1.5 + 16);

  const textInputStyle = {
    position: 'absolute',
    left: `${screenX}px`,
    top: `${screenY}px`,
    fontSize: `${fontSize}px`,
    color: textEdit.color || themeColors.stroke,
    backgroundColor: textEdit.highlightColor || 'transparent',
    textAlign: textEdit.align || 'left',
    fontWeight: textEdit.bold ? 'bold' : 'normal',
    fontStyle: textEdit.italic ? 'italic' : 'normal',
    textDecoration: `${textEdit.underline ? 'underline' : ''} ${textEdit.strikethrough ? 'line-through' : ''}`.trim(),
    fontFamily: textEdit.font || 'sans-serif',
    transformOrigin: 'top left',
    lineHeight: '1.2',
    width: textareaWidth ? `${textareaWidth}px` : `${defaultWidth}px`,
    height: textareaHeight ? `${textareaHeight}px` : `${defaultHeight}px`,
    maxWidth: `${Math.min(maxWidth, canvasRect.width - screenX)}px`,
    minWidth: '200px',
    minHeight: '60px',
  };

  // Calculate toolbar position
  let toolbarX = textEdit.worldX * scale + panX;
  let toolbarY = textEdit.worldY * scale + panY - 50;

  const toolbarWidth = isMobile ? 60 : 450;
  const toolbarHeight = isMobile ? 300 : 50;
  const toolbarMinX = 10;
  const toolbarMinY = 10;

  if (isMobile) {
    toolbarX = canvasRect.width - toolbarWidth - 10;
    toolbarY = 70;
    if (toolbarY + toolbarHeight > canvasRect.height) {
      toolbarY = Math.max(70, canvasRect.height - toolbarHeight - 10);
    }
  } else {
    if (toolbarX + toolbarWidth > canvasRect.width) {
      toolbarX = canvasRect.width - toolbarWidth - 10;
    }
    if (toolbarX < toolbarMinX) {
      toolbarX = toolbarMinX;
    }
    if (toolbarY < toolbarMinY) {
      toolbarY = textEdit.worldY * scale + panY + 10;
    }
    if (toolbarY + toolbarHeight > canvasRect.height) {
      toolbarY = canvasRect.height - toolbarHeight - 10;
    }
    if (toolbarY < toolbarMinY) {
      toolbarY = toolbarMinY;
    }
  }

  return (
    <div className={styles.textEditorContainer}>
      <TextToolbar
        textEdit={textEdit}
        setTextEdit={setTextEdit}
        textInputRef={textInputRef}
        theme={theme}
        showAlignMenu={showAlignMenu}
        setShowAlignMenu={setShowAlignMenu}
        showStyleMenu={showStyleMenu}
        setShowStyleMenu={setShowStyleMenu}
        showFontMenu={showFontMenu}
        setShowFontMenu={setShowFontMenu}
        showSizeMenu={showSizeMenu}
        setShowSizeMenu={setShowSizeMenu}
        showColorMenu={showColorMenu}
        setShowColorMenu={setShowColorMenu}
        showHighlightMenu={showHighlightMenu}
        setShowHighlightMenu={setShowHighlightMenu}
        customTextColor={customTextColor}
        customHighlightColor={customHighlightColor}
        textColorInputRef={textColorInputRef}
        highlightColorInputRef={highlightColorInputRef}
        handleCustomTextColorClick={handleCustomTextColorClick}
        handleCustomTextColorChange={handleCustomTextColorChange}
        handleCustomHighlightColorClick={handleCustomHighlightColorClick}
        handleCustomHighlightColorChange={handleCustomHighlightColorChange}
        toolbarX={toolbarX}
        toolbarY={toolbarY}
      />

      <div className={styles.textareaWrapper} style={textInputStyle}>
        <textarea
          ref={textInputRef}
          className={styles.textInput}
          value={textEdit.text}
          onChange={(e) => setTextEdit((prev) => ({ ...prev, text: e.target.value }))}
          onKeyDown={handleTextKeyDown}
          onPointerDown={(e) => e.stopPropagation()}
          placeholder="Type text..."
          rows={1}
        />

        <div className={styles.resizeHandleGrip} onMouseDown={handleResizeStart} />
      </div>

      <button
        className={styles.textSaveBtn}
        style={{
          position: 'absolute',
          left: `${screenX}px`,
          top: `${screenY + (textareaHeight || defaultHeight) + 8}px`,
        }}
        onMouseDown={(e) => e.preventDefault()}
        onClick={closeTextEditor}
      >
        Save
      </button>
    </div>
  );
}

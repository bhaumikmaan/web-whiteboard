import styles from './TextToolbar.module.css';
import { Icon } from '@/components/Icons';
import {
  TEXT_ALIGNMENTS,
  FONT_FAMILIES,
  TEXT_SIZE_MIN,
  TEXT_SIZE_MAX,
  TEXT_SIZE_STEP,
  COMMON_TEXT_SIZES,
} from '../../constants/tools';
import { STROKE_COLORS, getDefaultSwatchColor } from '../../constants/colors';

export default function TextToolbar({
  textEdit,
  setTextEdit,
  textInputRef,
  theme,

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

  // Custom colors
  customTextColor,
  customHighlightColor,
  textColorInputRef,
  highlightColorInputRef,
  handleCustomTextColorClick,
  handleCustomTextColorChange,
  handleCustomHighlightColorClick,
  handleCustomHighlightColorChange,

  // Position
  toolbarX,
  toolbarY,
}) {
  const closeOtherMenus = (keepMenu) => {
    if (keepMenu !== 'font') setShowFontMenu(false);
    if (keepMenu !== 'size') setShowSizeMenu(false);
    if (keepMenu !== 'style') setShowStyleMenu(false);
    if (keepMenu !== 'align') setShowAlignMenu(false);
    if (keepMenu !== 'color') setShowColorMenu(false);
    if (keepMenu !== 'highlight') setShowHighlightMenu(false);
  };

  return (
    <div
      className={styles.textToolbar}
      style={{
        position: 'absolute',
        left: `${toolbarX}px`,
        top: `${toolbarY}px`,
      }}
      onPointerDown={(e) => e.stopPropagation()}
    >
      {/* Font Selector */}
      <div className={styles.textToolbarGroup}>
        <button
          className={styles.textToolbarBtn}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            setShowFontMenu(!showFontMenu);
            closeOtherMenus('font');
          }}
          title="Font family"
        >
          Aa
        </button>
        {showFontMenu && (
          <div className={styles.textToolbarMenu}>
            {FONT_FAMILIES.map((font) => (
              <button
                key={font.value}
                className={`${styles.textToolbarMenuItem} ${textEdit.font === font.value ? styles.active : ''}`}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  setTextEdit((prev) => ({ ...prev, font: font.value }));
                  setShowFontMenu(false);
                  textInputRef.current?.focus();
                }}
                style={{ fontFamily: font.value }}
              >
                {font.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Font Size */}
      <div className={styles.textToolbarGroup}>
        <button
          className={`${styles.textToolbarBtn} ${styles.hideOnMobile}`}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            const newSize = Math.max(TEXT_SIZE_MIN, textEdit.size - TEXT_SIZE_STEP);
            setTextEdit((prev) => ({ ...prev, size: newSize }));
            textInputRef.current?.focus();
          }}
          title="Decrease font size"
        >
          -
        </button>
        <div style={{ position: 'relative' }}>
          <button
            className={styles.textToolbarBtn}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              setShowSizeMenu(!showSizeMenu);
              closeOtherMenus('size');
            }}
            title={`Font size: ${textEdit.size}px`}
            style={{ minWidth: '50px' }}
          >
            {textEdit.size}
          </button>
          {showSizeMenu && (
            <div className={styles.textToolbarMenu}>
              {COMMON_TEXT_SIZES.map((size) => (
                <button
                  key={size}
                  className={`${styles.textToolbarMenuItem} ${textEdit.size === size ? styles.active : ''}`}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    setTextEdit((prev) => ({ ...prev, size }));
                    setShowSizeMenu(false);
                    textInputRef.current?.focus();
                  }}
                >
                  {size}px
                </button>
              ))}
            </div>
          )}
        </div>
        <button
          className={`${styles.textToolbarBtn} ${styles.hideOnMobile}`}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            const newSize = Math.min(TEXT_SIZE_MAX, textEdit.size + TEXT_SIZE_STEP);
            setTextEdit((prev) => ({ ...prev, size: newSize }));
            textInputRef.current?.focus();
          }}
          title="Increase font size"
        >
          +
        </button>
      </div>

      {/* Text Style (Bold, Italic, etc.) */}
      <div className={styles.textToolbarGroup}>
        <button
          className={styles.textToolbarBtn}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            setShowStyleMenu(!showStyleMenu);
            closeOtherMenus('style');
          }}
          title="Text style"
        >
          B
        </button>
        {showStyleMenu && (
          <div className={styles.textToolbarMenu}>
            <button
              className={`${styles.textToolbarMenuItem} ${textEdit.bold ? styles.active : ''}`}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                setTextEdit((prev) => ({ ...prev, bold: !prev.bold }));
                textInputRef.current?.focus();
              }}
            >
              <strong>B</strong> Bold
            </button>
            <button
              className={`${styles.textToolbarMenuItem} ${textEdit.italic ? styles.active : ''}`}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                setTextEdit((prev) => ({ ...prev, italic: !prev.italic }));
                textInputRef.current?.focus();
              }}
            >
              <em>I</em> Italic
            </button>
            <button
              className={`${styles.textToolbarMenuItem} ${textEdit.underline ? styles.active : ''}`}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                setTextEdit((prev) => ({ ...prev, underline: !prev.underline }));
                textInputRef.current?.focus();
              }}
            >
              <u>U</u> Underline
            </button>
            <button
              className={`${styles.textToolbarMenuItem} ${textEdit.strikethrough ? styles.active : ''}`}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                setTextEdit((prev) => ({ ...prev, strikethrough: !prev.strikethrough }));
                textInputRef.current?.focus();
              }}
            >
              <s>S</s> Strikethrough
            </button>
          </div>
        )}
      </div>

      {/* Text Alignment */}
      <div className={styles.textToolbarGroup}>
        <button
          className={styles.textToolbarBtn}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            setShowAlignMenu(!showAlignMenu);
            closeOtherMenus('align');
          }}
          title="Text alignment"
        >
          <Icon name={TEXT_ALIGNMENTS.find((a) => a.value === textEdit.align)?.icon || 'alignLeft'} />
        </button>
        {showAlignMenu && (
          <div className={styles.textToolbarMenu}>
            {TEXT_ALIGNMENTS.map((align) => (
              <button
                key={align.value}
                className={`${styles.textToolbarMenuItem} ${textEdit.align === align.value ? styles.active : ''}`}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  setTextEdit((prev) => ({ ...prev, align: align.value }));
                  setShowAlignMenu(false);
                  textInputRef.current?.focus();
                }}
              >
                <Icon name={align.icon} /> {align.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Text Color */}
      <div className={styles.textToolbarGroup}>
        <button
          className={styles.textToolbarBtn}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            setShowColorMenu(!showColorMenu);
            closeOtherMenus('color');
          }}
          title="Text color"
        >
          <span
            style={{
              textDecoration: 'underline',
              textDecorationColor: textEdit.color || getDefaultSwatchColor(theme),
              textDecorationThickness: '3px',
            }}
          >
            A
          </span>
        </button>
        {showColorMenu && (
          <div className={styles.textToolbarMenu}>
            <button
              className={`${styles.textToolbarMenuItem} ${!textEdit.color ? styles.active : ''}`}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                setTextEdit((prev) => ({ ...prev, color: undefined }));
                setShowColorMenu(false);
                textInputRef.current?.focus();
              }}
            >
              <span className={styles.colorSwatch} style={{ background: getDefaultSwatchColor(theme) }} />
              Default
            </button>
            {STROKE_COLORS.map((c) => (
              <button
                key={c.name}
                className={`${styles.textToolbarMenuItem} ${textEdit.color === c.css ? styles.active : ''}`}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  setTextEdit((prev) => ({ ...prev, color: c.css }));
                  setShowColorMenu(false);
                  textInputRef.current?.focus();
                }}
              >
                <span className={styles.colorSwatch} style={{ background: c.css }} />
                {c.name}
              </button>
            ))}
            <div style={{ borderTop: '1px solid var(--panel-border)', margin: '4px 0' }} />
            <button
              className={`${styles.textToolbarMenuItem} ${textEdit.color && !STROKE_COLORS.some((c) => c.css === textEdit.color) ? styles.active : ''}`}
              onMouseDown={(e) => e.preventDefault()}
              onClick={handleCustomTextColorClick}
              title="Pick custom color"
            >
              <span
                className={styles.colorSwatch}
                style={{
                  background:
                    textEdit.color && !STROKE_COLORS.some((c) => c.css === textEdit.color)
                      ? textEdit.color
                      : customTextColor,
                }}
              />
              Custom
              <input
                ref={textColorInputRef}
                type="color"
                value={
                  textEdit.color && !STROKE_COLORS.some((c) => c.css === textEdit.color)
                    ? textEdit.color
                    : customTextColor
                }
                onChange={handleCustomTextColorChange}
                style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
                onClick={(e) => e.stopPropagation()}
              />
            </button>
          </div>
        )}
      </div>

      {/* Highlight Color */}
      <div className={styles.textToolbarGroup}>
        <button
          className={styles.textToolbarBtn}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            setShowHighlightMenu(!showHighlightMenu);
            closeOtherMenus('highlight');
          }}
          title="Highlight color"
          style={{ background: textEdit.highlightColor ? textEdit.highlightColor : 'transparent' }}
        >
          <Icon name="highlight" />
        </button>
        {showHighlightMenu && (
          <div className={styles.textToolbarMenu}>
            <button
              className={`${styles.textToolbarMenuItem} ${!textEdit.highlightColor ? styles.active : ''}`}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                setTextEdit((prev) => ({ ...prev, highlightColor: undefined }));
                setShowHighlightMenu(false);
                textInputRef.current?.focus();
              }}
            >
              <span
                className={styles.colorSwatch}
                style={{ background: 'transparent', border: '1px solid currentColor' }}
              />
              None
            </button>
            {STROKE_COLORS.map((c) => (
              <button
                key={c.name}
                className={`${styles.textToolbarMenuItem} ${textEdit.highlightColor === c.css ? styles.active : ''}`}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  setTextEdit((prev) => ({ ...prev, highlightColor: c.css }));
                  setShowHighlightMenu(false);
                  textInputRef.current?.focus();
                }}
              >
                <span className={styles.colorSwatch} style={{ background: c.css }} />
                {c.name}
              </button>
            ))}
            <div style={{ borderTop: '1px solid var(--panel-border)', margin: '4px 0' }} />
            <button
              className={`${styles.textToolbarMenuItem} ${textEdit.highlightColor && !STROKE_COLORS.some((c) => c.css === textEdit.highlightColor) ? styles.active : ''}`}
              onMouseDown={(e) => e.preventDefault()}
              onClick={handleCustomHighlightColorClick}
              title="Pick custom highlight color"
            >
              <span
                className={styles.colorSwatch}
                style={{
                  background:
                    textEdit.highlightColor && !STROKE_COLORS.some((c) => c.css === textEdit.highlightColor)
                      ? textEdit.highlightColor
                      : customHighlightColor,
                }}
              />
              Custom
              <input
                ref={highlightColorInputRef}
                type="color"
                value={
                  textEdit.highlightColor && !STROKE_COLORS.some((c) => c.css === textEdit.highlightColor)
                    ? textEdit.highlightColor
                    : customHighlightColor
                }
                onChange={handleCustomHighlightColorChange}
                style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
                onClick={(e) => e.stopPropagation()}
              />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

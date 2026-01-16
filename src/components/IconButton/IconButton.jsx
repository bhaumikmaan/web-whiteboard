import styles from './IconButton.module.css';

/**
 * Reusable icon button component
 * Used for toolbar buttons throughout the app
 */
export default function IconButton({
  children,
  active = false,
  disabled = false,
  onClick,
  title,
  ariaLabel,
  ariaExpanded,
  ariaControls,
  ariaHaspopup,
  className = '',
  ...props
}) {
  return (
    <button
      className={`${styles.btn} ${active ? styles.active : ''} ${className}`}
      disabled={disabled}
      onClick={onClick}
      title={title}
      aria-label={ariaLabel || title}
      aria-expanded={ariaExpanded}
      aria-controls={ariaControls}
      aria-haspopup={ariaHaspopup}
      {...props}
    >
      {children}
    </button>
  );
}

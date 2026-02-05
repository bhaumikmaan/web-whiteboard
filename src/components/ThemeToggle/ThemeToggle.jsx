import styles from './ThemeToggle.module.css';
import { Icon } from '@/components/Icons';

/**
 * Theme toggle button - shows sun/moon icon based on current theme
 * Desktop only (hidden on touch devices via CSS)
 */
export default function ThemeToggle({ theme, onToggle }) {
  const isDark = theme === 'dark';

  return (
    <button
      className={styles.toggle}
      onClick={onToggle}
      aria-label="Toggle color scheme"
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <Icon name={isDark ? 'light' : 'dark'} />
    </button>
  );
}

import styles from './ModeSwitcher.module.css';
import { Icon } from '@/components/Icons/index.js';

/**
 * Mode definitions for the app
 */
const MODES = [
  { id: 'whiteboard', label: 'Whiteboard', icon: 'pen' },
  // TODO: { id: 'diagrams', label: 'Diagrams', icon: 'diagrams' },
  // TODO: { id: 'stickies', label: 'Sticky Notes', icon: 'text' },
];

/**
 * ModeSwitcher - Tab/button group to switch between modules
 */
export default function ModeSwitcher({ activeMode, onChange }) {
  // Hide switcher when only one mode is available
  if (MODES.length <= 1) return null;

  return (
    <nav className={styles.switcher} role="tablist" aria-label="Application modes">
      {MODES.map((mode) => (
        <button
          key={mode.id}
          role="tab"
          aria-selected={activeMode === mode.id}
          className={`${styles.tab} ${activeMode === mode.id ? styles.active : ''}`}
          onClick={() => onChange(mode.id)}
          title={mode.label}
        >
          <span aria-hidden="true">
            <Icon name={mode.icon} />
          </span>
          <span className={styles.label}>{mode.label}</span>
        </button>
      ))}
    </nav>
  );
}

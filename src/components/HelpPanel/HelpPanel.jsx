import React from 'react';
import styles from './HelpPanel.module.css';
import { Icon } from '@/components/Icons';

/**
 * Configurable help panel - receives items from active module
 * @param {{ items: string[], theme: 'light' | 'dark', onToggleTheme: () => void }} props
 */
export default function HelpPanel({ items, theme, onToggleTheme }) {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <button
        className={styles.toggle}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="help-panel"
        aria-label={open ? 'Close help' : 'Open help'}
        title={open ? 'Close help' : 'Open help'}
      >
        <Icon name="help" />
      </button>
      <div id="help-panel" className={`${styles.panel} ${open ? styles.open : ''}`}>
        <div className={styles.content}>
          <div className={styles.header}>
            <span className={styles.title}>Help</span>
            <button className={styles.chip} onClick={onToggleTheme} aria-label="Toggle color scheme">
              <Icon name={theme === 'dark' ? 'light' : 'dark'} />
              {theme === 'dark' ? ' Light mode' : ' Dark mode'}
            </button>
          </div>
          <ul className={styles.list} role="list">
            {items.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}

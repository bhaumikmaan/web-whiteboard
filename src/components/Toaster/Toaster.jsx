import React from 'react';
import styles from './Toaster.module.css';

export default function Toaster({ theme, onToggleTheme }) {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <button
        className={styles.toasterToggle}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="wb-toaster"
        aria-label={open ? 'Close help' : 'Open help'}
        title={open ? 'Close help' : 'Open help'}
      >
        ?
      </button>
      <div id="wb-toaster" className={`${styles.toaster} ${open ? styles.open : ''}`}>
        <div className={styles.toasterContent}>
          <div className={styles.toasterRow}>
            <span className={styles.toasterTitle}>Help</span>
            <button className={styles.chip} onClick={onToggleTheme} aria-label="Toggle color scheme">
              {theme === 'dark' ? '☀️ Light mode' : '🌙 Dark mode'}
            </button>
          </div>
          <ul className={styles.helpList} role="list">
            <li>Draw: Left mouse / 1‑finger drag</li>
            <li>Pan: Hold Space and drag, or middle mouse</li>
            <li>Touch pan: 2‑finger drag</li>
            <li>Zoom: Mouse wheel or pinch</li>
            <li>Reset view: Double‑click / Double‑tap</li>
          </ul>
        </div>
      </div>
    </>
  );
}

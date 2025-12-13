import React from 'react'
import styles from './Toaster.module.css'

export default function Toaster({ theme, onToggleTheme }) {
  const [open, setOpen] = React.useState(false)
  return (
    <>
      <button
        className={styles.toasterToggle}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="wb-toaster"
        aria-label={open ? 'Close help' : 'Open help'}
        title={open ? 'Close menu' : 'Open menu'}
      >
        ⋯
      </button>
      <div
        id="wb-toaster"
        className={`${styles.toaster} ${open ? styles.open : ''}`}
      >
        <div className={styles.toasterContent}>
          <div className={styles.toasterRow}>
            <span className={styles.toasterTitle}>Whiteboard</span>
            <button
              className={styles.chip}
              onClick={onToggleTheme}
              aria-label="Toggle color scheme"
            >
              {theme === 'dark' ? '☀️ Light mode' : '🌙 Dark mode'}
            </button>
          </div>
          <div className={styles.toasterHelp}>
            Draw: 1‑finger drag • Pan: 2‑finger drag • Zoom: Pinch • Reset: Double‑tap
          </div>
        </div>
      </div>
    </>
  )
}

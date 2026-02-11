import styles from './LoadingSpinner.module.css';

/**
 * Full-area loading spinner for module/content loading states.
 * Spins the app favicon with ease-in-out: fast in the middle, slow at start/end.
 */
export default function LoadingSpinner() {
  return (
    <div className={styles.wrapper} aria-busy="true" aria-label="Loading">
      <div className={styles.spinner}>
        <img src="/logo192.png" className={styles.logo} alt="" />
      </div>
    </div>
  );
}

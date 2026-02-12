import styles from './PerfStats.module.css';

export default function PerfStats({ metrics, strokeCount }) {
  if (!metrics) return null;

  return (
    <div className={styles.container}>
      <div className={styles.title}>Performance</div>
      <div className={styles.stat}>
        <span className={styles.label}>FPS</span>
        <span className={styles.value}>{metrics.fps}</span>
      </div>
      <div className={styles.stat}>
        <span className={styles.label}>Frame</span>
        <span className={styles.value}>{metrics.avgFrameTime}ms</span>
      </div>
      <div className={styles.stat}>
        <span className={styles.label}>Min/Max</span>
        <span className={styles.value}>
          {metrics.minFrameTime}/{metrics.maxFrameTime}ms
        </span>
      </div>
      <div className={styles.stat}>
        <span className={styles.label}>Strokes</span>
        <span className={styles.value}>{strokeCount}</span>
      </div>
    </div>
  );
}

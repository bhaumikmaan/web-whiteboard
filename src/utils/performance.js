/**
 * Performance monitoring utilities for canvas rendering
 *
 * Provides real-time frame timing metrics for profiling canvas draw loops.
 * Designed to have zero overhead when disabled.
 *
 * @example
 * const monitor = new PerformanceMonitor();
 * monitor.enable();
 *
 * function draw() {
 *   monitor.startFrame();
 *   // ... rendering code ...
 *   monitor.endFrame();
 *   requestAnimationFrame(draw);
 * }
 */

/**
 * Tracks frame timing and calculates rendering performance metrics
 *
 * Uses a rolling window of frame times to provide smoothed metrics that
 * reflect recent performance without being overly sensitive to temporary spikes.
 */
export class PerformanceMonitor {
  /**
   * @param {number} sampleSize - Number of frames to track (default: 60)
   *   At 60 FPS, this provides ~1 second of performance history
   */
  constructor(sampleSize = 60) {
    /** @type {number} Number of frames to keep in rolling window */
    this.sampleSize = sampleSize;

    /** @type {number[]} Circular buffer of frame times in milliseconds */
    this.frameTimes = [];

    /** @type {number} Timestamp when current frame started (from performance.now()) */
    this.frameStart = 0;

    /** @type {boolean} Whether monitoring is active (false = zero overhead) */
    this.enabled = false;
  }

  /**
   * Mark the start of a frame
   *
   * Call this at the beginning of your render loop.
   * Uses performance.now() for high-resolution timing (~microsecond precision).
   *
   * @example
   * function draw() {
   *   perfMonitor.startFrame();
   *   // ... rendering ...
   *   perfMonitor.endFrame();
   * }
   */
  startFrame() {
    if (!this.enabled) return;
    const now = performance.now();
    // Record time since previous frame start (real RAF interval), not draw() duration.
    // This keeps FPS at display refresh rate (~60) instead of 10K+ when draw() is fast.
    if (this.frameStart > 0) {
      const frameTime = now - this.frameStart;
      this.frameTimes.push(frameTime);
      if (this.frameTimes.length > this.sampleSize) {
        this.frameTimes.shift();
      }
    }
    this.frameStart = now;
  }

  /**
   * Mark the end of a frame (no-op for timing).
   * Frame time is measured between startFrame() calls (RAF interval), not draw() duration.
   */
  endFrame() {
    if (!this.enabled) return;
  }

  /**
   * Calculate current performance metrics from recorded frame times
   *
   * @returns {{
   *   avgFrameTime: string,  // Average frame time in ms (e.g., "16.24")
   *   minFrameTime: string,  // Minimum frame time in window (e.g., "14.12")
   *   maxFrameTime: string,  // Maximum frame time in window (e.g., "23.45")
   *   fps: string            // Frames per second (e.g., "61.6")
   * }} Performance metrics (all strings formatted to 2 decimal places, fps to 1)
   *
   * **Calculation Details:**
   *
   * - **avgFrameTime**:
   *   ```js
   *   avg = sum(frameTimes) / frameTimes.length
   *   ```
   *   Represents average time to render one frame over the sample window.
   *   At 60 FPS, ideal value is ~16.67ms per frame.
   *
   * - **minFrameTime**:
   *   ```js
   *   min = Math.min(...frameTimes)
   *   ```
   *   Fastest frame in the window. Indicates best-case performance.
   *
   * - **maxFrameTime**:
   *   ```js
   *   max = Math.max(...frameTimes)
   *   ```
   *   Slowest frame in the window. High values indicate jank/stuttering.
   *   Large min/max spread suggests inconsistent performance.
   *
   * - **fps** (Frames Per Second):
   *   ```js
   *   fps = min(1000 / avgFrameTime, 120)
   *   ```
   *   Frame time is the interval between startFrame() calls (RAF callback interval),
   *   not draw() execution time, so FPS reflects display refresh rate (~60) and is
   *   capped at 120 to avoid 12K/Infinity when intervals are tiny.
   *   - 60 FPS = smooth (16.67ms per frame)
   *   - 30 FPS = noticeable lag (33.33ms per frame)
   *   - <30 FPS = significant performance issues
   *
   * @example
   * const metrics = perfMonitor.getMetrics();
   * console.log(`FPS: ${metrics.fps}`);
   * console.log(`Frame: ${metrics.avgFrameTime}ms`);
   * console.log(`Range: ${metrics.minFrameTime}-${metrics.maxFrameTime}ms`);
   */
  getMetrics() {
    if (this.frameTimes.length === 0) {
      return {
        avgFrameTime: '0',
        minFrameTime: '0',
        maxFrameTime: '0',
        fps: '0',
      };
    }

    const avg = this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
    const min = Math.min(...this.frameTimes);
    const max = Math.max(...this.frameTimes);
    // FPS = 1000/avg (ms per frame). Cap at 120 so we never show 12K/Infinity from tiny intervals.
    const rawFps = avg > 0 ? 1000 / avg : 0;
    const fps = Math.min(rawFps, 120);

    return {
      avgFrameTime: avg.toFixed(2),
      minFrameTime: min.toFixed(2),
      maxFrameTime: max.toFixed(2),
      fps: fps.toFixed(1),
    };
  }

  /**
   * Log metrics to console (for debugging without UI overlay)
   *
   * @param {number} strokeCount - Optional stroke count to include in log
   *
   * @example
   * // In your render loop:
   * if (frameCount % 60 === 0) {
   *   perfMonitor.logMetrics(strokes.length);
   * }
   *
   * // Console output:
   * // [Performance] FPS: 59.8 | Frame Time: 16.72ms (min: 15.23ms, max: 18.91ms) | Strokes: 127
   */
  logMetrics(strokeCount = 0) {
    if (!this.enabled) return;

    const metrics = this.getMetrics();
    console.log(
      `[Performance] FPS: ${metrics.fps} | Frame Time: ${metrics.avgFrameTime}ms (min: ${metrics.minFrameTime}ms, max: ${metrics.maxFrameTime}ms) | Strokes: ${strokeCount}`
    );
  }

  /**
   * Enable performance monitoring
   *
   * Resets the frame time buffer to start with a clean slate.
   * After calling this, startFrame() and endFrame() will begin recording.
   *
   * @example
   * // Enable via URL param
   * if (new URLSearchParams(location.search).get('perf') === 'true') {
   *   perfMonitor.enable();
   * }
   */
  enable() {
    this.enabled = true;
    this.frameTimes = [];
  }

  /**
   * Disable performance monitoring
   *
   * Clears frame time buffer and stops recording.
   * After calling this, startFrame() and endFrame() become no-ops (zero overhead).
   */
  disable() {
    this.enabled = false;
    this.frameTimes = [];
  }
}

/**
 * Measure execution time of a synchronous function
 *
 * Useful for profiling individual operations or testing performance
 * of specific code blocks.
 *
 * **How it works:**
 * 1. Records start time with performance.now()
 * 2. Executes the provided function
 * 3. Records end time
 * 4. Logs the duration to console
 * 5. Returns the function's result
 *
 * @param {Function} fn - The function to measure
 * @param {string} [label='Operation'] - Label for the console output
 * @returns {*} The return value of the executed function
 *
 * @example
 * // Measure stroke rendering time
 * const result = measureTime(() => {
 *   strokes.forEach(s => drawStroke(ctx, s));
 * }, 'Draw All Strokes');
 * // Console: "Draw All Strokes: 24.32ms"
 *
 * @example
 * // Use in tests
 * it('renders 100 strokes quickly', () => {
 *   const time = measureTime(() => render100Strokes(), 'Test');
 *   expect(time).toBeLessThan(50);
 * });
 */
export function measureTime(fn, label = 'Operation') {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  console.log(`${label}: ${(end - start).toFixed(2)}ms`);
  return result;
}

/**
 * Generate synthetic stroke data for performance testing
 *
 * Creates realistic-looking strokes with random positions, paths,
 * and stroke properties. Useful for benchmarking and automated tests.
 *
 * **Stroke characteristics:**
 * - Random starting position (0-1000, 0-1000)
 * - 10-20 points per stroke
 * - Sinusoidal path with random noise
 * - Pressure values: 0.5-1.0
 * - Size: 2-5px
 * - All strokes use theme mode (no custom colors)
 *
 * @param {number} [count=100] - Number of strokes to generate
 * @returns {Array<Object>} Array of stroke objects matching Canvas stroke format
 *
 * @example
 * // Generate test data for performance test
 * const strokes = createTestStrokes(1000);
 * const time = measureTime(() => {
 *   strokes.forEach(s => drawStroke(ctx, s));
 * }, 'Render 1000 Strokes');
 *
 * @example
 * // Use in automated tests
 * it('handles many strokes', () => {
 *   const mockStrokes = createTestStrokes(500);
 *   strokesRef.current = mockStrokes;
 *   expect(() => draw()).not.toThrow();
 * });
 */
export function createTestStrokes(count = 100) {
  const strokes = [];
  for (let i = 0; i < count; i++) {
    const points = [];
    const startX = Math.random() * 1000;
    const startY = Math.random() * 1000;

    // Create a stroke with 10-20 points
    const pointCount = 10 + Math.floor(Math.random() * 10);
    for (let j = 0; j < pointCount; j++) {
      points.push({
        x: startX + j * 5 + Math.random() * 10,
        y: startY + Math.sin(j * 0.5) * 20 + Math.random() * 10,
        p: 0.5 + Math.random() * 0.5, // Pressure: 0.5-1.0
      });
    }

    strokes.push({
      mode: 'theme',
      points,
      size: 2 + Math.floor(Math.random() * 3), // Size: 2-5
      color: undefined,
      alpha: 1,
      erase: false,
      cap: 'round',
      join: 'round',
    });
  }
  return strokes;
}

import React, { useRef } from 'react';
import { Canvas, BrushPalette } from './components';
import { DEFAULT_TOOL } from './constants/tools';
import PerfStats from '../../components/PerfStats';

/**
 * Main Whiteboard component - the public API for the Whiteboard module
 * Renders only the module-specific canvas and brush palette
 * Shell chrome (help, theme toggle, footer) is handled by AppShell
 * @param {{ theme: 'light' | 'dark' }} props
 */
export default function Whiteboard({ theme }) {
  const [tool, setTool] = React.useState(DEFAULT_TOOL);
  const [perfMetrics, setPerfMetrics] = React.useState(null);
  const [strokeCount, setStrokeCount] = React.useState(0);
  const canvasRef = useRef(null);

  // Check if perf monitoring is enabled
  const perfEnabled = React.useMemo(() => {
    if (typeof window === 'undefined') return false;
    return new URLSearchParams(window.location.search).get('perf') === 'true';
  }, []);

  // Poll for performance metrics when enabled
  React.useEffect(() => {
    if (!perfEnabled) return;

    const interval = setInterval(() => {
      if (canvasRef.current?.getPerfMetrics) {
        const metrics = canvasRef.current.getPerfMetrics();
        setPerfMetrics(metrics);
      }
      if (canvasRef.current?.getStrokeCount) {
        const count = canvasRef.current.getStrokeCount();
        setStrokeCount(count);
      }
    }, 500); // Update every 500ms

    return () => clearInterval(interval);
  }, [perfEnabled]);

  const onUndo = () => {
    if (canvasRef.current) canvasRef.current.undo();
  };
  const onRedo = () => {
    if (canvasRef.current) canvasRef.current.redo();
  };

  return (
    <>
      <Canvas ref={canvasRef} theme={theme} tool={tool} onToolChange={setTool} />
      <BrushPalette theme={theme} tool={tool} onChange={setTool} onUndo={onUndo} onRedo={onRedo} />
      {perfEnabled && <PerfStats metrics={perfMetrics} strokeCount={strokeCount} />}
    </>
  );
}

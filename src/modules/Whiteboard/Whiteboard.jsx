import React, { useRef } from 'react';
import { Canvas, BrushPalette } from './components';
import { DEFAULT_TOOL } from './constants/tools';
import { useCanvasScreenshot } from './hooks';

/**
 * Main Whiteboard component - the public API for the Whiteboard module
 * Renders only the module-specific canvas and brush palette
 * Shell chrome (help, theme toggle, footer) is handled by AppShell
 * @param {{ theme: 'light' | 'dark' }} props
 */
export default function Whiteboard({ theme }) {
  const [tool, setTool] = React.useState(DEFAULT_TOOL);
  const canvasRef = useRef(null);

  const onUndo = () => {
    if (canvasRef.current) canvasRef.current.undo();
  };
  const onRedo = () => {
    if (canvasRef.current) canvasRef.current.redo();
  };

  const onScreenshot = useCanvasScreenshot(canvasRef);

  return (
    <>
      <Canvas ref={canvasRef} theme={theme} tool={tool} onToolChange={setTool} />
      <BrushPalette
        theme={theme}
        tool={tool}
        onChange={setTool}
        onUndo={onUndo}
        onRedo={onRedo}
        onScreenshot={onScreenshot}
      />
    </>
  );
}

import React, { useRef } from 'react';
import { Canvas, BrushPalette } from './components';
import { DEFAULT_TOOL } from './constants/tools';

/**
 * Main Whiteboard component - the public API for the Whiteboard module
 * Renders only the module-specific canvas and brush palette
 * Shell chrome (help, theme toggle, footer) is handled by AppShell
 * @param {{ theme: 'light' | 'dark' }} props
 */
export default function Whiteboard({ theme }) {
  const [tool, setTool] = React.useState(DEFAULT_TOOL);
  const [hasSelectedImage, setHasSelectedImage] = React.useState(false);
  const canvasRef = useRef(null);

  const onUndo = () => {
    if (canvasRef.current) canvasRef.current.undo();
  };
  const onRedo = () => {
    if (canvasRef.current) canvasRef.current.redo();
  };
  const onClearCanvas = () => {
    if (canvasRef.current) canvasRef.current.clearCanvas();
  };
  const onDeleteImage = () => {
    if (canvasRef.current) {
      canvasRef.current.deleteSelectedImage();
      setHasSelectedImage(false);
    }
  };

  // Poll for selected image state
  React.useEffect(() => {
    const interval = setInterval(() => {
      if (canvasRef.current) {
        const selected = canvasRef.current.hasSelectedImage?.() || false;
        setHasSelectedImage(selected);
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Canvas ref={canvasRef} theme={theme} tool={tool} />
      <BrushPalette
        theme={theme}
        tool={tool}
        onChange={setTool}
        onUndo={onUndo}
        onRedo={onRedo}
        onClearCanvas={onClearCanvas}
        onDeleteImage={onDeleteImage}
        hasSelectedImage={hasSelectedImage}
      />
    </>
  );
}

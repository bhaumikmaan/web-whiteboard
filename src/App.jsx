import React, { useRef } from 'react';
import './App.css';

import CanvasWhiteboard from './components/CanvasWhiteboard';
import BrushPalette from './components/BrushPalette';
import Toaster from './components/Toaster';
import FooterBadge from './components/FooterBadge';
import ThemeToggle from './components/ThemeToggle';
import useTheme from './hooks/useTheme';
import { DEFAULT_TOOL } from './constants/tools';

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const [tool, setTool] = React.useState(DEFAULT_TOOL);
  const canvasRef = useRef(null);

  const onUndo = () => {
    if (canvasRef.current) canvasRef.current.undo();
  };
  const onRedo = () => {
    if (canvasRef.current) canvasRef.current.redo();
  };

  return (
    <div className={`App ${theme}`}>
      <CanvasWhiteboard ref={canvasRef} theme={theme} tool={tool} />
      <BrushPalette theme={theme} tool={tool} onChange={setTool} onUndo={onUndo} onRedo={onRedo} />
      <Toaster theme={theme} onToggleTheme={toggleTheme} />
      <ThemeToggle theme={theme} onToggle={toggleTheme} />
      <FooterBadge />
    </div>
  );
}

import React from 'react';
import './App.css';

import AppShell from './components/AppShell';
import { Whiteboard, moduleConfig as whiteboardConfig } from './modules/Whiteboard';
import useTheme from './hooks/useTheme';

/**
 * Module configurations
 * Add new modules here as they are implemented
 */
const MODULE_CONFIGS = {
  whiteboard: whiteboardConfig,
  // TODO: diagrams: diagramsConfig,
  // TODO: stickies: stickiesConfig,
};

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const [activeMode, setActiveMode] = React.useState('whiteboard');

  const config = MODULE_CONFIGS[activeMode];

  return (
    <div className={`App ${theme}`}>
      <AppShell
        theme={theme}
        onToggleTheme={toggleTheme}
        activeMode={activeMode}
        onModeChange={setActiveMode}
        helpItems={config.helpItems}
      >
        {activeMode === 'whiteboard' && <Whiteboard theme={theme} />}
        {/* TODO: {activeMode === 'diagrams' && <Diagrams theme={theme} />} */}
        {/* TODO: {activeMode === 'stickies' && <StickyNotes theme={theme} />} */}
      </AppShell>
    </div>
  );
}

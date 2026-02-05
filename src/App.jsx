import React, { Suspense, lazy } from 'react';
import './App.css';

import AppShell from './components/AppShell';
import LoadingSpinner from './components/LoadingSpinner';
import { moduleConfig as whiteboardConfig } from './modules/Whiteboard/config';
import useTheme from './hooks/useTheme';

const Whiteboard = lazy(() => import('./modules/Whiteboard').then((m) => ({ default: m.Whiteboard })));

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
  const [visitedModes, setVisitedModes] = React.useState(['whiteboard']);

  const config = MODULE_CONFIGS[activeMode];

  React.useEffect(() => {
    setVisitedModes((prev) => (prev.includes(activeMode) ? prev : [...prev, activeMode]));
  }, [activeMode]);

  return (
    <div className={`App ${theme}`}>
      <AppShell
        theme={theme}
        onToggleTheme={toggleTheme}
        activeMode={activeMode}
        onModeChange={setActiveMode}
        helpItems={config.helpItems}
      >
        {visitedModes.includes('whiteboard') && (
          <div className="modulePane" hidden={activeMode !== 'whiteboard'}>
            <Suspense fallback={<LoadingSpinner />}>
              <Whiteboard theme={theme} />
            </Suspense>
          </div>
        )}
        {/* TODO: diagrams, stickies: visitedModes, modulePane, Suspense */}
      </AppShell>
    </div>
  );
}

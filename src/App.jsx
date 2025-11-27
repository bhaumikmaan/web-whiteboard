import React, { useRef } from 'react'
import './App.css'

import CanvasWhiteboard from './components/CanvasWhiteboard'
import BrushPalette from './components/BrushPalette'
import Toaster from './components/Toaster'
import FooterBadge from './components/FooterBadge'

export default function App() {
  const [theme, setTheme] = React.useState(() =>
    (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light'
  )
  const [tool, setTool] = React.useState({ kind: 'pen', size: 2, color: undefined })
  const canvasRef = useRef(null)

  const onUndo = () => {
    if (canvasRef.current) canvasRef.current.undo()
  }
  const onRedo = () => {
    if (canvasRef.current) canvasRef.current.redo()
  }

  // Keep theme variables on :root so portals/popouts inherit them
  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  React.useEffect(() => {
    if (!window.matchMedia) return
    const mql = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e) => setTheme(e.matches ? 'dark' : 'light')
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [])

  return (
    <div className={`App ${theme}`}>
      <CanvasWhiteboard ref={canvasRef} theme={theme} tool={tool} />
      <BrushPalette theme={theme} tool={tool} onChange={setTool} onUndo={onUndo} onRedo={onRedo} />

      <div className="hud">
        <div className="panel">
          <strong>Controls</strong><br />
          Draw: 1‑finger drag • Pan: 2‑finger drag or Space+Left mouse • Zoom: Pinch or Wheel • Reset: Double‑tap / Double‑click
        </div>
      </div>

      <Toaster
        theme={theme}
        onToggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
      />

      <button
        className="theme-toggle"
        onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
        aria-label="Toggle color scheme"
        title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      >
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>

      <FooterBadge />
    </div>
  )
}
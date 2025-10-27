import React from 'react'
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
      <CanvasWhiteboard theme={theme} tool={tool} />
      <BrushPalette theme={theme} tool={tool} onChange={setTool} />

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
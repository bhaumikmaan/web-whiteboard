import React from 'react';

/**
 * Manages theme state with system preference detection
 * This is a generic hook that could be used in any project
 * @returns {{ theme: 'light' | 'dark', setTheme: Function, toggleTheme: Function }}
 */
export default function useTheme() {
  const [theme, setTheme] = React.useState(() => {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  // Sync theme attribute to document root for CSS
  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Listen for system preference changes
  React.useEffect(() => {
    if (!window.matchMedia) return;

    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => setTheme(e.matches ? 'dark' : 'light');

    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  const toggleTheme = React.useCallback(() => {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  }, []);

  return { theme, setTheme, toggleTheme };
}

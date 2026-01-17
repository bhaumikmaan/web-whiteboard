import styles from './AppShell.module.css';
import ModeSwitcher from '../ModeSwitcher';
import HelpPanel from '../HelpPanel';
import ThemeToggle from '../ThemeToggle';
import FooterBadge from '../FooterBadge';

/**
 * AppShell - Provides consistent chrome (header, help, footer) across all modules
 * Each module provides its content as children and configuration via props
 */
export default function AppShell({ children, theme, onToggleTheme, helpItems, activeMode, onModeChange }) {
  return (
    <div className={styles.shell}>
      {/* Mode switcher - hidden until more modules are added */}
      <ModeSwitcher activeMode={activeMode} onChange={onModeChange} />

      {/* Renders active module */}
      <main className={styles.content}>{children}</main>

      {/* Shared chrome */}
      <HelpPanel items={helpItems} theme={theme} onToggleTheme={onToggleTheme} />
      <ThemeToggle theme={theme} onToggle={onToggleTheme} />
      <FooterBadge />
    </div>
  );
}

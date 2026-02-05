import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import AppShell from './AppShell';

describe('AppShell', () => {
  const defaultProps = {
    theme: 'light',
    onToggleTheme: vi.fn(),
    helpItems: ['Help 1', 'Help 2'],
    activeMode: 'whiteboard',
    onModeChange: vi.fn(),
  };

  it('renders children content', () => {
    render(
      <AppShell {...defaultProps}>
        <div data-testid="child-content">Module Content</div>
      </AppShell>
    );

    expect(screen.getByTestId('child-content')).toBeInTheDocument();
    expect(screen.getByText('Module Content')).toBeInTheDocument();
  });

  it('renders main content area', () => {
    render(
      <AppShell {...defaultProps}>
        <div>Content</div>
      </AppShell>
    );

    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('renders HelpPanel with items', () => {
    render(
      <AppShell {...defaultProps}>
        <div>Content</div>
      </AppShell>
    );

    // HelpPanel renders a toggle button
    expect(screen.getByRole('button', { name: /open help/i })).toBeInTheDocument();

    // Help items should be rendered
    defaultProps.helpItems.forEach((item) => {
      expect(screen.getByText(item)).toBeInTheDocument();
    });
  });

  it('renders ThemeToggle', () => {
    render(
      <AppShell {...defaultProps}>
        <div>Content</div>
      </AppShell>
    );

    // ThemeToggle renders a button with aria-label for color scheme
    expect(screen.getByRole('button', { name: /toggle color scheme/i })).toBeInTheDocument();
  });

  it('renders FooterBadge', () => {
    render(
      <AppShell {...defaultProps}>
        <div>Content</div>
      </AppShell>
    );

    expect(screen.getByText(/made with/i)).toBeInTheDocument();
  });

  it('passes theme to HelpPanel', () => {
    render(
      <AppShell {...defaultProps} theme="dark">
        <div>Content</div>
      </AppShell>
    );

    // In dark mode, HelpPanel shows "Light mode" option
    expect(screen.getByText(/light mode/i)).toBeInTheDocument();
  });
});

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import HelpPanel from './HelpPanel';

describe('HelpPanel', () => {
  const defaultProps = {
    items: ['Help item 1', 'Help item 2', 'Help item 3'],
    theme: 'light',
    onToggleTheme: vi.fn(),
  };

  it('renders toggle button', () => {
    render(<HelpPanel {...defaultProps} />);

    const toggle = screen.getByRole('button', { name: /open help/i });
    expect(toggle).toBeInTheDocument();
    expect(toggle).toHaveTextContent('?');
  });

  it('panel is closed by default', () => {
    render(<HelpPanel {...defaultProps} />);

    const toggle = screen.getByRole('button', { name: /open help/i });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  it('opens panel when toggle is clicked', () => {
    render(<HelpPanel {...defaultProps} />);

    const toggle = screen.getByRole('button', { name: /open help/i });
    fireEvent.click(toggle);

    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(toggle).toHaveAttribute('aria-label', 'Close help');
  });

  it('closes panel when toggle is clicked again', () => {
    render(<HelpPanel {...defaultProps} />);

    const toggle = screen.getByRole('button', { name: /open help/i });
    fireEvent.click(toggle); // Open
    fireEvent.click(toggle); // Close

    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(toggle).toHaveAttribute('aria-label', 'Open help');
  });

  it('renders all help items', () => {
    render(<HelpPanel {...defaultProps} />);

    defaultProps.items.forEach((item) => {
      expect(screen.getByText(item)).toBeInTheDocument();
    });
  });

  it('renders help list with correct role', () => {
    render(<HelpPanel {...defaultProps} />);

    const list = screen.getByRole('list');
    expect(list).toBeInTheDocument();
    expect(list.children).toHaveLength(defaultProps.items.length);
  });

  it('shows dark mode button in light theme', () => {
    render(<HelpPanel {...defaultProps} theme="light" />);

    expect(screen.getByText(/dark mode/i)).toBeInTheDocument();
  });

  it('shows light mode button in dark theme', () => {
    render(<HelpPanel {...defaultProps} theme="dark" />);

    expect(screen.getByText(/light mode/i)).toBeInTheDocument();
  });

  it('calls onToggleTheme when theme button is clicked', () => {
    const onToggleTheme = vi.fn();
    render(<HelpPanel {...defaultProps} onToggleTheme={onToggleTheme} />);

    const themeButton = screen.getByRole('button', { name: /toggle color scheme/i });
    fireEvent.click(themeButton);

    expect(onToggleTheme).toHaveBeenCalledTimes(1);
  });

  it('renders Help title', () => {
    render(<HelpPanel {...defaultProps} />);

    expect(screen.getByText('Help')).toBeInTheDocument();
  });
});

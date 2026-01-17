import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ModeSwitcher from './ModeSwitcher';

describe('ModeSwitcher', () => {
  it('returns null when only one mode is available', () => {
    // Currently MODES array has only 1 item (whiteboard)
    // So the component should return null
    const { container } = render(<ModeSwitcher activeMode="whiteboard" onChange={vi.fn()} />);

    expect(container.firstChild).toBeNull();
  });

  it('does not render navigation when hidden', () => {
    render(<ModeSwitcher activeMode="whiteboard" onChange={vi.fn()} />);

    expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
  });

  // Note: Additional tests for multi-mode behavior would require
  // either mocking the MODES array or refactoring to accept modes as props
  // For now, we test the current behavior (single mode = hidden)
});

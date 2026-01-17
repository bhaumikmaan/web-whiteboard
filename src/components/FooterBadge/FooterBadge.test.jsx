import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import FooterBadge from './FooterBadge';

describe('FooterBadge', () => {
  it('renders the badge link', () => {
    render(<FooterBadge />);

    const link = screen.getByRole('link');
    expect(link).toBeInTheDocument();
  });

  it('links to GitHub profile', () => {
    render(<FooterBadge />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', 'https://github.com/bhaumikmaan');
  });

  it('opens in new tab', () => {
    render(<FooterBadge />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('displays "Made with" text', () => {
    render(<FooterBadge />);

    expect(screen.getByText(/made with/i)).toBeInTheDocument();
  });

  it('displays author name', () => {
    render(<FooterBadge />);

    expect(screen.getByText(/bhaumikmaan/i)).toBeInTheDocument();
  });

  it('has accessible label', () => {
    render(<FooterBadge />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('aria-label', 'Made with love by bhaumikmaan');
  });

  it('renders heart icon', () => {
    render(<FooterBadge />);

    expect(screen.getByText('❤')).toBeInTheDocument();
  });
});

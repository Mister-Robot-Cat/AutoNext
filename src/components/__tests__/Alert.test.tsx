import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Alert } from '../Alert';

describe('Alert', () => {
  it('renders children correctly', () => {
    render(<Alert>Test message</Alert>);
    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  it('renders title when provided', () => {
    render(<Alert title="Alert Title">Test message</Alert>);
    expect(screen.getByText('Alert Title')).toBeInTheDocument();
    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  it('applies variant classes correctly', () => {
    const { container: infoContainer } = render(<Alert variant="info">Info</Alert>);
    expect(infoContainer.firstChild).toHaveClass('bg-blue-500/10');

    const { container: successContainer } = render(<Alert variant="success">Success</Alert>);
    expect(successContainer.firstChild).toHaveClass('bg-emerald-500/10');

    const { container: warningContainer } = render(<Alert variant="warning">Warning</Alert>);
    expect(warningContainer.firstChild).toHaveClass('bg-amber-500/10');

    const { container: errorContainer } = render(<Alert variant="error">Error</Alert>);
    expect(errorContainer.firstChild).toHaveClass('bg-red-500/10');
  });

  it('renders default icon for variant', () => {
    const { container } = render(<Alert variant="success">Success</Alert>);
    // CheckCircle2 is the default for success
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass('text-emerald-400');
  });

  it('renders custom icon when provided', () => {
    const CustomIcon = () => <svg data-testid="custom-icon" />;
    render(
      <Alert icon={<CustomIcon />}>
        Message
      </Alert>
    );
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });

  it('does not render icon when icon is null', () => {
    const { container } = render(<Alert icon={null}>No icon</Alert>);
    expect(container.querySelector('svg')).not.toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const handleClose = vi.fn();
    render(<Alert onClose={handleClose}>Closable alert</Alert>);
    
    const closeButton = screen.getByRole('button', { name: /close alert/i });
    expect(closeButton).toBeInTheDocument();
    
    fireEvent.click(closeButton);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('does not render close button when onClose is not provided', () => {
    render(<Alert>Not closable</Alert>);
    expect(screen.queryByRole('button', { name: /close alert/i })).not.toBeInTheDocument();
  });
});

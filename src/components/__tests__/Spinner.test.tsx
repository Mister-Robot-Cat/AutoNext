import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Spinner } from '../Spinner';

describe('Spinner', () => {
  it('renders correctly with default props', () => {
    render(<Spinner />);
    const spinnerIcon = screen.getByTestId('spinner-icon');
    expect(spinnerIcon).toBeInTheDocument();
    expect(spinnerIcon).toHaveClass('h-6 w-6');
    expect(spinnerIcon).toHaveClass('text-blue-500');
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('applies custom sizes correctly', () => {
    const { rerender } = render(<Spinner size="sm" />);
    expect(screen.getByTestId('spinner-icon')).toHaveClass('h-4 w-4');

    rerender(<Spinner size="lg" />);
    expect(screen.getByTestId('spinner-icon')).toHaveClass('h-8 w-8');

    rerender(<Spinner size="xl" />);
    expect(screen.getByTestId('spinner-icon')).toHaveClass('h-12 w-12');
  });

  it('applies custom variants correctly', () => {
    const { rerender } = render(<Spinner variant="secondary" />);
    expect(screen.getByTestId('spinner-icon')).toHaveClass('text-slate-400');

    rerender(<Spinner variant="white" />);
    expect(screen.getByTestId('spinner-icon')).toHaveClass('text-white');
  });

  it('merges custom class names', () => {
    render(<Spinner className="my-custom-class" />);
    const container = screen.getByRole('status');
    expect(container).toHaveClass('my-custom-class');
  });
});

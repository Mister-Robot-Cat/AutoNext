import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Progress } from '../Progress';
import React from 'react';

describe('Progress', () => {
  it('renders with default props', () => {
    render(<Progress />);
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toBeInTheDocument();
    expect(progressbar).toHaveAttribute('aria-valuenow', '0');
    expect(progressbar).toHaveAttribute('aria-valuemax', '100');
  });

  it('renders correct percentage width', () => {
    render(<Progress value={50} />);
    const indicator = screen.getByTestId('progress-indicator');
    expect(indicator).toHaveStyle({ width: '50%' });
  });

  it('bounds value between 0 and max', () => {
    const { rerender } = render(<Progress value={-10} />);
    let progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-valuenow', '0');

    rerender(<Progress value={150} max={100} />);
    progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-valuenow', '100');
  });

  it('applies custom size classes', () => {
    render(<Progress size="lg" />);
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar.className).toContain('h-4');
  });

  it('applies custom indicator classes', () => {
    render(<Progress indicatorClassName="bg-red-500" value={20} />);
    const indicator = screen.getByTestId('progress-indicator');
    expect(indicator.className).toContain('bg-red-500');
  });
});

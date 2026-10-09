import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Skeleton } from '../Skeleton';
import React from 'react';

describe('Skeleton Component', () => {
  it('renders correctly with default props', () => {
    render(<Skeleton />);
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveClass('animate-pulse');
    expect(skeleton).toHaveClass('rounded-md'); // default variant is 'rounded'
  });

  it('renders circular variant', () => {
    render(<Skeleton variant="circular" />);
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveClass('rounded-full');
  });

  it('renders rectangular variant', () => {
    render(<Skeleton variant="rectangular" />);
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).not.toHaveClass('rounded-md');
    expect(skeleton).not.toHaveClass('rounded-full');
    expect(skeleton).not.toHaveClass('rounded-sm');
  });

  it('renders text variant', () => {
    render(<Skeleton variant="text" />);
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveClass('rounded-sm');
  });

  it('applies custom width and height', () => {
    render(<Skeleton width="100px" height={50} />);
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveStyle({ width: '100px', height: '50px' });
  });

  it('applies custom className', () => {
    render(<Skeleton className="custom-class" />);
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveClass('custom-class');
  });
});

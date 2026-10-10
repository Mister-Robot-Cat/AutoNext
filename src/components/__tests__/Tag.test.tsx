import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Tag } from '../Tag';

describe('Tag Component', () => {
  it('renders correctly with default props', () => {
    render(<Tag>Default Tag</Tag>);
    const tag = screen.getByTestId('tag');
    expect(tag).toBeInTheDocument();
    expect(tag).toHaveTextContent('Default Tag');
    expect(tag).toHaveClass('bg-blue-100'); // primary variant default
  });

  it('applies variant classes correctly', () => {
    render(<Tag variant="success">Success Tag</Tag>);
    const tag = screen.getByTestId('tag');
    expect(tag).toHaveClass('bg-green-100');
  });

  it('applies size classes correctly', () => {
    render(<Tag size="lg">Large Tag</Tag>);
    const tag = screen.getByTestId('tag');
    expect(tag).toHaveClass('text-base');
  });

  it('renders close button when closable is true', () => {
    render(<Tag closable>Closable Tag</Tag>);
    const closeBtn = screen.getByTestId('tag-close-btn');
    expect(closeBtn).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const handleClose = vi.fn();
    render(<Tag closable onClose={handleClose}>Closable Tag</Tag>);
    
    const closeBtn = screen.getByTestId('tag-close-btn');
    fireEvent.click(closeBtn);
    
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});

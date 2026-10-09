import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Radio } from '../Radio';

describe('Radio', () => {
  it('renders correctly without label', () => {
    const { container } = render(<Radio />);
    expect(container.querySelector('input[type="radio"]')).toBeInTheDocument();
  });

  it('renders correctly with label and description', () => {
    render(<Radio label="Option 1" description="This is option 1" />);
    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('This is option 1')).toBeInTheDocument();
  });

  it('handles state changes', () => {
    const handleChange = vi.fn();
    const { container } = render(<Radio onChange={handleChange} />);
    
    const input = container.querySelector('input[type="radio"]') as HTMLInputElement;
    fireEvent.click(input);
    
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('respects disabled state', () => {
    const handleChange = vi.fn();
    const { container } = render(<Radio disabled onChange={handleChange} />);
    
    const input = container.querySelector('input[type="radio"]') as HTMLInputElement;
    expect(input).toBeDisabled();
    
    fireEvent.click(input);
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('reflects checked prop', () => {
    const { container, rerender } = render(<Radio checked={true} readOnly />);
    let input = container.querySelector('input[type="radio"]') as HTMLInputElement;
    expect(input.checked).toBe(true);

    rerender(<Radio checked={false} readOnly />);
    input = container.querySelector('input[type="radio"]') as HTMLInputElement;
    expect(input.checked).toBe(false);
  });
});

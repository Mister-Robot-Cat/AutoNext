import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Switch } from '../Switch';

describe('Switch', () => {
  it('renders correctly without label', () => {
    const { container } = render(<Switch />);
    expect(container.querySelector('input[type="checkbox"]')).toBeInTheDocument();
  });

  it('renders correctly with label and description', () => {
    render(<Switch label="Enable Wi-Fi" description="Connect to nearby networks" />);
    expect(screen.getByText('Enable Wi-Fi')).toBeInTheDocument();
    expect(screen.getByText('Connect to nearby networks')).toBeInTheDocument();
  });

  it('handles state changes', () => {
    const handleChange = vi.fn();
    const { container } = render(<Switch onChange={handleChange} />);
    
    const input = container.querySelector('input[type="checkbox"]') as HTMLInputElement;
    fireEvent.click(input);
    
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('respects disabled state', () => {
    const handleChange = vi.fn();
    const { container } = render(<Switch disabled onChange={handleChange} />);
    
    const input = container.querySelector('input[type="checkbox"]') as HTMLInputElement;
    expect(input).toBeDisabled();
    
    fireEvent.click(input);
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('reflects checked prop', () => {
    const { container, rerender } = render(<Switch checked={true} readOnly />);
    let input = container.querySelector('input[type="checkbox"]') as HTMLInputElement;
    expect(input.checked).toBe(true);

    rerender(<Switch checked={false} readOnly />);
    input = container.querySelector('input[type="checkbox"]') as HTMLInputElement;
    expect(input.checked).toBe(false);
  });
});

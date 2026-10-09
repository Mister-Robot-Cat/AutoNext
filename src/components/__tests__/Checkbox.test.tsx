import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Checkbox } from '../Checkbox';

describe('Checkbox', () => {
  it('renders correctly without label', () => {
    const { container } = render(<Checkbox />);
    expect(container.querySelector('input[type="checkbox"]')).toBeInTheDocument();
  });

  it('renders correctly with label and description', () => {
    render(<Checkbox label="Accept Terms" description="You must accept to continue" />);
    expect(screen.getByText('Accept Terms')).toBeInTheDocument();
    expect(screen.getByText('You must accept to continue')).toBeInTheDocument();
  });

  it('handles state changes', () => {
    const handleChange = vi.fn();
    const { container } = render(<Checkbox onChange={handleChange} />);
    
    const input = container.querySelector('input[type="checkbox"]') as HTMLInputElement;
    fireEvent.click(input);
    
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('respects disabled state', () => {
    const handleChange = vi.fn();
    const { container } = render(<Checkbox disabled onChange={handleChange} />);
    
    const input = container.querySelector('input[type="checkbox"]') as HTMLInputElement;
    expect(input).toBeDisabled();
    
    fireEvent.click(input);
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('reflects checked prop', () => {
    const { container, rerender } = render(<Checkbox checked={true} readOnly />);
    let input = container.querySelector('input[type="checkbox"]') as HTMLInputElement;
    expect(input.checked).toBe(true);

    rerender(<Checkbox checked={false} readOnly />);
    input = container.querySelector('input[type="checkbox"]') as HTMLInputElement;
    expect(input.checked).toBe(false);
  });

  it('handles indeterminate state correctly', () => {
    const { container, rerender } = render(<Checkbox indeterminate={true} readOnly />);
    let input = container.querySelector('input[type="checkbox"]') as HTMLInputElement;
    expect(input.indeterminate).toBe(true);

    rerender(<Checkbox indeterminate={false} readOnly />);
    input = container.querySelector('input[type="checkbox"]') as HTMLInputElement;
    expect(input.indeterminate).toBe(false);
  });
});

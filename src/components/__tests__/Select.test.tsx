import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Select } from '../Select';

describe('Select', () => {
  const defaultOptions = [
    { value: '1', label: 'Option 1' },
    { value: '2', label: 'Option 2' },
    { value: '3', label: 'Option 3', disabled: true },
  ];

  it('renders select with options correctly', () => {
    render(<Select options={defaultOptions} />);
    
    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
    
    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(3);
    
    expect(options[0]).toHaveTextContent('Option 1');
    expect(options[0]).toHaveAttribute('value', '1');
    expect(options[2]).toBeDisabled();
  });

  it('renders label when provided', () => {
    render(<Select label="My Select Label" options={defaultOptions} id="my-select" />);
    
    const label = screen.getByText('My Select Label');
    expect(label).toBeInTheDocument();
    expect(label).toHaveAttribute('for', 'my-select');
  });

  it('renders error message when provided', () => {
    render(<Select error="This field is required" options={defaultOptions} />);
    
    const errorMsg = screen.getByTestId('error-message');
    expect(errorMsg).toBeInTheDocument();
    expect(errorMsg).toHaveTextContent('This field is required');
  });

  it('calls onChange handler when value changes', () => {
    const handleChange = vi.fn();
    render(<Select options={defaultOptions} onChange={handleChange} />);
    
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '2' } });
    
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('applies disabled state correctly', () => {
    render(<Select options={defaultOptions} disabled />);
    
    const select = screen.getByRole('combobox');
    expect(select).toBeDisabled();
  });

  it('applies fullWidth class when fullWidth is true', () => {
    const { container } = render(<Select options={defaultOptions} fullWidth />);
    expect(container.firstChild).toHaveClass('w-full');
  });
});

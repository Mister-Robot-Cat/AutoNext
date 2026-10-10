import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ToggleGroup } from '../ToggleGroup';
import React from 'react';
import userEvent from '@testing-library/user-event';

describe('ToggleGroup Component', () => {
  const options = [
    { label: 'Option 1', value: '1' },
    { label: 'Option 2', value: '2' },
    { label: 'Option 3', value: '3', disabled: true },
  ];

  it('renders all options', () => {
    const handleChange = vi.fn();
    render(<ToggleGroup options={options} value="1" onChange={handleChange} />);
    
    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
    expect(screen.getByText('Option 3')).toBeInTheDocument();
  });

  it('indicates the selected option', () => {
    const handleChange = vi.fn();
    render(<ToggleGroup options={options} value="2" onChange={handleChange} />);
    
    const option1 = screen.getByText('Option 1');
    const option2 = screen.getByText('Option 2');
    
    expect(option2).toHaveAttribute('aria-checked', 'true');
    expect(option1).toHaveAttribute('aria-checked', 'false');
  });

  it('calls onChange when an unselected option is clicked', async () => {
    const handleChange = vi.fn();
    render(<ToggleGroup options={options} value="1" onChange={handleChange} />);
    
    const option2 = screen.getByText('Option 2');
    await userEvent.click(option2);
    
    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith('2');
  });

  it('does not call onChange when a disabled option is clicked', async () => {
    const handleChange = vi.fn();
    render(<ToggleGroup options={options} value="1" onChange={handleChange} />);
    
    const option3 = screen.getByText('Option 3');
    await userEvent.click(option3);
    
    expect(handleChange).not.toHaveBeenCalled();
  });
});

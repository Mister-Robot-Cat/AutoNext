import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { Autocomplete, AutocompleteOption } from '../Autocomplete';
import React from 'react';

const mockOptions: AutocompleteOption[] = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
  { value: 'date', label: 'Date' },
];

describe('Autocomplete', () => {
  it('renders input with placeholder', () => {
    render(<Autocomplete options={mockOptions} placeholder="Select fruit" />);
    expect(screen.getByPlaceholderText('Select fruit')).toBeInTheDocument();
  });

  it('shows options on focus', async () => {
    const user = userEvent.setup();
    render(<Autocomplete options={mockOptions} placeholder="Select fruit" />);
    
    const input = screen.getByPlaceholderText('Select fruit');
    await user.click(input);
    
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(screen.getAllByRole('option')).toHaveLength(4);
    expect(screen.getByText('Apple')).toBeInTheDocument();
  });

  it('filters options based on input', async () => {
    const user = userEvent.setup();
    render(<Autocomplete options={mockOptions} placeholder="Select fruit" />);
    
    const input = screen.getByPlaceholderText('Select fruit');
    await user.type(input, 'ap');
    
    expect(screen.getAllByRole('option')).toHaveLength(1);
    expect(screen.getByText('Apple')).toBeInTheDocument();
    expect(screen.queryByText('Banana')).not.toBeInTheDocument();
  });

  it('calls onChange when an option is selected', async () => {
    const onChangeMock = vi.fn();
    const user = userEvent.setup();
    
    render(<Autocomplete options={mockOptions} onChange={onChangeMock} placeholder="Select fruit" />);
    
    const input = screen.getByPlaceholderText('Select fruit');
    await user.click(input);
    
    const option = screen.getByText('Banana');
    await user.click(option);
    
    expect(onChangeMock).toHaveBeenCalledWith('banana');
    expect(input).toHaveValue('Banana');
  });

  it('handles keyboard navigation', async () => {
    const onChangeMock = vi.fn();
    const user = userEvent.setup();
    
    render(<Autocomplete options={mockOptions} onChange={onChangeMock} placeholder="Select fruit" />);
    
    const input = screen.getByPlaceholderText('Select fruit');
    input.focus();
    
    // Arrow down to highlight first option
    await user.keyboard('{ArrowDown}');
    // Arrow down to highlight second option
    await user.keyboard('{ArrowDown}');
    // Enter to select
    await user.keyboard('{Enter}');
    
    expect(onChangeMock).toHaveBeenCalledWith('banana');
  });

  it('clears selection when clear button is clicked', async () => {
    const onChangeMock = vi.fn();
    const user = userEvent.setup();
    
    render(<Autocomplete options={mockOptions} value="cherry" onChange={onChangeMock} clearable={true} placeholder="Select fruit" />);
    
    const input = screen.getByPlaceholderText('Select fruit');
    expect(input).toHaveValue('Cherry');
    
    const clearButton = screen.getByLabelText('Clear selection');
    await user.click(clearButton);
    
    expect(onChangeMock).toHaveBeenCalledWith('');
    expect(input).toHaveValue('');
  });
});

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Textarea } from '../Textarea';

describe('Textarea', () => {
  it('renders without crashing', () => {
    render(<Textarea placeholder="Enter text..." />);
    expect(screen.getByPlaceholderText('Enter text...')).toBeDefined();
  });

  it('displays a label when provided', () => {
    render(<Textarea label="Message" id="message-input" />);
    expect(screen.getByLabelText('Message')).toBeDefined();
    expect(screen.getByText('Message')).toBeDefined();
  });

  it('displays an error message', () => {
    render(<Textarea error="This field is required" />);
    const errorMessage = screen.getByTestId('error-message');
    expect(errorMessage.textContent).toBe('This field is required');
  });

  it('applies disabled styles and attributes', () => {
    render(<Textarea disabled placeholder="Disabled textarea" />);
    const textarea = screen.getByPlaceholderText('Disabled textarea') as HTMLTextAreaElement;
    expect(textarea.disabled).toBe(true);
    expect(textarea.className).toContain('opacity-50');
    expect(textarea.className).toContain('cursor-not-allowed');
  });

  it('handles value changes', () => {
    const handleChange = vi.fn();
    render(<Textarea placeholder="Type here" onChange={handleChange} />);
    const textarea = screen.getByPlaceholderText('Type here');
    
    fireEvent.change(textarea, { target: { value: 'Hello' } });
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('applies error styles when error is provided', () => {
    render(<Textarea error="Error" placeholder="Error field" />);
    const textarea = screen.getByPlaceholderText('Error field');
    expect(textarea.className).toContain('border-red-500/50');
  });
});

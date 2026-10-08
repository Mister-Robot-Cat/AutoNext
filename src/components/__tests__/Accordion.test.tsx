import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Accordion } from '../Accordion';

const mockItems = [
  { id: '1', title: 'Item 1', content: 'Content 1' },
  { id: '2', title: 'Item 2', content: 'Content 2' },
  { id: '3', title: 'Item 3', content: 'Content 3' },
];

describe('Accordion', () => {
  it('renders all items', () => {
    render(<Accordion items={mockItems} />);
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
    expect(screen.getByText('Item 3')).toBeInTheDocument();
  });

  it('manages aria-expanded correctly for single mode', () => {
    render(<Accordion items={mockItems} />);
    
    const button1 = screen.getByText('Item 1').closest('button')!;
    const button2 = screen.getByText('Item 2').closest('button')!;

    expect(button1).toHaveAttribute('aria-expanded', 'false');
    
    fireEvent.click(button1);
    expect(button1).toHaveAttribute('aria-expanded', 'true');
    expect(button2).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(button2);
    expect(button1).toHaveAttribute('aria-expanded', 'false');
    expect(button2).toHaveAttribute('aria-expanded', 'true');
  });

  it('allows multiple items to be expanded when allowMultiple is true', () => {
    render(<Accordion items={mockItems} allowMultiple />);
    
    const button1 = screen.getByText('Item 1').closest('button')!;
    const button2 = screen.getByText('Item 2').closest('button')!;

    fireEvent.click(button1);
    fireEvent.click(button2);

    expect(button1).toHaveAttribute('aria-expanded', 'true');
    expect(button2).toHaveAttribute('aria-expanded', 'true');
  });
  
  it('respects defaultExpanded prop', () => {
    render(<Accordion items={mockItems} defaultExpanded={['2']} />);
    const button2 = screen.getByText('Item 2').closest('button')!;
    expect(button2).toHaveAttribute('aria-expanded', 'true');
  });
});

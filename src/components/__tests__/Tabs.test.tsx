import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Tabs } from '../Tabs';

const mockItems = [
  { id: 'tab1', label: 'Tab 1', content: <div data-testid="content1">Content 1</div> },
  { id: 'tab2', label: 'Tab 2', content: <div data-testid="content2">Content 2</div> },
  { id: 'tab3', label: 'Tab 3', content: <div data-testid="content3">Content 3</div> },
];

describe('Tabs', () => {
  it('renders all tab labels', () => {
    render(<Tabs items={mockItems} />);
    expect(screen.getByText('Tab 1')).toBeInTheDocument();
    expect(screen.getByText('Tab 2')).toBeInTheDocument();
    expect(screen.getByText('Tab 3')).toBeInTheDocument();
  });

  it('renders the content of the first tab by default', () => {
    render(<Tabs items={mockItems} />);
    expect(screen.getByTestId('content1')).toBeInTheDocument();
    expect(screen.queryByTestId('content2')).not.toBeInTheDocument();
    expect(screen.queryByTestId('content3')).not.toBeInTheDocument();
  });

  it('renders the content of the defaultTab if provided', () => {
    render(<Tabs items={mockItems} defaultTab="tab2" />);
    expect(screen.queryByTestId('content1')).not.toBeInTheDocument();
    expect(screen.getByTestId('content2')).toBeInTheDocument();
  });

  it('switches tabs on click and calls onChange', () => {
    const handleChange = vi.fn();
    render(<Tabs items={mockItems} onChange={handleChange} />);
    
    const tab2 = screen.getByText('Tab 2');
    fireEvent.click(tab2);

    expect(screen.getByTestId('content2')).toBeInTheDocument();
    expect(screen.queryByTestId('content1')).not.toBeInTheDocument();
    expect(handleChange).toHaveBeenCalledWith('tab2');
  });

  it('sets appropriate aria attributes', () => {
    render(<Tabs items={mockItems} />);
    
    const tab1 = screen.getByText('Tab 1');
    const tab2 = screen.getByText('Tab 2');

    expect(tab1).toHaveAttribute('aria-selected', 'true');
    expect(tab2).toHaveAttribute('aria-selected', 'false');

    fireEvent.click(tab2);

    expect(tab1).toHaveAttribute('aria-selected', 'false');
    expect(tab2).toHaveAttribute('aria-selected', 'true');
  });

  it('returns null if no items are provided', () => {
    const { container } = render(<Tabs items={[]} />);
    expect(container.firstChild).toBeNull();
  });
});

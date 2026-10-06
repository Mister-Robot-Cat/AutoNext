import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Pagination } from '../Pagination';
import React from 'react';

describe('Pagination Component', () => {
  it('renders correctly', () => {
    render(<Pagination currentPage={2} totalPages={5} onPageChange={vi.fn()} />);
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('does not render if totalPages is 1', () => {
    const { container } = render(<Pagination currentPage={1} totalPages={1} onPageChange={vi.fn()} />);
    expect(container.firstChild).toBeNull();
  });

  it('calls onPageChange with correct values', () => {
    const onPageChange = vi.fn();
    render(<Pagination currentPage={2} totalPages={5} onPageChange={onPageChange} />);
    
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[0]); // Previous
    expect(onPageChange).toHaveBeenCalledWith(1);
    
    fireEvent.click(buttons[1]); // Next
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it('disables previous button on first page', () => {
    render(<Pagination currentPage={1} totalPages={5} onPageChange={vi.fn()} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons[0]).toBeDisabled();
    expect(buttons[1]).not.toBeDisabled();
  });

  it('disables next button on last page', () => {
    render(<Pagination currentPage={5} totalPages={5} onPageChange={vi.fn()} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons[0]).not.toBeDisabled();
    expect(buttons[1]).toBeDisabled();
  });
});

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Rating } from '../Rating';

describe('Rating Component', () => {
  it('renders correct number of stars based on max prop', () => {
    render(<Rating value={3} max={5} />);
    const stars = screen.getAllByRole('radio');
    expect(stars).toHaveLength(5);
  });

  it('highlights correct number of stars based on value', () => {
    render(<Rating value={3} max={5} readOnly />);
    const stars = screen.getAllByRole('img');
    
    // First 3 should have amber color class, last 2 should be gray
    expect(stars[0].className).toContain('text-amber-400');
    expect(stars[2].className).toContain('text-amber-400');
    expect(stars[3].className).toContain('text-gray-300');
  });

  it('calls onChange with correct value when clicked', () => {
    const handleChange = vi.fn();
    render(<Rating value={0} onChange={handleChange} />);
    
    const stars = screen.getAllByRole('radio');
    fireEvent.click(stars[3]); // 4th star
    
    expect(handleChange).toHaveBeenCalledWith(4);
  });

  it('does not call onChange when readOnly is true', () => {
    const handleChange = vi.fn();
    render(<Rating value={3} onChange={handleChange} readOnly />);
    
    const stars = screen.getAllByRole('img');
    fireEvent.click(stars[4]);
    
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('updates visual state on hover when interactive', () => {
    render(<Rating value={2} onChange={vi.fn()} />);
    const stars = screen.getAllByRole('radio');
    
    // Initially star 4 is gray
    expect(stars[3].className).toContain('text-gray-300');
    
    // Hover on star 4
    fireEvent.mouseMove(stars[3]);
    expect(stars[3].className).toContain('text-amber-400');
    
    // Leave
    fireEvent.mouseLeave(screen.getByRole('radiogroup'));
    expect(stars[3].className).toContain('text-gray-300');
  });
});

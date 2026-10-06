import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ScrollToTop } from '../ScrollToTop';

describe('ScrollToTop', () => {
  beforeEach(() => {
    // Mock window.scrollTo
    window.scrollTo = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should not be visible initially when scrollY is 0', () => {
    window.scrollY = 0;
    render(<ScrollToTop />);
    const button = screen.queryByRole('button', { name: /scroll to top/i });
    expect(button).not.toBeInTheDocument();
  });

  it('should become visible when scrolling down past 400px', () => {
    render(<ScrollToTop />);
    
    // Simulate scroll
    window.scrollY = 500;
    fireEvent.scroll(window);
    
    const button = screen.getByRole('button', { name: /scroll to top/i });
    expect(button).toBeInTheDocument();
  });

  it('should scroll to top when clicked', () => {
    window.scrollY = 500;
    render(<ScrollToTop />);
    
    // Make visible
    fireEvent.scroll(window);
    
    const button = screen.getByRole('button', { name: /scroll to top/i });
    fireEvent.click(button);
    
    expect(window.scrollTo).toHaveBeenCalledWith({
      top: 0,
      behavior: 'smooth'
    });
  });

  it('should hide when scrolling back up', () => {
    window.scrollY = 500;
    render(<ScrollToTop />);
    fireEvent.scroll(window);
    
    expect(screen.getByRole('button', { name: /scroll to top/i })).toBeInTheDocument();

    // Scroll back up
    window.scrollY = 200;
    fireEvent.scroll(window);
    
    expect(screen.queryByRole('button', { name: /scroll to top/i })).not.toBeInTheDocument();
  });
});

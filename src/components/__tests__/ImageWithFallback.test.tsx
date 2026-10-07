import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ImageWithFallback } from '../ImageWithFallback';

describe('ImageWithFallback', () => {
  it('renders loading state initially and then the image when loaded', () => {
    render(<ImageWithFallback src="test.jpg" alt="Test Image" />);
    
    // Image element should be present
    const img = screen.getByRole('img');
    expect(img).toBeInTheDocument();
    
    // Simulate image load
    fireEvent.load(img);
    
    // Now it should have opacity-100 class
    expect(img).toHaveClass('opacity-100');
  });

  it('shows fallback content when image fails to load and no fallbackSrc provided', () => {
    render(<ImageWithFallback src="invalid.jpg" alt="Broken Image" fallbackText="Custom Error text" />);
    
    const img = screen.getByRole('img');
    fireEvent.error(img);
    
    // The image element is removed and replaced by fallback UI
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.getByText('Custom Error text')).toBeInTheDocument();
  });

  it('loads fallbackSrc when original image fails', () => {
    render(<ImageWithFallback src="invalid.jpg" alt="Broken Image" fallbackSrc="fallback.jpg" />);
    
    const img = screen.getByRole('img');
    fireEvent.error(img);
    
    // Image element should still be present but with fallback source
    expect(screen.getByRole('img')).toHaveAttribute('src', 'fallback.jpg');
  });
});

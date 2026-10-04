import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { LightboxViewer } from '../LightboxViewer';

const mockImages = [
  'image1.jpg',
  'image2.jpg',
  'image3.jpg',
];

describe('LightboxViewer', () => {
  let onCloseMock: any;

  beforeEach(() => {
    onCloseMock = vi.fn();
    // Mock overflow behavior
    vi.spyOn(document.body.style, 'setProperty');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the initial image correctly', () => {
    render(
      <LightboxViewer 
        images={mockImages} 
        initialIndex={0} 
        onClose={onCloseMock} 
      />
    );

    const img = screen.getByAltText('Gallery image 1');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'image1.jpg');
    
    // Counter should show 1 / 3
    expect(screen.getByText('1 / 3')).toBeInTheDocument();
  });

  it('navigates to the next image when clicking next arrow', () => {
    const { container } = render(
      <LightboxViewer 
        images={mockImages} 
        initialIndex={0} 
        onClose={onCloseMock} 
      />
    );

    // Using Lucide-react ChevronRight icon - usually renders an SVG. 
    // We can query by role or just find buttons.
    const buttons = screen.getAllByRole('button');
    // zoom, close, prev, next, thumbs(3) -> 7 buttons total
    // But prev/next only show if images.length > 1
    
    // Instead of relying on icon names, we can look for the button containing the ChevronRight SVG, 
    // but easier is simulating a right arrow key press.
    fireEvent.keyDown(window, { key: 'ArrowRight', code: 'ArrowRight' });

    expect(screen.getByAltText('Gallery image 2')).toHaveAttribute('src', 'image2.jpg');
    expect(screen.getByText('2 / 3')).toBeInTheDocument();
  });

  it('navigates to the previous image when pressing left arrow', () => {
    render(
      <LightboxViewer 
        images={mockImages} 
        initialIndex={0} 
        onClose={onCloseMock} 
      />
    );

    fireEvent.keyDown(window, { key: 'ArrowLeft', code: 'ArrowLeft' });

    // Should wrap around to the last image
    expect(screen.getByAltText('Gallery image 3')).toHaveAttribute('src', 'image3.jpg');
    expect(screen.getByText('3 / 3')).toBeInTheDocument();
  });

  it('calls onClose when pressing Escape key', () => {
    render(
      <LightboxViewer 
        images={mockImages} 
        initialIndex={0} 
        onClose={onCloseMock} 
      />
    );

    fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' });
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it('changes image when clicking a thumbnail', () => {
    render(
      <LightboxViewer 
        images={mockImages} 
        initialIndex={0} 
        onClose={onCloseMock} 
      />
    );

    const thumbnails = screen.getAllByAltText('thumb');
    expect(thumbnails).toHaveLength(3);

    fireEvent.click(thumbnails[2]); // Click third thumbnail

    expect(screen.getByAltText('Gallery image 3')).toHaveAttribute('src', 'image3.jpg');
    expect(screen.getByText('3 / 3')).toBeInTheDocument();
  });
});

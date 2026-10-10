import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Carousel } from '../Carousel';

describe('Carousel Component', () => {
  const mockSlides = [
    <div key="1" data-testid="slide-1">Slide 1</div>,
    <div key="2" data-testid="slide-2">Slide 2</div>,
    <div key="3" data-testid="slide-3">Slide 3</div>,
  ];

  it('renders correctly with children', () => {
    render(<Carousel>{mockSlides}</Carousel>);
    expect(screen.getByTestId('carousel')).toBeInTheDocument();
    expect(screen.getByTestId('slide-1')).toBeInTheDocument();
    expect(screen.getByTestId('slide-2')).toBeInTheDocument();
    expect(screen.getByTestId('slide-3')).toBeInTheDocument();
  });

  it('does not render if no children are provided', () => {
    const { container } = render(<Carousel>{[]}</Carousel>);
    expect(container.firstChild).toBeNull();
  });

  it('navigates to next slide on right arrow click', () => {
    render(<Carousel>{mockSlides}</Carousel>);
    
    const nextButton = screen.getByLabelText('Next slide');
    const track = screen.getByTestId('carousel-track');
    
    expect(track).toHaveStyle({ transform: 'translateX(-0%)' });
    
    fireEvent.click(nextButton);
    expect(track).toHaveStyle({ transform: 'translateX(-100%)' });
    
    fireEvent.click(nextButton);
    expect(track).toHaveStyle({ transform: 'translateX(-200%)' });
    
    // Should loop back to first
    fireEvent.click(nextButton);
    expect(track).toHaveStyle({ transform: 'translateX(-0%)' });
  });

  it('navigates to previous slide on left arrow click', () => {
    render(<Carousel>{mockSlides}</Carousel>);
    
    const prevButton = screen.getByLabelText('Previous slide');
    const track = screen.getByTestId('carousel-track');
    
    expect(track).toHaveStyle({ transform: 'translateX(-0%)' });
    
    // Should loop back to last
    fireEvent.click(prevButton);
    expect(track).toHaveStyle({ transform: 'translateX(-200%)' });
    
    fireEvent.click(prevButton);
    expect(track).toHaveStyle({ transform: 'translateX(-100%)' });
  });

  it('navigates to specific slide on dot click', () => {
    render(<Carousel>{mockSlides}</Carousel>);
    
    const dot2 = screen.getByTestId('carousel-dot-2');
    const track = screen.getByTestId('carousel-track');
    
    fireEvent.click(dot2);
    expect(track).toHaveStyle({ transform: 'translateX(-200%)' });
  });

  it('calls onSlideChange callback', () => {
    const handleSlideChange = vi.fn();
    render(<Carousel onSlideChange={handleSlideChange}>{mockSlides}</Carousel>);
    
    const nextButton = screen.getByLabelText('Next slide');
    fireEvent.click(nextButton);
    
    expect(handleSlideChange).toHaveBeenCalledWith(1);
  });

  it('auto plays when autoPlay is true', () => {
    vi.useFakeTimers();
    render(<Carousel autoPlay interval={1000}>{mockSlides}</Carousel>);
    
    const track = screen.getByTestId('carousel-track');
    expect(track).toHaveStyle({ transform: 'translateX(-0%)' });
    
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    
    expect(track).toHaveStyle({ transform: 'translateX(-100%)' });
    
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    
    expect(track).toHaveStyle({ transform: 'translateX(-200%)' });
    
    vi.useRealTimers();
  });

  it('pauses auto play on hover', () => {
    vi.useFakeTimers();
    render(<Carousel autoPlay interval={1000}>{mockSlides}</Carousel>);
    
    const track = screen.getByTestId('carousel-track');
    const carousel = screen.getByTestId('carousel');
    
    fireEvent.mouseEnter(carousel);
    
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    
    // Should still be on first slide because it's paused
    expect(track).toHaveStyle({ transform: 'translateX(-0%)' });
    
    fireEvent.mouseLeave(carousel);
    
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    
    expect(track).toHaveStyle({ transform: 'translateX(-100%)' });
    
    vi.useRealTimers();
  });
  
  it('handles touch swipe events', () => {
    render(<Carousel>{mockSlides}</Carousel>);
    
    const carousel = screen.getByTestId('carousel');
    const track = screen.getByTestId('carousel-track');
    
    // Swipe left (next)
    fireEvent.touchStart(carousel, { touches: [{ clientX: 200 }] });
    fireEvent.touchEnd(carousel, { changedTouches: [{ clientX: 100 }] });
    
    expect(track).toHaveStyle({ transform: 'translateX(-100%)' });
    
    // Swipe right (prev)
    fireEvent.touchStart(carousel, { touches: [{ clientX: 100 }] });
    fireEvent.touchEnd(carousel, { changedTouches: [{ clientX: 200 }] });
    
    expect(track).toHaveStyle({ transform: 'translateX(-0%)' });
  });
});

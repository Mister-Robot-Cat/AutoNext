import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface CarouselProps {
  children: React.ReactNode[];
  showArrows?: boolean;
  showDots?: boolean;
  autoPlay?: boolean;
  interval?: number;
  className?: string;
  onSlideChange?: (index: number) => void;
}

export const Carousel: React.FC<CarouselProps> = ({
  children,
  showArrows = true,
  showDots = true,
  autoPlay = false,
  interval = 3000,
  className = '',
  onSlideChange,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => {
      const newIndex = (prevIndex + 1) % children.length;
      onSlideChange?.(newIndex);
      return newIndex;
    });
  }, [children.length, onSlideChange]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => {
      const newIndex = prevIndex === 0 ? children.length - 1 : prevIndex - 1;
      onSlideChange?.(newIndex);
      return newIndex;
    });
  }, [children.length, onSlideChange]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    onSlideChange?.(index);
  };

  useEffect(() => {
    if (!autoPlay || isHovered) return;

    const timer = setInterval(nextSlide, interval);
    return () => clearInterval(timer);
  }, [autoPlay, interval, nextSlide, isHovered]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    if (diff > 50) {
      nextSlide();
    } else if (diff < -50) {
      prevSlide();
    }
    touchStartX.current = null;
  };

  if (!children || children.length === 0) {
    return null;
  }

  return (
    <div
      className={`relative w-full overflow-hidden rounded-lg group ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      data-testid="carousel"
    >
      <div
        className="flex transition-transform duration-500 ease-in-out h-full"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        data-testid="carousel-track"
      >
        {children.map((child, index) => (
          <div key={index} className="w-full flex-shrink-0 h-full">
            {child}
          </div>
        ))}
      </div>

      {showArrows && children.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/75 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none focus:ring-2 focus:ring-white"
            aria-label="Previous slide"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/75 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none focus:ring-2 focus:ring-white"
            aria-label="Next slide"
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}

      {showDots && children.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
          {children.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white ${
                index === currentIndex ? 'bg-white' : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Go to slide ${index + 1}`}
              data-testid={`carousel-dot-${index}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

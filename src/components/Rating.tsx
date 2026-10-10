import React, { useState } from 'react';
import { Star, StarHalf } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface RatingProps {
  value: number;
  max?: number;
  onChange?: (value: number) => void;
  readOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  allowHalf?: boolean;
}

export const Rating: React.FC<RatingProps> = ({
  value,
  max = 5,
  onChange,
  readOnly = false,
  size = 'md',
  className,
  allowHalf = false,
}) => {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const displayValue = hoverValue !== null ? hoverValue : value;

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLSpanElement>, index: number) => {
    if (readOnly || !onChange) return;
    
    if (allowHalf) {
      const { left, width } = e.currentTarget.getBoundingClientRect();
      const percent = (e.clientX - left) / width;
      setHoverValue(percent < 0.5 ? index + 0.5 : index + 1);
    } else {
      setHoverValue(index + 1);
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLSpanElement>, index: number) => {
    if (readOnly || !onChange) return;
    
    if (allowHalf) {
      const { left, width } = e.currentTarget.getBoundingClientRect();
      const percent = (e.clientX - left) / width;
      onChange(percent < 0.5 ? index + 0.5 : index + 1);
    } else {
      onChange(index + 1);
    }
  };

  const handleMouseLeave = () => {
    if (readOnly || !onChange) return;
    setHoverValue(null);
  };

  return (
    <div 
      className={twMerge('flex items-center gap-1', className)}
      onMouseLeave={handleMouseLeave}
      role="radiogroup"
      aria-label="Rating"
    >
      {Array.from({ length: max }).map((_, i) => {
        const starValue = i + 1;
        const isFull = displayValue >= starValue;
        const isHalf = allowHalf && displayValue >= starValue - 0.5 && displayValue < starValue;

        return (
          <span
            key={i}
            role={readOnly ? 'img' : 'radio'}
            aria-checked={isFull || isHalf}
            tabIndex={readOnly ? -1 : 0}
            className={clsx(
              'cursor-pointer transition-colors',
              readOnly && 'cursor-default',
              (isFull || isHalf) ? 'text-amber-400' : 'text-gray-300 dark:text-gray-600',
              !readOnly && 'hover:scale-110'
            )}
            onMouseMove={(e) => handleMouseMove(e, i)}
            onClick={(e) => handleClick(e, i)}
            onKeyDown={(e) => {
              if (readOnly || !onChange) return;
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onChange(starValue);
              }
            }}
          >
            {isHalf ? (
              <div className="relative">
                <Star className={clsx(sizeClasses[size], 'fill-transparent text-gray-300 dark:text-gray-600')} />
                <div className="absolute inset-0 overflow-hidden w-1/2">
                  <Star className={clsx(sizeClasses[size], 'fill-amber-400 text-amber-400')} />
                </div>
              </div>
            ) : (
              <Star 
                className={clsx(
                  sizeClasses[size],
                  isFull ? 'fill-amber-400' : 'fill-transparent'
                )} 
              />
            )}
          </span>
        );
      })}
    </div>
  );
};

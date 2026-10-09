import React from 'react';

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Current progress value (0-100) */
  value?: number;
  /** Maximum progress value (default: 100) */
  max?: number;
  /** Optional custom color class (default: bg-blue-600) */
  indicatorClassName?: string;
  /** Visual size variant */
  size?: 'sm' | 'md' | 'lg';
}

export function Progress({
  value = 0,
  max = 100,
  indicatorClassName = 'bg-blue-600 dark:bg-blue-500',
  size = 'md',
  className = '',
  ...props
}: ProgressProps) {
  // Ensure value is bounded between 0 and max
  const boundedValue = Math.min(Math.max(value, 0), max);
  const percentage = Math.round((boundedValue / max) * 100);

  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  return (
    <div
      role="progressbar"
      aria-valuenow={boundedValue}
      aria-valuemin={0}
      aria-valuemax={max}
      className={`w-full bg-gray-200 rounded-full dark:bg-gray-700 overflow-hidden ${sizeClasses[size]} ${className}`}
      {...props}
    >
      <div
        className={`h-full rounded-full transition-all duration-300 ease-in-out ${indicatorClassName}`}
        style={{ width: `${percentage}%` }}
        data-testid="progress-indicator"
      />
    </div>
  );
}

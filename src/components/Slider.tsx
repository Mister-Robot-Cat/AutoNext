import React, { forwardRef } from 'react';

export interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  value?: number;
  min?: number;
  max?: number;
  step?: number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  thumbClassName?: string;
  trackClassName?: string;
}

export const Slider = forwardRef<HTMLInputElement, SliderProps>(
  (
    {
      value,
      min = 0,
      max = 100,
      step = 1,
      onChange,
      className = '',
      thumbClassName = '',
      trackClassName = '',
      disabled,
      ...props
    },
    ref
  ) => {
    // Calculate percentage for background gradient
    const percentage = ((Number(value || min) - min) / (max - min)) * 100;

    return (
      <div className={`relative flex w-full items-center ${className}`}>
        <input
          type="range"
          ref={ref}
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={onChange}
          disabled={disabled}
          className={`w-full appearance-none bg-transparent cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 rounded-full h-2 disabled:cursor-not-allowed disabled:opacity-50 ${trackClassName}`}
          style={{
            background: `linear-gradient(to right, #3b82f6 ${percentage}%, #e5e7eb ${percentage}%)`,
          }}
          {...props}
        />
        {/* Custom thumb styling using inline styles via WebKit/Moz pseudo-elements can be challenging in standard Tailwind without plugins,
            but standard appearance-none styling applies. For fully custom cross-browser sliders, typically Radix UI is used.
            Here we rely on standard range input styled with Tailwind. */}
        <style>
          {`
            input[type=range]::-webkit-slider-thumb {
              appearance: none;
              width: 16px;
              height: 16px;
              border-radius: 50%;
              background: #3b82f6;
              cursor: pointer;
              border: 2px solid white;
              box-shadow: 0 1px 3px rgba(0,0,0,0.3);
            }
            input[type=range]::-moz-range-thumb {
              width: 16px;
              height: 16px;
              border-radius: 50%;
              background: #3b82f6;
              cursor: pointer;
              border: 2px solid white;
              box-shadow: 0 1px 3px rgba(0,0,0,0.3);
            }
            .dark input[type=range]::-webkit-slider-thumb {
              border-color: #1f2937;
            }
            .dark input[type=range]::-moz-range-thumb {
              border-color: #1f2937;
            }
          `}
        </style>
      </div>
    );
  }
);
Slider.displayName = 'Slider';

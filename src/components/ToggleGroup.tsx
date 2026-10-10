import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface ToggleGroupOption<T extends string | number> {
  label: React.ReactNode;
  value: T;
  disabled?: boolean;
}

export interface ToggleGroupProps<T extends string | number> {
  options: ToggleGroupOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export function ToggleGroup<T extends string | number>({
  options,
  value,
  onChange,
  className,
  size = 'md',
  fullWidth = false,
}: ToggleGroupProps<T>) {
  return (
    <div
      role="group"
      className={cn(
        'inline-flex p-1 bg-slate-900 border border-slate-800 rounded-lg',
        fullWidth ? 'flex w-full' : 'inline-flex',
        className
      )}
    >
      {options.map((option) => {
        const isSelected = value === option.value;
        return (
          <button
            key={String(option.value)}
            type="button"
            role="radio"
            aria-checked={isSelected}
            disabled={option.disabled}
            onClick={() => onChange(option.value)}
            className={cn(
              'relative flex items-center justify-center font-medium transition-all duration-200 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
              {
                'px-3 py-1.5 text-xs': size === 'sm',
                'px-4 py-2 text-sm': size === 'md',
                'px-5 py-2.5 text-base': size === 'lg',
                'flex-1': fullWidth,
                'bg-slate-800 text-white shadow-sm': isSelected,
                'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50': !isSelected && !option.disabled,
                'opacity-50 cursor-not-allowed': option.disabled,
              }
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

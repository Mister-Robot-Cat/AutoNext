import React, { forwardRef, SelectHTMLAttributes, useId } from 'react';

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
  fullWidth?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className = '',
      label,
      error,
      options,
      fullWidth = false,
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const selectId = id || generatedId;
    
    return (
      <div className={`${fullWidth ? 'w-full' : ''} ${className}`}>
        {label && (
          <label htmlFor={selectId} className="block text-sm font-medium text-slate-300 mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            disabled={disabled}
            className={`
              block w-full rounded-xl bg-slate-800/50 border text-white appearance-none
              focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors
              ${error ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500' : 'border-slate-700 focus:border-blue-500'}
              ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-800/80' : ''}
              py-2.5 pl-4 pr-10 sm:text-sm
            `}
            {...props}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        {error && (
          <p className="mt-1.5 text-sm text-red-500" data-testid="error-message">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

import React, { forwardRef, InputHTMLAttributes, useId } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className = '',
      label,
      error,
      leftIcon,
      rightIcon,
      fullWidth = false,
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    
    return (
      <div className={`${fullWidth ? 'w-full' : ''} ${className}`}>
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-slate-300 mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400" data-testid="left-icon">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            className={`
              block w-full rounded-xl bg-slate-800/50 border text-white placeholder-slate-400
              focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors
              ${error ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500' : 'border-slate-700 focus:border-blue-500'}
              ${leftIcon ? 'pl-10' : 'pl-4'}
              ${rightIcon ? 'pr-10' : 'pr-4'}
              ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-800/80' : ''}
              py-2.5 sm:text-sm
            `}
            {...props}
          />
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400" data-testid="right-icon">
              {rightIcon}
            </div>
          )}
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

Input.displayName = 'Input';

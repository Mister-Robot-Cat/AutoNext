import React, { forwardRef, TextareaHTMLAttributes, useId } from 'react';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className = '',
      label,
      error,
      fullWidth = false,
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const textareaId = id || generatedId;
    
    return (
      <div className={`${fullWidth ? 'w-full' : ''} ${className}`}>
        {label && (
          <label htmlFor={textareaId} className="block text-sm font-medium text-slate-300 mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          <textarea
            ref={ref}
            id={textareaId}
            disabled={disabled}
            className={`
              block w-full rounded-xl bg-slate-800/50 border text-white placeholder-slate-400
              focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors
              ${error ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500' : 'border-slate-700 focus:border-blue-500'}
              ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-800/80' : ''}
              py-2.5 px-4 sm:text-sm min-h-[100px] resize-y
            `}
            {...props}
          />
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

Textarea.displayName = 'Textarea';

import React, { forwardRef, useEffect, useRef, useImperativeHandle } from 'react';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
  indeterminate?: boolean;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className = '', label, description, disabled, checked, onChange, indeterminate, ...props }, ref) => {
    const innerRef = useRef<HTMLInputElement>(null);
    
    useImperativeHandle(ref, () => innerRef.current as HTMLInputElement);

    useEffect(() => {
      if (innerRef.current) {
        innerRef.current.indeterminate = indeterminate || false;
      }
    }, [indeterminate]);

    return (
      <label className={`inline-flex items-start ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`}>
        <div className="relative flex items-center h-5 mt-0.5">
          <input
            type="checkbox"
            className="peer sr-only"
            checked={checked}
            onChange={(e) => {
              if (disabled) return;
              onChange?.(e);
            }}
            disabled={disabled}
            ref={innerRef}
            {...props}
          />
          <div className="w-4 h-4 rounded border border-slate-600 bg-slate-800/50 flex items-center justify-center peer-checked:bg-blue-600 peer-checked:border-blue-600 peer-focus-visible:ring-2 peer-focus-visible:ring-blue-500 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-slate-900 transition-all">
            <svg
              className={`w-3 h-3 text-white pointer-events-none ${checked && !indeterminate ? 'opacity-100 scale-100' : 'opacity-0 scale-0'} transition-transform`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <svg
              className={`w-3 h-3 text-white pointer-events-none absolute ${indeterminate ? 'opacity-100 scale-100' : 'opacity-0 scale-0'} transition-transform`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
            </svg>
          </div>
        </div>
        {(label || description) && (
          <div className="ml-3 flex flex-col">
            {label && <span className="text-sm font-medium text-slate-200">{label}</span>}
            {description && <span className="text-xs text-slate-400 mt-0.5">{description}</span>}
          </div>
        )}
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';

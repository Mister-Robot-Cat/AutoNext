import React, { forwardRef } from 'react';

export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ className = '', label, description, disabled, checked, onChange, ...props }, ref) => {
    return (
      <label className={`inline-flex items-start ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`}>
        <div className="relative flex items-center h-5 mt-0.5">
          <input
            type="radio"
            className="peer sr-only"
            checked={checked}
            onChange={(e) => {
              if (disabled) return;
              onChange?.(e);
            }}
            disabled={disabled}
            ref={ref}
            {...props}
          />
          <div className="w-4 h-4 rounded-full border border-slate-600 bg-slate-800/50 flex items-center justify-center peer-checked:border-blue-600 peer-focus-visible:ring-2 peer-focus-visible:ring-blue-500 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-slate-900 transition-all">
            <div className={`w-2 h-2 rounded-full bg-blue-600 ${checked ? 'opacity-100 scale-100' : 'opacity-0 scale-0'} transition-transform`} />
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

Radio.displayName = 'Radio';

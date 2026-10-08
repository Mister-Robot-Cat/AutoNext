import React, { forwardRef } from 'react';

export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ className = '', label, description, disabled, checked, onChange, ...props }, ref) => {
    return (
      <label className={`inline-flex items-center ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`}>
        <div className="relative inline-flex items-center">
          <input 
            type="checkbox" 
            className="sr-only peer" 
            checked={checked} 
            onChange={(e) => {
              if (disabled) return;
              onChange?.(e);
            }}
            disabled={disabled}
            ref={ref}
            {...props} 
          />
          <div className={`w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 transition-colors`}></div>
        </div>
        {(label || description) && (
          <div className="ml-3">
            {label && <span className="block text-sm font-medium text-slate-200">{label}</span>}
            {description && <span className="block text-xs text-slate-400 mt-0.5">{description}</span>}
          </div>
        )}
      </label>
    );
  }
);

Switch.displayName = 'Switch';

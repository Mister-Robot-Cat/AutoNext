import React, { forwardRef } from 'react';
import { Info, CheckCircle2, AlertTriangle, XCircle, X } from 'lucide-react';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  onClose?: () => void;
  icon?: React.ReactNode;
}

export const Alert = forwardRef<HTMLDivElement, AlertProps>(
  (
    {
      className = '',
      variant = 'info',
      title,
      children,
      onClose,
      icon,
      ...props
    },
    ref
  ) => {
    const variantConfig = {
      info: {
        container: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
        icon: <Info className="h-5 w-5 text-blue-400" />,
        title: 'text-blue-400',
      },
      success: {
        container: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
        icon: <CheckCircle2 className="h-5 w-5 text-emerald-400" />,
        title: 'text-emerald-400',
      },
      warning: {
        container: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
        icon: <AlertTriangle className="h-5 w-5 text-amber-400" />,
        title: 'text-amber-400',
      },
      error: {
        container: 'bg-red-500/10 border-red-500/20 text-red-400',
        icon: <XCircle className="h-5 w-5 text-red-400" />,
        title: 'text-red-400',
      },
    };

    const config = variantConfig[variant];
    const defaultIcon = config.icon;

    return (
      <div
        ref={ref}
        role="alert"
        className={`relative flex w-full items-start gap-3 rounded-xl border p-4 text-sm ${config.container} ${className}`}
        {...props}
      >
        <div className="flex-shrink-0 mt-0.5">
          {icon !== undefined ? icon : defaultIcon}
        </div>
        <div className="flex-1 space-y-1 leading-relaxed">
          {title && (
            <h5 className={`font-medium leading-none tracking-tight ${config.title}`}>
              {title}
            </h5>
          )}
          <div className="text-current opacity-90">{children}</div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="flex-shrink-0 rounded-lg p-1 opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-current"
            aria-label="Close alert"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  }
);

Alert.displayName = 'Alert';

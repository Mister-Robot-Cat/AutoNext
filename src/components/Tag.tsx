import React from 'react';

export interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';
  size?: 'sm' | 'md' | 'lg';
  closable?: boolean;
  onClose?: () => void;
}

export const Tag: React.FC<TagProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  closable = false,
  onClose,
  className = '',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-full';
  
  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-0.5',
    lg: 'text-base px-3 py-1',
  };

  const variantStyles = {
    primary: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    secondary: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    danger: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    info: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300',
  };

  const combinedClasses = `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`.trim();

  return (
    <span className={combinedClasses} data-testid="tag" {...props}>
      {children}
      {closable && (
        <button
          type="button"
          onClick={onClose}
          className="ml-1.5 inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full text-current hover:bg-black/10 focus:bg-black/10 focus:outline-none dark:hover:bg-white/10 dark:focus:bg-white/10"
          aria-label="Remove"
          data-testid="tag-close-btn"
        >
          <svg className="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
            <path strokeLinecap="round" strokeWidth="1.5" d="M1 1l6 6m0-6L1 7" />
          </svg>
        </button>
      )}
    </span>
  );
};

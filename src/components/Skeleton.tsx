import React from 'react';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'rectangular' | 'circular' | 'rounded' | 'text';
  width?: string | number;
  height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'rounded',
  width,
  height,
  className = '',
  style,
  ...props
}) => {
  const variantStyles = {
    rectangular: '',
    circular: 'rounded-full',
    rounded: 'rounded-md',
    text: 'rounded-sm',
  };

  const computedStyle = {
    width,
    height,
    ...style,
  };

  return (
    <div
      data-testid="skeleton"
      className={`animate-pulse bg-slate-800 ${variantStyles[variant]} ${className}`}
      style={computedStyle}
      {...props}
    />
  );
};

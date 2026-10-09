import React, { useState } from 'react';
import { User } from 'lucide-react';

export interface AvatarProps {
  src?: string;
  alt?: string;
  initials?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function Avatar({
  src,
  alt = 'Avatar',
  initials,
  size = 'md',
  className = '',
}: AvatarProps) {
  const [hasError, setHasError] = useState(false);

  const baseStyles = 'relative inline-flex items-center justify-center rounded-full overflow-hidden shrink-0 bg-slate-800 text-slate-300';
  
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-xl',
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24,
    xl: 32,
  };

  return (
    <div className={`${baseStyles} ${sizes[size]} ${className}`} data-testid="avatar-container">
      {src && !hasError ? (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          onError={() => setHasError(true)}
          data-testid="avatar-image"
        />
      ) : initials ? (
        <span className="font-semibold" data-testid="avatar-initials">
          {initials.substring(0, 2).toUpperCase()}
        </span>
      ) : (
        <User size={iconSizes[size]} data-testid="avatar-icon" />
      )}
    </div>
  );
}

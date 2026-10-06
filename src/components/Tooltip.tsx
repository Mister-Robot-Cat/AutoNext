import React, { useState, useRef, useEffect, ReactNode } from 'react';

interface TooltipProps {
  children: ReactNode;
  content: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
  children,
  content,
  position = 'top',
  delay = 200,
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showTooltip = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const getPositionClasses = () => {
    switch (position) {
      case 'top':
        return 'bottom-full left-1/2 -translate-x-1/2 mb-2';
      case 'bottom':
        return 'top-full left-1/2 -translate-x-1/2 mt-2';
      case 'left':
        return 'right-full top-1/2 -translate-y-1/2 mr-2';
      case 'right':
        return 'left-full top-1/2 -translate-y-1/2 ml-2';
      default:
        return 'bottom-full left-1/2 -translate-x-1/2 mb-2';
    }
  };

  return (
    <div
      className={`relative inline-flex ${className}`}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}
      
      {isVisible && (
        <div
          role="tooltip"
          className={`absolute z-50 px-3 py-1.5 text-sm font-medium text-white bg-slate-800 rounded-lg shadow-xl ring-1 ring-slate-700/50 whitespace-nowrap animate-in fade-in zoom-in duration-200 ${getPositionClasses()}`}
        >
          {content}
          
          <div className="absolute w-2 h-2 bg-slate-800 ring-1 ring-slate-700/50 transform rotate-45"
            style={{
              ...(position === 'top' && { bottom: '-4px', left: 'calc(50% - 4px)', clipPath: 'polygon(100% 100%, 0 100%, 100% 0)' }),
              ...(position === 'bottom' && { top: '-4px', left: 'calc(50% - 4px)', clipPath: 'polygon(0 0, 100% 0, 0 100%)' }),
              ...(position === 'left' && { right: '-4px', top: 'calc(50% - 4px)', clipPath: 'polygon(100% 0, 100% 100%, 0 0)' }),
              ...(position === 'right' && { left: '-4px', top: 'calc(50% - 4px)', clipPath: 'polygon(0 100%, 0 0, 100% 100%)' }),
            }}
          />
        </div>
      )}
    </div>
  );
};

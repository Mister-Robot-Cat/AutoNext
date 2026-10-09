import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useClickOutside } from '../hooks/useClickOutside';
import { useScrollLock } from '../hooks/useScrollLock';
import { useKeyPress } from '../hooks/useKeyPress';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  position?: 'left' | 'right' | 'top' | 'bottom';
  title?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export function Drawer({
  isOpen,
  onClose,
  position = 'right',
  title,
  children,
  className = '',
  size = 'md',
}: DrawerProps) {
  useScrollLock(isOpen);
  useKeyPress('Escape', () => {
    if (isOpen) onClose();
  });

  const ref = useClickOutside<HTMLDivElement>(() => {
    if (isOpen) onClose();
  }, isOpen);

  const [mounted, setMounted] = useState(false);

  // Handle animation unmounting
  useEffect(() => {
    if (isOpen) {
      setMounted(true);
    } else {
      const timer = setTimeout(() => setMounted(false), 300); // Wait for transition duration
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!mounted && !isOpen) return null;

  const positionClasses = {
    left: 'top-0 left-0 h-full',
    right: 'top-0 right-0 h-full',
    top: 'top-0 left-0 w-full',
    bottom: 'bottom-0 left-0 w-full',
  };

  const sizeClasses = {
    left: { sm: 'w-64', md: 'w-80', lg: 'w-96', xl: 'w-[32rem]', full: 'w-full' },
    right: { sm: 'w-64', md: 'w-80', lg: 'w-96', xl: 'w-[32rem]', full: 'w-full' },
    top: { sm: 'h-64', md: 'h-80', lg: 'h-96', xl: 'h-[32rem]', full: 'h-full' },
    bottom: { sm: 'h-64', md: 'h-80', lg: 'h-96', xl: 'h-[32rem]', full: 'h-full' },
  };

  const transformClasses = {
    left: isOpen ? 'translate-x-0' : '-translate-x-full',
    right: isOpen ? 'translate-x-0' : 'translate-x-full',
    top: isOpen ? 'translate-y-0' : '-translate-y-full',
    bottom: isOpen ? 'translate-y-0' : 'translate-y-full',
  };

  const borderStyles = {
    left: { borderRightWidth: '1px' },
    right: { borderLeftWidth: '1px' },
    top: { borderBottomWidth: '1px' },
    bottom: { borderTopWidth: '1px' },
  };

  return (
    <>
      <div
        className={`fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
        aria-hidden="true"
      />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        className={`fixed z-[70] bg-slate-900 border-slate-800 shadow-2xl transition-transform duration-300 ease-in-out flex flex-col ${positionClasses[position]} ${sizeClasses[position][size]} ${transformClasses[position]} ${className}`}
        style={borderStyles[position]}
      >
        {title && (
          <div className="flex items-center justify-between p-4 border-b border-slate-800 shrink-0">
            <h2 className="text-lg font-semibold text-white">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
              aria-label="Close drawer"
            >
              <X size={20} />
            </button>
          </div>
        )}
        {!title && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors z-10"
            aria-label="Close drawer"
          >
            <X size={20} />
          </button>
        )}
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </>
  );
}

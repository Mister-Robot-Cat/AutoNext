import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useClickOutside } from '../hooks/useClickOutside';
import { useScrollLock } from '../hooks/useScrollLock';
import { useKeyPress } from '../hooks/useKeyPress';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  hideCloseButton?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  className = '',
  size = 'md',
  hideCloseButton = false,
}: ModalProps) {
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
      const timer = setTimeout(() => setMounted(false), 200); // Matches transition duration
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!mounted && !isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full m-4',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      <div
        className={`fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-200 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
        aria-hidden="true"
      />
      
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        className={`relative w-full ${sizeClasses[size]} bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl transition-all duration-200 flex flex-col max-h-[90vh] ${
          isOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'
        } ${className}`}
      >
        {title && (
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-800 shrink-0">
            <h2 className="text-xl font-bold text-white">{title}</h2>
            {!hideCloseButton && (
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            )}
          </div>
        )}
        
        {!title && !hideCloseButton && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors z-10"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        )}
        
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</div>
      </div>
    </div>
  );
}

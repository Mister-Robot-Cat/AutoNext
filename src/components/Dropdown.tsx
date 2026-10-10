import React, { useState, useRef, ReactNode, useEffect } from 'react';
import { useClickOutside } from '../hooks/useClickOutside';

export interface DropdownItem {
  key: string;
  label: ReactNode;
  icon?: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'default' | 'danger';
}

export interface DropdownProps {
  trigger: ReactNode;
  items: DropdownItem[];
  placement?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
  className?: string;
  width?: 'auto' | 'full' | string;
}

export const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  items,
  placement = 'bottom-right',
  className = '',
  width = 'auto',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useClickOutside<HTMLDivElement>(() => setIsOpen(false), isOpen);

  const toggleDropdown = () => {
    setIsOpen((prev) => !prev);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const placementClasses = {
    'bottom-left': 'top-full left-0 mt-2',
    'bottom-right': 'top-full right-0 mt-2',
    'top-left': 'bottom-full left-0 mb-2',
    'top-right': 'bottom-full right-0 mb-2',
  };

  const widthClass = width === 'auto' ? 'w-auto whitespace-nowrap' : width === 'full' ? 'w-full' : width;

  return (
    <div className={`relative inline-block ${width === 'full' ? 'w-full' : ''} ${className}`} ref={dropdownRef} onKeyDown={handleKeyDown}>
      <div onClick={toggleDropdown} role="button" tabIndex={0} className="inline-block w-full cursor-pointer">
        {trigger}
      </div>

      {isOpen && (
        <div
          className={`absolute z-50 min-w-[12rem] bg-slate-800 border border-slate-700 rounded-xl shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 ${placementClasses[placement]} ${widthClass}`}
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="options-menu"
        >
          <div className="py-1" role="none">
            {items.map((item) => (
              <button
                key={item.key}
                onClick={() => {
                  if (!item.disabled) {
                    item.onClick?.();
                    setIsOpen(false);
                  }
                }}
                disabled={item.disabled}
                className={`
                  w-full flex items-center px-4 py-2.5 text-sm transition-colors
                  ${item.disabled ? 'opacity-50 cursor-not-allowed text-slate-500' : 'cursor-pointer hover:bg-slate-700/50'}
                  ${item.variant === 'danger' ? 'text-red-400 hover:text-red-300' : 'text-slate-300 hover:text-white'}
                `}
                role="menuitem"
              >
                {item.icon && <span className="mr-2.5 flex-shrink-0" data-testid={`icon-${item.key}`}>{item.icon}</span>}
                <span className="truncate">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

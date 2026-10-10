import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Input, InputProps } from './Input';
import { useClickOutside } from '../hooks/useClickOutside';
import { Search, ChevronDown, X } from 'lucide-react';

export interface AutocompleteOption {
  value: string;
  label: string;
}

export interface AutocompleteProps extends Omit<InputProps, 'onChange' | 'value' | 'onSelect'> {
  options: AutocompleteOption[];
  value?: string;
  onChange?: (value: string) => void;
  onSelectOption?: (option: AutocompleteOption) => void;
  placeholder?: string;
  emptyText?: string;
  clearable?: boolean;
}

export const Autocomplete: React.FC<AutocompleteProps> = ({
  options,
  value = '',
  onChange,
  onSelectOption,
  placeholder = 'Search...',
  emptyText = 'No options found',
  clearable = true,
  className = '',
  disabled = false,
  ...inputProps
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize input value based on selected value if any
  useEffect(() => {
    const selectedOption = options.find((opt) => opt.value === value);
    if (selectedOption) {
      setInputValue(selectedOption.label);
    } else {
      setInputValue('');
    }
  }, [value, options]);

  const wrapperRef = useClickOutside<HTMLDivElement>(() => {
    setIsOpen(false);
    // On close without selection, reset input to selected value label
    const selectedOption = options.find((opt) => opt.value === value);
    setInputValue(selectedOption ? selectedOption.label : '');
  }, isOpen);

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(inputValue.toLowerCase())
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setIsOpen(true);
    setHighlightedIndex(0);
    if (onChange && e.target.value === '') {
      // Allow clearing via typing
      onChange('');
    }
  };

  const handleSelect = (option: AutocompleteOption) => {
    setInputValue(option.label);
    setIsOpen(false);
    if (onChange) onChange(option.value);
    if (onSelectOption) onSelectOption(option);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIsOpen(true);
      setHighlightedIndex((prev) => (prev < filteredOptions.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (isOpen && highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
        handleSelect(filteredOptions[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      const selectedOption = options.find((opt) => opt.value === value);
      setInputValue(selectedOption ? selectedOption.label : '');
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setInputValue('');
    if (onChange) onChange('');
    inputRef.current?.focus();
  };

  const listboxRef = useRef<HTMLUListElement>(null);

  // Scroll to highlighted item
  useEffect(() => {
    if (isOpen && highlightedIndex >= 0 && listboxRef.current) {
      const highlightedEl = listboxRef.current.children[highlightedIndex] as HTMLElement;
      if (highlightedEl && typeof highlightedEl.scrollIntoView === 'function') {
        highlightedEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex, isOpen]);

  return (
    <div className={`relative ${className}`} ref={wrapperRef}>
      <div className="relative">
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
          leftIcon={<Search className="h-4 w-4" />}
          rightIcon={
            clearable && value && !disabled ? (
              <button
                type="button"
                onClick={handleClear}
                className="text-slate-400 hover:text-white transition-colors p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Clear selection"
              >
                <X className="h-4 w-4" />
              </button>
            ) : (
              <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            )
          }
          {...inputProps}
        />
      </div>

      {isOpen && !disabled && (
        <ul
          ref={listboxRef}
          className="absolute z-50 w-full mt-1.5 max-h-60 overflow-auto rounded-xl bg-slate-800 border border-slate-700 shadow-xl py-1 text-base sm:text-sm focus:outline-none animate-in fade-in slide-in-from-top-2 duration-200"
          role="listbox"
        >
          {filteredOptions.length === 0 ? (
            <li className="relative cursor-default select-none py-3 px-4 text-slate-400 text-center">
              {emptyText}
            </li>
          ) : (
            filteredOptions.map((option, index) => {
              const isSelected = option.value === value;
              const isHighlighted = index === highlightedIndex;

              return (
                <li
                  key={option.value}
                  className={`
                    relative cursor-pointer select-none py-2.5 px-4 transition-colors
                    ${isHighlighted ? 'bg-slate-700/50 text-white' : 'text-slate-300'}
                    ${isSelected ? 'font-semibold text-blue-400' : ''}
                  `}
                  onClick={() => handleSelect(option)}
                  role="option"
                  aria-selected={isSelected}
                  onMouseEnter={() => setHighlightedIndex(index)}
                >
                  <span className="block truncate">{option.label}</span>
                </li>
              );
            })
          )}
        </ul>
      )}
    </div>
  );
};

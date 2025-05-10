'use client';

import React, {
  useState,
  useRef,
  useEffect,
  ReactNode,
  ReactElement,
  cloneElement,
  isValidElement,
  KeyboardEvent,
} from 'react';
import { ChevronDown, ChevronUp, Check } from 'lucide-react';

interface SelectProps {
  value?: string;
  onValueChange: (value: string) => void | React.Dispatch<React.SetStateAction<string>>;
  children: ReactNode;
  placeholder?: string;
}

export const Select = ({ value, onValueChange, children, placeholder = 'Select an option' }: SelectProps) => {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node) &&
        listRef.current &&
        !listRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard support
  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setOpen(true);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div className="relative w-full sm:w-[200px]">
      <button
        ref={triggerRef}
        onClick={() => setOpen(!open)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="w-full flex justify-between items-center px-4 py-2 border border-gray-300 rounded-md text-sm bg-white text-gray-800 shadow-sm hover:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
      >
        <span className="truncate">{value || placeholder}</span>
        {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {open && (
        <div
          ref={listRef}
          role="listbox"
          className="absolute z-20 mt-2 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto transition-all"
        >
          {React.Children.map(children, (child) => {
            if (isValidElement(child)) {
              return cloneElement(child as ReactElement<any>, {
                onSelect: (val: string) => {
                  onValueChange(val);
                  setOpen(false);
                },
                selectedValue: value,
                role: 'option',
              });
            }
            return child;
          })}
        </div>
      )}
    </div>
  );
};

interface SelectItemProps {
  value: string;
  children: ReactNode;
  selectedValue?: string;
  onSelect?: (value: string) => void;
}

export const SelectItem = ({ value, children, selectedValue, onSelect, ...props }: SelectItemProps) => {
  const isSelected = selectedValue === value;

  const handleClick = () => {
    if (onSelect) onSelect(value);
  };

  return (
    <div
      {...props}
      onClick={handleClick}
      className={`flex items-center justify-between px-4 py-2 cursor-pointer rounded text-sm transition
        ${isSelected ? 'bg-indigo-100 text-indigo-700' : 'text-gray-800 hover:bg-indigo-50'}`}
    >
      {children}
      {isSelected && <Check className="h-4 w-4 text-indigo-600" />}
    </div>
  );
};

// Optional extra components
export const SelectGroup = ({ children }: { children: ReactNode }) => <div>{children}</div>;

export const SelectLabel = ({ children }: { children: ReactNode }) => (
  <div className="px-4 py-1 text-xs font-semibold text-gray-500 uppercase">{children}</div>
);

export const SelectSeparator = () => <div className="h-px my-1 bg-gray-200" />;

export const SelectValue = ({ placeholder }: { placeholder?: string }) => (
  <span className="text-gray-400">{placeholder || 'Select an option'}</span>
);

export type { SelectProps, SelectItemProps };
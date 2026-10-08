import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export interface AccordionItem {
  id: string;
  title: React.ReactNode;
  content: React.ReactNode;
}

interface AccordionProps {
  items: AccordionItem[];
  allowMultiple?: boolean;
  defaultExpanded?: string[];
  className?: string;
}

export function Accordion({ items, allowMultiple = false, defaultExpanded = [], className = '' }: AccordionProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set(defaultExpanded));

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (!allowMultiple) {
          next.clear();
        }
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {items.map((item) => {
        const isExpanded = expanded.has(item.id);
        return (
          <div key={item.id} className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-800">
            <button
              className="w-full flex items-center justify-between p-4 text-left focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={() => toggle(item.id)}
              aria-expanded={isExpanded}
            >
              <span className="font-medium text-slate-900 dark:text-slate-100">{item.title}</span>
              <ChevronDown
                className={`w-5 h-5 text-slate-500 dark:text-slate-400 transition-transform duration-200 ${
                  isExpanded ? 'transform rotate-180' : ''
                }`}
              />
            </button>
            <div
              className={`transition-all duration-300 ease-in-out ${
                isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
              } overflow-hidden`}
            >
              <div className="p-4 pt-0 text-slate-600 dark:text-slate-300 border-t border-slate-100 dark:border-slate-700">
                {item.content}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

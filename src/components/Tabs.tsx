import React, { useState } from 'react';

export interface TabItem {
  id: string;
  label: React.ReactNode;
  content: React.ReactNode;
}

interface TabsProps {
  items: TabItem[];
  defaultTab?: string;
  className?: string;
  onChange?: (id: string) => void;
}

export function Tabs({ items, defaultTab, className = '', onChange }: TabsProps) {
  const [activeTab, setActiveTab] = useState<string>(defaultTab || items[0]?.id);

  const handleTabClick = (id: string) => {
    setActiveTab(id);
    if (onChange) {
      onChange(id);
    }
  };

  if (!items || items.length === 0) return null;

  return (
    <div className={`w-full ${className}`}>
      <div className="flex space-x-1 border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
        {items.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${item.id}`}
              id={`tab-${item.id}`}
              tabIndex={isActive ? 0 : -1}
              className={`py-2 px-4 text-sm font-medium transition-colors duration-200 whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-t-lg ${
                isActive
                  ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
              }`}
              onClick={() => handleTabClick(item.id)}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      <div className="mt-4 focus:outline-none">
        {items.map((item) => (
          <div
            key={item.id}
            role="tabpanel"
            id={`panel-${item.id}`}
            aria-labelledby={`tab-${item.id}`}
            hidden={activeTab !== item.id}
            tabIndex={0}
            className="outline-none"
          >
            {activeTab === item.id ? item.content : null}
          </div>
        ))}
      </div>
    </div>
  );
}

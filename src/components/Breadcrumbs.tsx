import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface BreadcrumbItem {
  label: React.ReactNode;
  href?: string;
  icon?: React.ElementType;
}

export interface BreadcrumbsProps extends React.HTMLAttributes<HTMLElement> {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
  homeIcon?: boolean;
}

export const Breadcrumbs = React.forwardRef<HTMLElement, BreadcrumbsProps>(
  ({ items, separator, homeIcon = true, className, ...props }, ref) => {
    if (!items || items.length === 0) return null;

    return (
      <nav
        ref={ref}
        aria-label="Breadcrumb"
        className={cn('flex items-center text-sm text-gray-500 dark:text-gray-400', className)}
        {...props}
      >
        <ol className="flex items-center space-x-2">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            const ItemIcon = item.icon || (index === 0 && homeIcon ? Home : null);

            return (
              <li key={index} className="flex items-center">
                {index > 0 && (
                  <span className="mx-2 flex-shrink-0 text-gray-400 dark:text-gray-500">
                    {separator || <ChevronRight className="h-4 w-4" />}
                  </span>
                )}
                
                {item.href && !isLast ? (
                  <a
                    href={item.href}
                    className="flex items-center hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    {ItemIcon && <ItemIcon className="h-4 w-4 mr-1.5" />}
                    {item.label}
                  </a>
                ) : (
                  <span
                    className="flex items-center text-gray-900 dark:text-gray-100 font-medium"
                    aria-current={isLast ? 'page' : undefined}
                  >
                    {ItemIcon && <ItemIcon className="h-4 w-4 mr-1.5" />}
                    {item.label}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    );
  }
);

Breadcrumbs.displayName = 'Breadcrumbs';

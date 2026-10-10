import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface TimelineItemProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title: React.ReactNode;
  description?: React.ReactNode;
  time?: React.ReactNode;
  icon?: React.ReactNode;
  isActive?: boolean;
  isLast?: boolean;
}

export function TimelineItem({
  title,
  description,
  time,
  icon,
  isActive = false,
  isLast = false,
  className,
  ...props
}: TimelineItemProps) {
  return (
    <div className={cn('relative flex gap-4', className)} {...props}>
      <div className="flex flex-col items-center">
        <div
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-full border-2',
            isActive
              ? 'border-blue-600 bg-blue-600 text-white'
              : 'border-gray-300 bg-white text-gray-500'
          )}
        >
          {icon || <div className="h-2.5 w-2.5 rounded-full bg-current" />}
        </div>
        {!isLast && (
          <div
            className={cn(
              'w-0.5 flex-1 my-2',
              isActive ? 'bg-blue-600' : 'bg-gray-200'
            )}
            data-testid="timeline-connector"
          />
        )}
      </div>
      <div className="pb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
          <h4
            className={cn(
              'font-semibold text-base',
              isActive ? 'text-gray-900' : 'text-gray-700'
            )}
          >
            {title}
          </h4>
          {time && <span className="text-sm text-gray-500">{time}</span>}
        </div>
        {description && (
          <p className="mt-1 text-sm text-gray-600">{description}</p>
        )}
      </div>
    </div>
  );
}

export interface TimelineProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function Timeline({ children, className, ...props }: TimelineProps) {
  const items = React.Children.toArray(children);
  return (
    <div className={cn('flex flex-col', className)} {...props}>
      {items.map((child, index) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            isLast: index === items.length - 1,
            // @ts-ignore
            ...child.props,
          });
        }
        return child;
      })}
    </div>
  );
}

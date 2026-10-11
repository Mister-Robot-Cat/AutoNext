import React from 'react';
import { Sparkline } from './Sparkline';

export interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    label?: string;
    direction: 'up' | 'down' | 'neutral';
  };
  sparklineData?: number[];
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  trend,
  sparklineData,
  className = '',
}) => {
  return (
    <div className={`p-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</h3>
        {icon && <div className="text-slate-400 dark:text-slate-500">{icon}</div>}
      </div>
      <div className="flex items-baseline justify-between gap-2">
        <div className="flex items-baseline gap-2">
          <div className="text-2xl font-semibold text-slate-900 dark:text-white">
            {value}
          </div>
          {trend && (
            <div className={`text-xs font-medium flex items-center ${
              trend.direction === 'up' ? 'text-emerald-600 dark:text-emerald-400' :
              trend.direction === 'down' ? 'text-rose-600 dark:text-rose-400' :
              'text-slate-500 dark:text-slate-400'
            }`}>
              {trend.direction === 'up' && <span className="mr-1" aria-hidden="true">↑</span>}
              {trend.direction === 'down' && <span className="mr-1" aria-hidden="true">↓</span>}
              {trend.direction === 'neutral' && <span className="mr-1" aria-hidden="true">-</span>}
              {trend.value}%
              {trend.label && <span className="ml-1 text-slate-400 dark:text-slate-500">{trend.label}</span>}
            </div>
          )}
        </div>
        {sparklineData && sparklineData.length > 0 && (
          <div className="flex-shrink-0" data-testid="stat-sparkline">
            <Sparkline
              data={sparklineData}
              width={80}
              height={28}
              fill
              autoColorTrend
              showLastPoint
            />
          </div>
        )}
      </div>
    </div>
  );
};

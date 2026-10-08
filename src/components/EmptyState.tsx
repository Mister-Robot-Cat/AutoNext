import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div className={`py-16 md:py-24 px-4 text-center space-y-5 bg-slate-900/40 rounded-3xl border border-slate-800 transition-all duration-300 ${className}`}>
      <div className="w-20 h-20 rounded-full bg-slate-800/80 flex items-center justify-center mx-auto text-slate-400 shadow-inner">
        <Icon className="w-10 h-10" strokeWidth={1.5} />
      </div>
      <div className="space-y-2">
        <h3 className="text-xl font-bold text-white tracking-tight">{title}</h3>
        <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
          {description}
        </p>
      </div>
      {actionLabel && onAction && (
        <div className="pt-2">
          <button
            onClick={onAction}
            className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors focus:ring-4 focus:ring-blue-500/20 active:scale-95"
          >
            {actionLabel}
          </button>
        </div>
      )}
    </div>
  );
};

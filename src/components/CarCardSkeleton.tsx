import React from 'react';
import { Skeleton } from './Skeleton';

export const CarCardSkeleton: React.FC = () => {
  return (
    <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl overflow-hidden shadow-lg flex flex-col h-full animate-pulse" data-testid="car-card-skeleton">
      {/* Image Gallery Skeleton */}
      <Skeleton variant="rectangular" className="relative aspect-[16/10] w-full" />

      {/* Content Area Skeleton */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Price & Valuation */}
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="space-y-2">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton variant="circular" className="h-6 w-20" />
          </div>

          {/* Title & Generation */}
          <Skeleton className="h-5 w-3/4 mb-3" />

          {/* Subtitle (Year, Mileage, City) */}
          <Skeleton className="h-3 w-1/2 mb-4" />

          {/* Quick Specs Grid */}
          <div className="grid grid-cols-2 gap-2 py-3 border-y border-slate-800/80">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>

        {/* Footer: Seller & Views */}
        <div className="mt-4 pt-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton variant="circular" className="w-3 h-3" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-3 w-8" />
        </div>
      </div>
    </div>
  );
};

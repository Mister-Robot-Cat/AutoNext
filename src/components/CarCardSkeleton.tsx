import React from 'react';

export const CarCardSkeleton: React.FC = () => {
  return (
    <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl overflow-hidden shadow-lg animate-pulse flex flex-col h-full">
      {/* Image Gallery Skeleton */}
      <div className="relative aspect-[16/10] bg-slate-800 w-full" />

      {/* Content Area Skeleton */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Price & Valuation */}
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="space-y-2">
              <div className="h-6 w-24 bg-slate-800 rounded-md" />
              <div className="h-3 w-16 bg-slate-800 rounded-md" />
            </div>
            <div className="h-6 w-20 bg-slate-800 rounded-full" />
          </div>

          {/* Title & Generation */}
          <div className="h-5 w-3/4 bg-slate-800 rounded-md mb-3" />

          {/* Subtitle (Year, Mileage, City) */}
          <div className="h-3 w-1/2 bg-slate-800 rounded-md mb-4" />

          {/* Quick Specs Grid */}
          <div className="grid grid-cols-2 gap-2 py-3 border-y border-slate-800/80">
            <div className="h-3 w-20 bg-slate-800 rounded-md" />
            <div className="h-3 w-20 bg-slate-800 rounded-md" />
          </div>
        </div>

        {/* Footer: Seller & Views */}
        <div className="mt-4 pt-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-slate-800" />
            <div className="h-3 w-24 bg-slate-800 rounded-md" />
          </div>
          <div className="h-3 w-8 bg-slate-800 rounded-md" />
        </div>
      </div>
    </div>
  );
};

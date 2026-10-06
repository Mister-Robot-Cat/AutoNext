import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center space-x-3 mt-10 mb-6">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Əvvəlki səhifə"
        className="p-2.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700 hover:text-white transition-all duration-200"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      
      <div className="px-5 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 flex items-center justify-center">
        <span className="text-sm font-semibold text-slate-300">
          <span className="text-white">{currentPage}</span> <span className="text-slate-500 mx-1">/</span> {totalPages}
        </span>
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Növbəti səhifə"
        className="p-2.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700 hover:text-white transition-all duration-200"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
};

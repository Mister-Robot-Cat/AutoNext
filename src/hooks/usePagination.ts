import { useState } from 'react';

interface UsePaginationProps {
  totalItems: number;
  initialPage?: number;
  initialPageSize?: number;
}

export function usePagination({ totalItems, initialPage = 1, initialPageSize = 12 }: UsePaginationProps) {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  const nextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const goToPage = (page: number) => {
    const pageNumber = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(pageNumber);
  };

  return {
    currentPage,
    pageSize,
    totalPages,
    setPageSize,
    nextPage,
    prevPage,
    goToPage,
  };
}

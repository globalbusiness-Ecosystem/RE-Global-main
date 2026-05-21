import { useCallback, useMemo, useState } from 'react';

interface PaginationState {
  currentPage: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

interface UsePaginationReturn<T> {
  items: T[];
  currentPage: number;
  pageSize: number;
  total: number;
  totalPages: number;
  goToPage: (page: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  setPageSize: (size: number) => void;
  canGoNext: boolean;
  canGoPrev: boolean;
}

/**
 * Pagination hook with intelligent data slicing
 */
export function usePagination<T>(
  items: T[],
  initialPageSize: number = 20
): UsePaginationReturn<T> {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const total = items.length;

  const totalPages = useMemo(() => Math.ceil(total / pageSize), [total, pageSize]);

  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return items.slice(startIndex, endIndex);
  }, [items, currentPage, pageSize]);

  const canGoNext = currentPage < totalPages;
  const canGoPrev = currentPage > 1;

  const goToPage = useCallback(
    (page: number) => {
      const validPage = Math.max(1, Math.min(page, totalPages));
      setCurrentPage(validPage);
    },
    [totalPages]
  );

  const nextPage = useCallback(() => {
    if (canGoNext) {
      setCurrentPage(prev => prev + 1);
    }
  }, [canGoNext]);

  const previousPage = useCallback(() => {
    if (canGoPrev) {
      setCurrentPage(prev => prev - 1);
    }
  }, [canGoPrev]);

  const updatePageSize = useCallback((newSize: number) => {
    setPageSize(Math.max(1, newSize));
    setCurrentPage(1); // Reset to first page
  }, []);

  return {
    items: paginatedItems,
    currentPage,
    pageSize,
    total,
    totalPages,
    goToPage,
    nextPage,
    previousPage,
    setPageSize: updatePageSize,
    canGoNext,
    canGoPrev,
  };
}

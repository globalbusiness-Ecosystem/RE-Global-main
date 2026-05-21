'use client';

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';

interface VirtualListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
  className?: string;
  onScroll?: (scrollTop: number) => void;
  loadMore?: () => void;
  hasMore?: boolean;
}

/**
 * Virtual scroll list for rendering large lists efficiently
 * Only renders visible items + overscan buffer
 */
export function VirtualList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 5,
  className = '',
  onScroll,
  loadMore,
  hasMore = false,
}: VirtualListProps<T>) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);

  // Calculate visible range
  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );
    return { startIndex, endIndex };
  }, [scrollTop, itemHeight, containerHeight, overscan, items.length]);

  // Get visible items
  const visibleItems = useMemo(() => {
    const sliced = items.slice(visibleRange.startIndex, visibleRange.endIndex);
    return sliced.map((item, i) => ({
      item,
      index: visibleRange.startIndex + i,
    }));
  }, [items, visibleRange]);

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const target = e.currentTarget;
      const newScrollTop = target.scrollTop;
      setScrollTop(newScrollTop);
      onScroll?.(newScrollTop);

      // Load more when near bottom
      if (hasMore && loadMore) {
        const scrollPercentage =
          (newScrollTop + containerHeight) / (items.length * itemHeight);
        if (scrollPercentage > 0.8) {
          loadMore();
        }
      }
    },
    [containerHeight, items.length, itemHeight, hasMore, loadMore, onScroll]
  );

  const offsetY = visibleRange.startIndex * itemHeight;
  const totalHeight = items.length * itemHeight;

  return (
    <div
      ref={scrollContainerRef}
      onScroll={handleScroll}
      style={{
        height: containerHeight,
        overflow: 'auto',
        position: 'relative',
      }}
      className={className}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
          }}
        >
          {visibleItems.map(({ item, index }) => (
            <div
              key={index}
              style={{
                height: itemHeight,
                overflow: 'hidden',
              }}
            >
              {renderItem(item, index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

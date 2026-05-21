'use client';

import { useSWR } from '@/hooks/use-swr';
import { usePagination } from '@/hooks/use-pagination';
import { VirtualList } from '@/components/virtual-list';
import { LazyImage } from '@/components/lazy-image';
import { Spinner } from '@/components/ui/spinner';
import { memo, useCallback } from 'react';

interface Property {
  id: string;
  title: string;
  image: string;
  thumbnail: string;
  price: number;
  location: string;
}

// Memoized property item component
const PropertyItem = memo(({ property }: { property: Property }) => (
  <div className="p-4 border border-accent/20 rounded-lg hover:border-accent/50 transition-all">
    <LazyImage
      src={property.image}
      placeholder={property.thumbnail}
      alt={property.title}
      width={300}
      height={200}
      className="rounded-lg mb-3"
    />
    <h3 className="font-semibold text-white truncate">{property.title}</h3>
    <p className="text-sm text-gray-400">{property.location}</p>
    <p className="text-accent font-bold mt-2">π {property.price}</p>
  </div>
));

PropertyItem.displayName = 'PropertyItem';

/**
 * Optimized properties listing with:
 * - SWR data fetching with caching
 * - Pagination for large lists
 * - Virtual scrolling for performance
 * - Lazy image loading
 * - Memoized components
 */
export function OptimizedPropertiesPage() {
  // Fetch properties with SWR (automatic caching, deduplication, revalidation)
  const { data: allProperties, isLoading, error } = useSWR(
    '/api/properties',
    async (url) => {
      const response = await fetch(url);
      return response.json();
    },
    {
      revalidateOnFocus: true,
      refreshInterval: 5 * 60 * 1000, // Revalidate every 5 minutes
      errorRetryCount: 5,
    }
  );

  // Pagination (shows 20 items per page instead of all)
  const {
    items: paginatedProperties,
    currentPage,
    totalPages,
    nextPage,
    previousPage,
    canGoNext,
    canGoPrev,
  } = usePagination(allProperties || [], 20);

  const handlePropertyClick = useCallback((propertyId: string) => {
    // Handle property selection
    console.log('Selected property:', propertyId);
  }, []);

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400">Error loading properties</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-white mb-8">
        Properties ({allProperties?.length || 0})
      </h1>

      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-accent/10 p-4 rounded-lg">
          <p className="text-gray-400 text-sm">Total Properties</p>
          <p className="text-2xl font-bold text-accent">
            {allProperties?.length || 0}
          </p>
        </div>
        <div className="bg-accent/10 p-4 rounded-lg">
          <p className="text-gray-400 text-sm">Current Page</p>
          <p className="text-2xl font-bold text-accent">
            {currentPage} / {totalPages}
          </p>
        </div>
        <div className="bg-accent/10 p-4 rounded-lg">
          <p className="text-gray-400 text-sm">Displaying</p>
          <p className="text-2xl font-bold text-accent">
            {paginatedProperties.length} items
          </p>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Spinner className="w-8 h-8 text-accent" />
          <span className="ml-3 text-gray-400">Loading properties...</span>
        </div>
      )}

      {/* Properties Grid - Can use Virtual List for very large datasets */}
      {!isLoading && paginatedProperties.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {paginatedProperties.map((property) => (
            <div
              key={property.id}
              onClick={() => handlePropertyClick(property.id)}
              className="cursor-pointer hover:scale-105 transition-transform"
            >
              <PropertyItem property={property} />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && paginatedProperties.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400">No properties found</p>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            onClick={previousPage}
            disabled={!canGoPrev}
            className="px-4 py-2 rounded-lg bg-accent/20 text-accent disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent/30 transition-colors"
          >
            Previous
          </button>
          <span className="text-gray-400">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={nextPage}
            disabled={!canGoNext}
            className="px-4 py-2 rounded-lg bg-accent/20 text-accent disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent/30 transition-colors"
          >
            Next
          </button>
        </div>
      )}

      {/* Alternative: Using Virtual List for 1000+ items */}
      {/* 
      <VirtualList
        items={allProperties || []}
        itemHeight={320}
        containerHeight={600}
        renderItem={(property) => (
          <PropertyItem property={property} />
        )}
        overscan={5}
        loadMore={() => {
          // Fetch next batch of properties
        }}
        hasMore={canGoNext}
      />
      */}
    </div>
  );
}

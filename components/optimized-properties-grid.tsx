'use client';

import { memo, useState, useCallback, useRef, useEffect } from 'react';
import { PropertyCard } from './property-card';
import { PropertyDetailsModal } from './property-details-modal';
import { SampleProperty, SAMPLE_PROPERTIES } from '@/lib/sample-properties';
import { PropertyImage } from './property-images-carousel';
import { useVirtualization } from '@/lib/performance-utils';

interface OptimizedPropertiesGridProps {
  language: 'en' | 'ar';
  category?: string;
  properties?: SampleProperty[];
  onBuyClick?: (propertyId: string) => void;
  virtualScrolling?: boolean;
  itemsPerPage?: number;
}

export const OptimizedPropertiesGrid = memo(
  ({
    language,
    category,
    properties = SAMPLE_PROPERTIES,
    onBuyClick,
    virtualScrolling = true,
    itemsPerPage = 12,
  }: OptimizedPropertiesGridProps) => {
    const [selectedProperty, setSelectedProperty] = useState<SampleProperty | null>(null);
    const [favorites, setFavorites] = useState<Set<string>>(new Set());
    const [scrollTop, setScrollTop] = useState(0);
    const [displayedItems, setDisplayedItems] = useState(itemsPerPage);
    const containerRef = useRef<HTMLDivElement>(null);
    const scrollTimerRef = useRef<NodeJS.Timeout>();

    // Virtual scrolling calculation
    const ITEM_HEIGHT = 450; // Approximate height of a card
    const CONTAINER_HEIGHT = typeof window !== 'undefined' ? window.innerHeight : 800;

    const virtualizedData = useVirtualization(
      properties,
      ITEM_HEIGHT,
      CONTAINER_HEIGHT,
      scrollTop
    );

    // Pagination with lazy loading
    const visibleProperties = virtualScrolling
      ? virtualizedData.items
      : properties.slice(0, displayedItems);

    const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
      const target = e.currentTarget;
      setScrollTop(target.scrollTop);

      // Clear previous timer
      if (scrollTimerRef.current) {
        clearTimeout(scrollTimerRef.current);
      }

      // Lazy load more items
      scrollTimerRef.current = setTimeout(() => {
        const scrollPercentage =
          (target.scrollTop + target.clientHeight) / target.scrollHeight;

        if (scrollPercentage > 0.8 && displayedItems < properties.length) {
          setDisplayedItems((prev) => Math.min(prev + itemsPerPage, properties.length));
        }
      }, 150);
    }, [displayedItems, properties.length, itemsPerPage]);

    const handlePropertyClick = useCallback((propertyId: string) => {
      const property = properties.find((p) => p.id === propertyId);
      if (property) {
        setSelectedProperty(property);
      }
    }, [properties]);

    const handleToggleFavorite = useCallback((propertyId: string) => {
      setFavorites((prev) => {
        const newFavorites = new Set(prev);
        if (newFavorites.has(propertyId)) {
          newFavorites.delete(propertyId);
        } else {
          newFavorites.add(propertyId);
        }
        return newFavorites;
      });
    }, []);

    const handleFavoriteClick = useCallback(() => {
      if (selectedProperty) {
        handleToggleFavorite(selectedProperty.id);
      }
    }, [selectedProperty, handleToggleFavorite]);

    const handleBuyClick = useCallback(() => {
      if (selectedProperty) {
        onBuyClick?.(selectedProperty.id);
      }
    }, [selectedProperty, onBuyClick]);

    useEffect(() => {
      return () => {
        if (scrollTimerRef.current) {
          clearTimeout(scrollTimerRef.current);
        }
      };
    }, []);

    return (
      <>
        <div
          ref={containerRef}
          onScroll={handleScroll}
          className="w-full h-[calc(100vh-200px)] overflow-y-auto"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {visibleProperties.map((property) => (
              <PropertyCard
                key={property.id}
                id={property.id}
                titleEn={property.titleEn}
                titleAr={property.titleAr}
                price={property.price}
                city={property.city}
                country={property.country}
                countryFlag={property.countryFlag}
                bedrooms={property.bedrooms}
                area={property.area}
                category={category as any}
                isFavorite={favorites.has(property.id)}
                onToggleFavorite={handleToggleFavorite}
                language={language}
                onPropertyClick={handlePropertyClick}
                images={property.images as PropertyImage[]}
                onTourClick={() => {
                  // Handle VR tour
                }}
              />
            ))}
          </div>

          {/* Loading indicator */}
          {displayedItems < properties.length && (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent" />
            </div>
          )}
        </div>

        {selectedProperty && (
          <PropertyDetailsModal
            isOpen={!!selectedProperty}
            onClose={() => setSelectedProperty(null)}
            property={{
              ...selectedProperty,
              images: selectedProperty.images as PropertyImage[],
            }}
            language={language}
            onFavoriteClick={handleFavoriteClick}
            isFavorite={favorites.has(selectedProperty.id)}
            onBuyClick={handleBuyClick}
          />
        )}
      </>
    );
  }
);

OptimizedPropertiesGrid.displayName = 'OptimizedPropertiesGrid';

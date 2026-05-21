'use client';

import { memo, useState, useCallback, useMemo } from 'react';
import { PropertyCard } from './property-card';

interface Property {
  id: string;
  titleEn: string;
  titleAr: string;
  price: number;
  city: string;
  country: string;
  countryFlag: string;
  bedrooms: number;
  area: number;
  category?: string;
  isFavorite?: boolean;
  panoramaUrl?: string;
}

interface OptimizedPropertyGridProps {
  properties: Property[];
  language: 'en' | 'ar';
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onPropertyClick?: (id: string) => void;
  onTourClick?: (id: string) => void;
}

const ITEMS_PER_PAGE = 12;
const VIEWPORT_BUFFER = 3; // Load items beyond visible area

const OptimizedPropertyGrid = memo(function OptimizedPropertyGrid({
  properties,
  language,
  favorites,
  onToggleFavorite,
  onPropertyClick,
  onTourClick,
}: OptimizedPropertyGridProps) {
  const [visibleStart, setVisibleStart] = useState(0);

  // Paginate properties for better performance
  const paginatedProperties = useMemo(() => {
    const start = visibleStart;
    const end = start + ITEMS_PER_PAGE;
    return properties.slice(start, end);
  }, [properties, visibleStart]);

  // Memoized property cards to prevent unnecessary re-renders
  const propertyCards = useMemo(() => {
    return paginatedProperties.map((property) => (
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
        category={property.category || 'buy'}
        isFavorite={favorites.includes(property.id)}
        onToggleFavorite={onToggleFavorite}
        language={language}
        onPropertyClick={onPropertyClick}
        panoramaUrl={property.panoramaUrl}
        onTourClick={onTourClick}
      />
    ));
  }, [paginatedProperties, favorites, language, onToggleFavorite, onPropertyClick, onTourClick]);

  const hasMore = visibleStart + ITEMS_PER_PAGE < properties.length;

  const handleLoadMore = useCallback(() => {
    setVisibleStart((prev) => prev + ITEMS_PER_PAGE);
  }, []);

  return (
    <div className="space-y-6">
      {/* Grid Container */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {propertyCards}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="flex justify-center pt-4">
          <button
            onClick={handleLoadMore}
            className="px-6 py-3 bg-gradient-to-r from-accent to-secondary hover:shadow-lg hover:shadow-accent/50 text-accent-foreground rounded-lg font-semibold transition-all duration-300"
          >
            {language === 'en' ? 'Load More Properties' : 'تحميل المزيد من العقارات'}
          </button>
        </div>
      )}

      {/* Empty State */}
      {properties.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {language === 'en'
              ? 'No properties found'
              : 'لم يتم العثور على عقارات'}
          </p>
        </div>
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.properties.length === nextProps.properties.length &&
    prevProps.language === nextProps.language &&
    prevProps.favorites.length === nextProps.favorites.length &&
    JSON.stringify(prevProps.favorites) === JSON.stringify(nextProps.favorites)
  );
});

export default OptimizedPropertyGrid;

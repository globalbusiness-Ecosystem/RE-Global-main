'use client';

import { memo, useState, useCallback } from 'react';
import { PropertyCard } from './property-card';
import { PropertyDetailsModal } from './property-details-modal';
import { SampleProperty, SAMPLE_PROPERTIES } from '@/lib/sample-properties';
import { PropertyImage } from './property-images-carousel';

interface PropertiesGridProps {
  language: 'en' | 'ar';
  category?: string;
  properties?: SampleProperty[];
  onBuyClick?: (propertyId: string) => void;
}

export const PropertiesGrid = memo(
  ({
    language,
    category,
    properties = SAMPLE_PROPERTIES,
    onBuyClick
  }: PropertiesGridProps) => {
    const [selectedProperty, setSelectedProperty] = useState<SampleProperty | null>(null);
    const [favorites, setFavorites] = useState<Set<string>>(new Set());

    const handlePropertyClick = useCallback((propertyId: string) => {
      const property = properties.find(p => p.id === propertyId);
      if (property) {
        setSelectedProperty(property);
      }
    }, [properties]);

    const handleToggleFavorite = useCallback((propertyId: string) => {
      setFavorites(prev => {
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

    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
          {properties.map((property) => (
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

        {selectedProperty && (
          <PropertyDetailsModal
            isOpen={!!selectedProperty}
            onClose={() => setSelectedProperty(null)}
            property={{
              ...selectedProperty,
              images: selectedProperty.images as PropertyImage[]
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

PropertiesGrid.displayName = 'PropertiesGrid';

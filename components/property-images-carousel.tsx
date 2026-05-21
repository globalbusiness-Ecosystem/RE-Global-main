'use client';

import { memo, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PropertyImage {
  id: string;
  url: string;
  title?: string;
  alt: string;
}

interface PropertyImagesCarouselProps {
  images: PropertyImage[];
  isLoading?: boolean;
  onImageClick?: (imageIndex: number) => void;
  className?: string;
}

export const PropertyImagesCarousel = memo(
  ({
    images,
    isLoading = false,
    onImageClick,
    className
  }: PropertyImagesCarouselProps) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const goToPrevious = useCallback((e: React.MouseEvent) => {
      e.stopPropagation();
      setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    }, [images.length]);

    const goToNext = useCallback((e: React.MouseEvent) => {
      e.stopPropagation();
      setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    }, [images.length]);

    const handleImageClick = useCallback(() => {
      onImageClick?.(currentIndex);
    }, [currentIndex, onImageClick]);

    if (!images || images.length === 0) {
      return (
        <div className={cn('w-full h-40 bg-muted rounded-lg flex items-center justify-center', className)}>
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <ImageIcon className="w-8 h-8" />
            <span className="text-xs">لا توجد صور</span>
          </div>
        </div>
      );
    }

    const currentImage = images[currentIndex];

    return (
      <div className={cn('relative w-full h-40 overflow-hidden rounded-lg group', className)}>
        {/* Main Image */}
        <img
          key={currentImage.id}
          src={currentImage.url}
          alt={currentImage.alt}
          onClick={handleImageClick}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 cursor-pointer"
          loading="lazy"
        />

        {/* Loading State */}
        {isLoading && (
          <div className="absolute inset-0 bg-black/20 animate-pulse" />
        )}

        {/* Image Counter */}
        {images.length > 1 && (
          <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-lg text-xs text-white font-medium">
            {currentIndex + 1} / {images.length}
          </div>
        )}

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={goToNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
              aria-label="Next image"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}

        {/* Thumbnail Strip */}
        {images.length > 1 && (
          <div className="absolute bottom-0 left-0 right-0 flex gap-1 p-2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {images.slice(0, 5).map((img, idx) => (
              <button
                key={img.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(idx);
                }}
                className={cn(
                  'w-8 h-8 rounded-sm overflow-hidden border-2 transition-all duration-200 flex-shrink-0',
                  currentIndex === idx
                    ? 'border-accent scale-110'
                    : 'border-white/30 opacity-60 hover:opacity-100'
                )}
              >
                <img
                  src={img.url}
                  alt={img.alt}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
            {images.length > 5 && (
              <div className="w-8 h-8 rounded-sm bg-black/50 flex items-center justify-center text-xs text-white border border-white/30">
                +{images.length - 5}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
);

PropertyImagesCarousel.displayName = 'PropertyImagesCarousel';

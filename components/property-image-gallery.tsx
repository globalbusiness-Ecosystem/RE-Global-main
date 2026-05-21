'use client';

import { useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { PropertyImage } from '@/lib/vr-tour-types';

interface PropertyImageGalleryProps {
  images: PropertyImage[];
  roomName: string;
  onClose?: () => void;
}

export const PropertyImageGallery = ({
  images,
  roomName,
  onClose,
}: PropertyImageGalleryProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  const currentImage = images[currentIndex];

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'Escape') setIsExpanded(false);
    },
    [handleNext, handlePrev]
  );

  if (!currentImage) return null;

  return (
    <>
      {/* Compact Gallery - Bottom Right */}
      <div className="absolute bottom-24 right-8 z-40 w-32 h-40 rounded-xl overflow-hidden border-2 border-gold/50 hover:border-gold transition-all group cursor-pointer"
           onClick={() => setIsExpanded(true)}>
        
        {/* Main Image */}
        <div className="relative w-full h-full bg-black/80">
          <img
            src={currentImage.url}
            alt={currentImage.caption}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
          
          {/* Image Counter */}
          <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-md px-2 py-1 rounded text-xs font-semibold text-gold border border-gold/40">
            {currentIndex + 1}/{images.length}
          </div>

          {/* Click to Expand Hint */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-sm">
            <span className="text-gold text-xs font-bold">Click to Expand</span>
          </div>
        </div>

        {/* Navigation Arrows - Compact */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-between items-center bg-gradient-to-t from-black/80 to-transparent p-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            className="p-1 rounded bg-gold/20 hover:bg-gold/40 text-gold transition-all"
          >
            <ChevronLeft className="w-3 h-3" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="p-1 rounded bg-gold/20 hover:bg-gold/40 text-gold transition-all"
          >
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {/* Thumbnail Strip */}
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 flex gap-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          {images.map((_, idx) => (
            <div
              key={idx}
              className={`h-1 flex-1 rounded-full transition-all ${
                idx === currentIndex ? 'bg-gold' : 'bg-gold/30'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Expanded Gallery Modal */}
      {isExpanded && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center"
          onClick={() => setIsExpanded(false)}
          onKeyDown={handleKeyDown}
          role="dialog"
          tabIndex={0}
        >
          {/* Close Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(false);
              onClose?.();
            }}
            className="absolute top-6 right-6 p-3 rounded-full bg-black/60 hover:bg-black/80 text-gold hover:text-yellow-300 transition-all border border-gold/40 hover:border-gold z-50"
            aria-label="Close gallery"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="flex flex-col items-center justify-center gap-6 w-full h-full px-6 py-12">
            {/* Main Image */}
            <div className="relative w-full max-w-2xl h-96 rounded-2xl overflow-hidden border-2 border-gold/40 shadow-2xl">
              <img
                src={currentImage.url}
                alt={currentImage.caption}
                className="w-full h-full object-cover"
              />

              {/* Navigation Overlays */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrev();
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-gold/20 hover:bg-gold/40 border border-gold/60 hover:border-gold text-gold transition-all"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-gold/20 hover:bg-gold/40 border border-gold/60 hover:border-gold text-gold transition-all"
                aria-label="Next image"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            {/* Image Info */}
            <div className="text-center max-w-2xl">
              <h3 className="text-2xl font-bold text-gold mb-2">{roomName} Photos</h3>
              <p className="text-gold/70 text-lg mb-4">{currentImage.caption}</p>
              <p className="text-gold/50 text-sm">
                Image {currentIndex + 1} of {images.length}
              </p>
            </div>

            {/* Thumbnail Grid */}
            <div className="flex gap-3 justify-center flex-wrap max-w-3xl">
              {images.map((image, idx) => (
                <button
                  key={image.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentIndex(idx);
                  }}
                  className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                    idx === currentIndex
                      ? 'border-gold scale-110'
                      : 'border-gold/30 hover:border-gold/60'
                  }`}
                  title={image.caption}
                >
                  <img
                    src={image.url}
                    alt={`Thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {image.featured && (
                    <div className="absolute top-1 right-1 w-3 h-3 bg-gold rounded-full border border-gold/40" />
                  )}
                </button>
              ))}
            </div>

            {/* Keyboard Instructions */}
            <div className="text-center text-gold/50 text-xs mt-4">
              ← → Arrows to navigate • ESC to close
            </div>
          </div>
        </div>
      )}
    </>
  );
};

'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { SkeletonLoader } from './skeleton-loader';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  objectFit?: 'cover' | 'contain' | 'fill';
  onLoad?: () => void;
  showSkeleton?: boolean;
}

export const OptimizedImage = ({
  src,
  alt,
  width = 400,
  height = 300,
  className = '',
  priority = false,
  objectFit = 'cover',
  onLoad,
  showSkeleton = true,
}: OptimizedImageProps) => {
  const [isLoading, setIsLoading] = useState(!priority);
  const [error, setError] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Memoize the optimized image URL to prevent unnecessary recalculations
  const optimizedSrc = useMemo(() => {
    if (!src || src.includes('placeholder')) return src;
    
    // Add image optimization parameters for Unsplash
    if (src.includes('unsplash.com')) {
      const separator = src.includes('?') ? '&' : '?';
      return `${src}${separator}q=80&w=${width * 2}&fm=webp`;
    }
    
    return src;
  }, [src, width]);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || !containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            try {
              setShouldLoad(true);
              observer.unobserve(entry.target);
            } catch (error) {
              console.error('Intersection observer error:', error);
            }
          }
        });
      },
      {
        rootMargin: '50px',
        threshold: 0.01,
      }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [priority]);

  const handleLoadingComplete = () => {
    try {
      setIsLoading(false);
      onLoad?.();
    } catch (error) {
      console.error('Load complete error:', error);
    }
  };

  const handleError = () => {
    try {
      setError(true);
      setIsLoading(false);
    } catch (error) {
      console.error('Error handler error:', error);
    }
  };

  if (error) {
    return (
      <div 
        className={`bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <span className="text-gray-400 text-sm text-center px-2">{alt}</span>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      style={{ width, height }}
    >
      {showSkeleton && isLoading && (
        <SkeletonLoader 
          width={width} 
          height={height} 
          className="absolute inset-0"
          shimmer={true}
        />
      )}
      {shouldLoad && (
        <img
          ref={imgRef}
          src={optimizedSrc}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          className={`w-full h-full transition-opacity duration-300 ${
            isLoading ? 'opacity-0' : 'opacity-100'
          }`}
          style={{ objectFit, width, height }}
          onLoad={handleLoadingComplete}
          onError={handleError}
        />
      )}
    </div>
  );
};

'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface UseLazyImageOptions {
  threshold?: number;
  rootMargin?: string;
  onLoad?: () => void;
  onError?: () => void;
  enableBlur?: boolean;
  blurDataURL?: string;
}

/**
 * Hook for lazy loading images with blur-up effect
 */
export function useLazyImage(
  src: string,
  alt: string,
  options: UseLazyImageOptions = {}
) {
  const {
    threshold = 0.1,
    rootMargin = '50px',
    onLoad,
    onError,
    enableBlur = true,
    blurDataURL
  } = options;

  const [imageSrc, setImageSrc] = useState<string>(blurDataURL || '');
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const ref = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && ref.current) {
          const img = ref.current;
          const handleLoad = () => {
            setImageSrc(src);
            setIsLoaded(true);
            onLoad?.();
          };

          const handleError = (err: Event) => {
            const error = err instanceof ErrorEvent 
              ? new Error(err.message) 
              : new Error('Image failed to load');
            setError(error);
            onError?.();
          };

          img.addEventListener('load', handleLoad);
          img.addEventListener('error', handleError);
          img.src = src;

          observer.unobserve(img);

          return () => {
            img.removeEventListener('load', handleLoad);
            img.removeEventListener('error', handleError);
          };
        }
      },
      { threshold, rootMargin }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [src, threshold, rootMargin, onLoad, onError]);

  return {
    ref,
    src: imageSrc,
    alt,
    isLoaded,
    error,
    className: `transition-all duration-300 ${isLoaded ? 'blur-0' : enableBlur ? 'blur-sm' : ''}`
  };
}

/**
 * Hook for managing multiple lazy images
 */
export function useLazyImages(
  images: Array<{ src: string; alt: string }>,
  options: UseLazyImageOptions = {}
) {
  const [loadedIndices, setLoadedIndices] = useState<Set<number>>(new Set());
  const refs = useRef<(HTMLImageElement | null)[]>([]);

  const handleImageLoad = useCallback((index: number) => {
    setLoadedIndices(prev => new Set([...prev, index]));
    options.onLoad?.();
  }, [options]);

  const handleImageError = useCallback((index: number) => {
    console.error(`Failed to load image at index ${index}`);
    options.onError?.();
  }, [options]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            const index = refs.current.indexOf(img);
            if (index !== -1) {
              img.src = images[index].src;
              observer.unobserve(img);
            }
          }
        });
      },
      { threshold: options.threshold || 0.1 }
    );

    refs.current.forEach((img) => {
      if (img) observer.observe(img);
    });

    return () => observer.disconnect();
  }, [images, options.threshold]);

  return {
    refs,
    loadedIndices,
    onLoad: handleImageLoad,
    onError: handleImageError
  };
}

/**
 * Progressive image loading hook
 */
export function useProgressiveImage(
  lowQualitySrc: string,
  highQualitySrc: string,
  alt: string
) {
  const [src, setSrc] = useState(lowQualitySrc);
  const [isLoading, setIsLoading] = useState(true);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const img = new Image();
    img.src = highQualitySrc;
    img.onload = () => {
      setSrc(highQualitySrc);
      setIsLoading(false);
    };
  }, [highQualitySrc]);

  return { ref: imgRef, src, alt, isLoading };
}

/**
 * Responsive image hook with srcset
 */
export function useResponsiveImage(
  basePath: string,
  widths: number[] = [320, 640, 1024, 1920]
) {
  const srcSet = widths
    .map(width => {
      const ext = basePath.split('.').pop();
      const path = basePath.replace(new RegExp(`\\.${ext}$`), '');
      return `${path}-${width}w.${ext} ${width}w`;
    })
    .join(', ');

  return {
    srcSet,
    src: basePath,
    sizes: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
  };
}

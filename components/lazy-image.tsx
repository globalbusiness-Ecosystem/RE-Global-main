'use client';

import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';

interface LazyImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  placeholder?: string;
  priority?: boolean;
  onLoad?: () => void;
}

/**
 * Lazy loading image component with progressive image loading
 * Uses intersection observer for efficient image loading
 */
export function LazyImage({
  src,
  alt,
  width = 400,
  height = 300,
  className = '',
  placeholder,
  priority = false,
  onLoad,
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(priority);
  const [isVisible, setIsVisible] = useState(priority);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!imageRef.current || isVisible) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: '50px' }
    );

    observer.observe(imageRef.current);

    return () => {
      if (imageRef.current) {
        observer.unobserve(imageRef.current);
      }
    };
  }, [isVisible]);

  return (
    <div
      ref={imageRef}
      className={`relative overflow-hidden ${className}`}
      style={{
        width: width || 'auto',
        height: height || 'auto',
      }}
    >
      {placeholder && !isLoaded && (
        <div
          className="absolute inset-0 bg-cover bg-center blur-md"
          style={{ backgroundImage: `url(${placeholder})` }}
        />
      )}
      
      {isVisible && (
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={`object-cover transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => {
            setIsLoaded(true);
            onLoad?.();
          }}
          quality={85}
          priority={priority}
        />
      )}
    </div>
  );
}

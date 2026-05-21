'use client';

/**
 * Advanced image optimization and caching system
 */

interface OptimizedImageConfig {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
  enableLazyLoading?: boolean;
}

const IMAGE_CACHE = new Map<string, {
  data: Blob;
  timestamp: number;
  size: number;
}>();

const CACHE_SIZE_LIMIT = 50 * 1024 * 1024; // 50MB
let currentCacheSize = 0;

/**
 * Optimize image using Canvas API
 */
export async function optimizeImage(
  imageSource: string | Blob,
  config: OptimizedImageConfig = {}
): Promise<Blob> {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.8,
    format = 'webp'
  } = config;

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  const img = new Image();
  img.crossOrigin = 'anonymous';

  return new Promise((resolve, reject) => {
    img.onload = () => {
      let { width, height } = img;

      // Calculate new dimensions maintaining aspect ratio
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Canvas conversion failed'));
        },
        `image/${format}`,
        quality
      );
    };

    img.onerror = () => reject(new Error('Image load failed'));

    if (typeof imageSource === 'string') {
      img.src = imageSource;
    } else {
      img.src = URL.createObjectURL(imageSource);
    }
  });
}

/**
 * Get cached image or generate optimized version
 */
export async function getCachedOptimizedImage(
  imageSource: string,
  config: OptimizedImageConfig = {}
): Promise<string> {
  const cacheKey = `${imageSource}-${JSON.stringify(config)}`;
  const cached = IMAGE_CACHE.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < 24 * 60 * 60 * 1000) {
    return URL.createObjectURL(cached.data);
  }

  const optimized = await optimizeImage(imageSource, config);
  
  // Manage cache size
  if (currentCacheSize + optimized.size > CACHE_SIZE_LIMIT) {
    clearOldestCacheEntry();
  }

  currentCacheSize += optimized.size;
  IMAGE_CACHE.set(cacheKey, {
    data: optimized,
    timestamp: Date.now(),
    size: optimized.size
  });

  return URL.createObjectURL(optimized);
}

/**
 * Remove oldest cache entry to maintain size limit
 */
function clearOldestCacheEntry(): void {
  let oldestKey: string | null = null;
  let oldestTime = Date.now();

  IMAGE_CACHE.forEach((value, key) => {
    if (value.timestamp < oldestTime) {
      oldestTime = value.timestamp;
      oldestKey = key;
    }
  });

  if (oldestKey) {
    const entry = IMAGE_CACHE.get(oldestKey);
    if (entry) {
      currentCacheSize -= entry.size;
      IMAGE_CACHE.delete(oldestKey);
    }
  }
}

/**
 * Generate responsive image srcset
 */
export function generateImageSrcSet(
  imagePath: string,
  widths: number[] = [320, 640, 1024, 1920]
): string {
  return widths
    .map(width => `${imagePath}?w=${width} ${width}w`)
    .join(', ');
}

/**
 * Create WebP fallback URLs
 */
export function getImageWithFallback(imagePath: string): {
  webp: string;
  fallback: string;
} {
  return {
    webp: imagePath.replace(/\.\w+$/, '.webp'),
    fallback: imagePath
  };
}

/**
 * Preload critical images
 */
export function preloadImages(imagePaths: string[]): void {
  if (typeof window === 'undefined') return;

  imagePaths.forEach(path => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = path;
    document.head.appendChild(link);
  });
}

/**
 * Clean cache
 */
export function clearImageCache(): void {
  IMAGE_CACHE.forEach((_, key) => {
    IMAGE_CACHE.delete(key);
  });
  currentCacheSize = 0;
}

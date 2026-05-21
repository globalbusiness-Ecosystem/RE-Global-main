/**
 * 4K Ultra HD Panoramic Viewer Utilities
 * Comprehensive tools for rendering, caching, and optimizing 4K panoramic content
 */

export type QualityLevel = '4k' | '2k' | '1080p';

export interface QualitySettings {
  resolution: {
    width: number;
    height: number;
  };
  maxZoom: number;
  scale: number;
  pixelRatio: number;
  bufferSize: number;
  compressionLevel: number;
  filterIntensity: number;
}

export const QUALITY_SETTINGS: Record<QualityLevel, QualitySettings> = {
  '4k': {
    resolution: { width: 3840, height: 2160 },
    maxZoom: 4,
    scale: 2.0,
    pixelRatio: 2,
    bufferSize: 512,
    compressionLevel: 0.1,
    filterIntensity: 1.1,
  },
  '2k': {
    resolution: { width: 2560, height: 1440 },
    maxZoom: 3,
    scale: 1.5,
    pixelRatio: 1.5,
    bufferSize: 256,
    compressionLevel: 0.15,
    filterIntensity: 1.05,
  },
  '1080p': {
    resolution: { width: 1920, height: 1080 },
    maxZoom: 2.5,
    scale: 1.0,
    pixelRatio: 1,
    bufferSize: 128,
    compressionLevel: 0.2,
    filterIntensity: 1.0,
  },
};

/**
 * Image preloading cache for 4K panoramas
 */
export class PanoramicImageCache {
  private cache: Map<string, HTMLImageElement> = new Map();
  private loadingPromises: Map<string, Promise<HTMLImageElement>> = new Map();
  private maxCacheSize: number;
  private currentCacheSize: number = 0;

  constructor(maxSizeMB: number = 500) {
    this.maxCacheSize = maxSizeMB * 1024 * 1024;
  }

  async preloadImage(url: string): Promise<HTMLImageElement> {
    // Return cached image if available
    if (this.cache.has(url)) {
      return this.cache.get(url)!;
    }

    // Return existing loading promise if already loading
    if (this.loadingPromises.has(url)) {
      return this.loadingPromises.get(url)!;
    }

    // Load new image
    const promise = new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        this.addToCache(url, img);
        resolve(img);
      };
      img.onerror = reject;
      img.src = url;
    });

    this.loadingPromises.set(url, promise);
    return promise;
  }

  private addToCache(url: string, img: HTMLImageElement) {
    // Simple cache management
    if (this.cache.size >= 10) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(url, img);
    this.loadingPromises.delete(url);
  }

  clearCache() {
    this.cache.clear();
    this.loadingPromises.clear();
    this.currentCacheSize = 0;
  }

  getStats() {
    return {
      cachedImages: this.cache.size,
      loadingPromises: this.loadingPromises.size,
    };
  }
}

/**
 * Apply advanced 4K filters and enhancements
 */
export function apply4KFilters(
  ctx: CanvasRenderingContext2D,
  quality: QualityLevel,
  brightness: number = 1,
  contrast: number = 1,
  saturation: number = 1
) {
  const settings = QUALITY_SETTINGS[quality];
  const intenseFactor = settings.filterIntensity;

  const adjustedContrast = (1 + (contrast - 1) * intenseFactor).toFixed(2);
  const adjustedBrightness = (brightness * 0.98).toFixed(2);
  const adjustedSaturation = (1 + (saturation - 1) * intenseFactor * 0.5).toFixed(2);

  ctx.filter = `contrast(${adjustedContrast}) brightness(${adjustedBrightness}) saturate(${adjustedSaturation}) hue-rotate(0deg)`;
}

/**
 * Calculate optimal viewport for 4K rendering
 */
export function calculateViewport(
  canvasWidth: number,
  canvasHeight: number,
  zoom: number,
  quality: QualityLevel
): {
  scale: number;
  offsetX: number;
  offsetY: number;
} {
  const settings = QUALITY_SETTINGS[quality];
  const scale = zoom * settings.scale;

  return {
    scale,
    offsetX: (canvasWidth * (1 - 1 / zoom)) / 2,
    offsetY: (canvasHeight * (1 - 1 / zoom)) / 2,
  };
}

/**
 * Enable hardware acceleration for canvas rendering
 */
export function enableHardwareAcceleration(canvas: HTMLCanvasElement): boolean {
  const ctx = canvas.getContext('2d', { willReadFrequently: false });
  if (!ctx) return false;

  // Check for GPU acceleration support
  const glCanvas = document.createElement('canvas');
  const gl =
    glCanvas.getContext('webgl') ||
    glCanvas.getContext('experimental-webgl');

  return !!gl && !!ctx;
}

/**
 * Performance monitoring for panoramic viewer
 */
export class PanoramicPerformanceMonitor {
  private frameCount: number = 0;
  private lastTime: number = performance.now();
  private fps: number = 0;
  private frameTimings: number[] = [];

  recordFrame(timestamp: number) {
    this.frameCount++;
    const deltaTime = timestamp - this.lastTime;
    this.frameTimings.push(deltaTime);

    if (this.frameTimings.length > 60) {
      this.frameTimings.shift();
    }

    if (deltaTime >= 1000) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.lastTime = timestamp;
    }
  }

  getStats() {
    const avgFrameTime =
      this.frameTimings.reduce((a, b) => a + b, 0) /
      (this.frameTimings.length || 1);
    const maxFrameTime = Math.max(...this.frameTimings, 0);
    const minFrameTime = Math.min(...this.frameTimings, 0);

    return {
      fps: this.fps,
      avgFrameTime: avgFrameTime.toFixed(2),
      maxFrameTime: maxFrameTime.toFixed(2),
      minFrameTime: minFrameTime.toFixed(2),
      frameCount: this.frameTimings.length,
    };
  }

  reset() {
    this.frameCount = 0;
    this.frameTimings = [];
    this.fps = 0;
  }
}

/**
 * Adaptive quality selector based on device performance
 */
export function selectOptimalQuality(
  deviceMemory?: number,
  connectionSpeed?: string
): QualityLevel {
  // Check device memory if available
  if (deviceMemory) {
    if (deviceMemory >= 8) return '4k';
    if (deviceMemory >= 4) return '2k';
    return '1080p';
  }

  // Check connection speed
  if (connectionSpeed === '4g' || connectionSpeed === 'wifi') {
    return '4k';
  }
  if (connectionSpeed === '3g') {
    return '2k';
  }

  // Default to 2K for safety
  return '2k';
}

/**
 * Generate 4K-optimized thumbnail from panorama
 */
export async function generatePanoramaThumbnail(
  imageUrl: string,
  thumbnailSize: { width: number; height: number } = { width: 320, height: 180 }
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = thumbnailSize.width;
      canvas.height = thumbnailSize.height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      // Apply high-quality rendering
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Draw thumbnail with slight zoom on center
      const centerX = img.width / 2;
      const centerY = img.height / 2;
      const sourceSize = Math.min(img.width, img.height) * 0.8;

      ctx.drawImage(
        img,
        centerX - sourceSize / 2,
        centerY - sourceSize / 2,
        sourceSize,
        sourceSize,
        0,
        0,
        thumbnailSize.width,
        thumbnailSize.height
      );

      resolve(canvas.toDataURL('image/jpeg', 0.9));
    };

    img.onerror = reject;
    img.src = imageUrl;
  });
}

/**
 * Batch load multiple panoramic images with progress tracking
 */
export async function batchLoadPanoramas(
  urls: string[],
  onProgress?: (current: number, total: number) => void
): Promise<Map<string, HTMLImageElement>> {
  const results = new Map<string, HTMLImageElement>();
  const cache = new PanoramicImageCache();

  for (let i = 0; i < urls.length; i++) {
    try {
      const img = await cache.preloadImage(urls[i]);
      results.set(urls[i], img);
      onProgress?.(i + 1, urls.length);
    } catch (error) {
      console.error(`Failed to load panorama: ${urls[i]}`, error);
    }
  }

  return results;
}

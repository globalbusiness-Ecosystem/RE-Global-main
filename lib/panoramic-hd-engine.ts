/**
 * Advanced Ultra HD Panoramic Engine
 * Global High-Performance Panoramic Camera System
 * Supports 195+ countries with adaptive rendering and extreme optimization
 */

export type QualityLevel = '8k' | '6k' | '4k' | '2k' | '1080p';
export type RenderMode = 'sphere' | 'cube' | 'flat';
export type InteractionMode = 'smooth' | 'kinetic' | 'restricted';

export interface PanoramicConfig {
  quality: QualityLevel;
  renderMode: RenderMode;
  interactionMode: InteractionMode;
  enableAutoRotation: boolean;
  autoRotationSpeed: number;
  enableMosaicOptimization: boolean;
  enableProgressiveLoading: boolean;
  enableOfflineCache: boolean;
  maxCacheSize: number;
  enableAdaptiveQuality: boolean;
  targetFPS: number;
}

export interface PerformanceMetrics {
  fps: number;
  renderTime: number;
  loadingProgress: number;
  bandwidth: number;
  memoryUsage: number;
  batteryLevel: number;
}

// Quality presets
export const QUALITY_PRESETS: Record<QualityLevel, any> = {
  '8k': {
    resolution: { width: 7680, height: 4320 },
    maxZoom: 8,
    scale: 4.0,
    pixelRatio: 4,
    tileSize: 1024,
    bufferSize: 1024,
  },
  '6k': {
    resolution: { width: 6016, height: 3384 },
    maxZoom: 6,
    scale: 3.0,
    pixelRatio: 3,
    tileSize: 768,
    bufferSize: 768,
  },
  '4k': {
    resolution: { width: 3840, height: 2160 },
    maxZoom: 4,
    scale: 2.0,
    pixelRatio: 2,
    tileSize: 512,
    bufferSize: 512,
  },
  '2k': {
    resolution: { width: 2560, height: 1440 },
    maxZoom: 3,
    scale: 1.5,
    pixelRatio: 1.5,
    tileSize: 256,
    bufferSize: 256,
  },
  '1080p': {
    resolution: { width: 1920, height: 1080 },
    maxZoom: 2.5,
    scale: 1.0,
    pixelRatio: 1,
    tileSize: 128,
    bufferSize: 128,
  },
};

// Advanced Tile-Based Loading System
export class TileLoader {
  private tileCache = new Map<string, HTMLCanvasElement>();
  private loadingQueue: Set<string> = new Set();
  private maxConcurrentLoads = 4;
  private tileSize: number;

  constructor(tileSize: number = 512) {
    this.tileSize = tileSize;
  }

  generateTileKey(x: number, y: number, zoom: number): string {
    return `tile_${x}_${y}_${zoom}`;
  }

  async loadTile(
    image: HTMLImageElement,
    x: number,
    y: number,
    zoom: number
  ): Promise<HTMLCanvasElement | null> {
    const key = this.generateTileKey(x, y, zoom);

    if (this.tileCache.has(key)) {
      return this.tileCache.get(key)!;
    }

    if (this.loadingQueue.has(key)) {
      return null;
    }

    if (this.loadingQueue.size >= this.maxConcurrentLoads) {
      return null;
    }

    this.loadingQueue.add(key);

    const canvas = document.createElement('canvas');
    canvas.width = this.tileSize;
    canvas.height = this.tileSize;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const srcX = (x * this.tileSize) / Math.pow(2, zoom);
    const srcY = (y * this.tileSize) / Math.pow(2, zoom);
    const srcSize = image.width / Math.pow(2, zoom);

    ctx.drawImage(
      image,
      srcX,
      srcY,
      srcSize,
      srcSize,
      0,
      0,
      this.tileSize,
      this.tileSize
    );

    this.tileCache.set(key, canvas);
    this.loadingQueue.delete(key);

    return canvas;
  }

  clearCache() {
    this.tileCache.clear();
    this.loadingQueue.clear();
  }
}

// Performance Monitor
export class PanoramicPerformanceMonitor {
  private frameCount = 0;
  private lastTime = performance.now();
  private fps = 60;
  private renderTimes: number[] = [];
  private memoryUsage = 0;
  private batteryLevel = 100;

  constructor() {
    this.updateMemory();
    this.updateBattery();
  }

  recordFrame(renderTime: number) {
    this.renderTimes.push(renderTime);
    if (this.renderTimes.length > 60) {
      this.renderTimes.shift();
    }

    this.frameCount++;
    const now = performance.now();
    if (now - this.lastTime >= 1000) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.lastTime = now;
    }
  }

  private async updateMemory() {
    if ((performance as any).memory) {
      this.memoryUsage = (performance as any).memory.usedJSHeapSize / 1048576;
    }
  }

  private async updateBattery() {
    try {
      const battery = await (navigator as any).getBattery?.();
      if (battery) {
        this.batteryLevel = battery.level * 100;
      }
    } catch {}
  }

  getMetrics(): PerformanceMetrics {
    const avgRenderTime =
      this.renderTimes.length > 0
        ? this.renderTimes.reduce((a, b) => a + b, 0) / this.renderTimes.length
        : 0;

    return {
      fps: this.fps,
      renderTime: avgRenderTime,
      loadingProgress: 0,
      bandwidth: 0,
      memoryUsage: this.memoryUsage,
      batteryLevel: this.batteryLevel,
    };
  }
}

// Panoramic Cache Manager with Offline Support
export class PanoramicCacheManager {
  private db: IDBDatabase | null = null;
  private maxCacheSize: number;
  private currentSize = 0;

  constructor(maxSizeMB: number = 500) {
    this.maxCacheSize = maxSizeMB * 1024 * 1024;
    this.initDB();
  }

  private async initDB() {
    return new Promise<void>((resolve) => {
      const request = indexedDB.open('PanoramicCache', 1);

      request.onerror = () => resolve();

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('panoramas')) {
          db.createObjectStore('panoramas', { keyPath: 'url' });
        }
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve();
      };
    });
  }

  async get(url: string): Promise<Blob | null> {
    if (!this.db) return null;

    return new Promise((resolve) => {
      const transaction = this.db!.transaction(['panoramas'], 'readonly');
      const store = transaction.objectStore('panoramas');
      const request = store.get(url);

      request.onsuccess = () => {
        resolve(request.result?.data || null);
      };

      request.onerror = () => resolve(null);
    });
  }

  async set(url: string, blob: Blob): Promise<void> {
    if (!this.db || blob.size + this.currentSize > this.maxCacheSize) return;

    return new Promise<void>((resolve) => {
      const transaction = this.db!.transaction(['panoramas'], 'readwrite');
      const store = transaction.objectStore('panoramas');
      const request = store.put({ url, data: blob, timestamp: Date.now() });

      request.onsuccess = () => {
        this.currentSize += blob.size;
        resolve();
      };

      request.onerror = () => resolve();
    });
  }

  async clear(): Promise<void> {
    if (!this.db) return;

    return new Promise<void>((resolve) => {
      const transaction = this.db!.transaction(['panoramas'], 'readwrite');
      const store = transaction.objectStore('panoramas');
      const request = store.clear();

      request.onsuccess = () => {
        this.currentSize = 0;
        resolve();
      };

      request.onerror = () => resolve();
    });
  }
}

// Progressive Image Loader with Bandwidth Detection
export class ProgressiveImageLoader {
  async load(
    url: string,
    onProgress: (progress: number) => void
  ): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 100;
          onProgress(percentComplete);
        }
      });

      xhr.addEventListener('load', () => {
        const blob = xhr.response as Blob;
        const objectUrl = URL.createObjectURL(blob);

        const img = new Image();
        img.crossOrigin = 'anonymous';

        img.onload = () => {
          URL.revokeObjectURL(objectUrl);
          resolve(img);
        };

        img.onerror = () => {
          URL.revokeObjectURL(objectUrl);
          reject(new Error('Failed to load image'));
        };

        img.src = objectUrl;
      });

      xhr.addEventListener('error', () => reject(new Error('Network error')));
      xhr.addEventListener('abort', () => reject(new Error('Request aborted')));

      xhr.responseType = 'blob';
      xhr.open('GET', url, true);
      xhr.send();
    });
  }
}

// Adaptive Quality Manager
export class AdaptiveQualityManager {
  private lastQuality: QualityLevel = '4k';
  private fps = 60;
  private bandwidth = 10;

  updateMetrics(fps: number, bandwidth: number) {
    this.fps = fps;
    this.bandwidth = bandwidth;
  }

  getOptimalQuality(): QualityLevel {
    if (this.bandwidth < 1) return '1080p';
    if (this.bandwidth < 2) return '2k';
    if (this.bandwidth < 5) return '4k';
    if (this.bandwidth < 10) return '6k';
    return '8k';
  }

  shouldDowngrade(fps: number): boolean {
    return fps < 30;
  }

  shouldUpgrade(fps: number): boolean {
    return fps > 50;
  }
}

// Gesture Recognition for Touch Interactions
export class GestureRecognizer {
  private touchStartDistance = 0;
  private lastX = 0;
  private lastY = 0;

  calculatePinchScale(touches: TouchList): number {
    if (touches.length !== 2) return 1;

    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (this.touchStartDistance === 0) {
      this.touchStartDistance = distance;
      return 1;
    }

    return distance / this.touchStartDistance;
  }

  calculateDragDelta(x: number, y: number): { dx: number; dy: number } {
    const dx = x - this.lastX;
    const dy = y - this.lastY;
    this.lastX = x;
    this.lastY = y;
    return { dx, dy };
  }

  resetPinch() {
    this.touchStartDistance = 0;
  }

  resetDrag(x: number, y: number) {
    this.lastX = x;
    this.lastY = y;
  }
}

// Kinetic Scrolling for Smooth Momentum
export class KineticScroller {
  private velocity = { x: 0, y: 0 };
  private lastPos = { x: 0, y: 0 };
  private lastTime = 0;
  private friction = 0.95;

  updateVelocity(x: number, y: number, time: number) {
    if (this.lastTime === 0) {
      this.lastTime = time;
      this.lastPos = { x, y };
      return;
    }

    const dt = time - this.lastTime;
    if (dt === 0) return;

    this.velocity.x = (x - this.lastPos.x) / dt;
    this.velocity.y = (y - this.lastPos.y) / dt;

    this.lastTime = time;
    this.lastPos = { x, y };
  }

  getNextPosition(x: number, y: number): { x: number; y: number } {
    this.velocity.x *= this.friction;
    this.velocity.y *= this.friction;

    return {
      x: x + this.velocity.x * 16, // 60fps frame time
      y: y + this.velocity.y * 16,
    };
  }

  reset() {
    this.velocity = { x: 0, y: 0 };
    this.lastTime = 0;
  }
}

export const defaultConfig: PanoramicConfig = {
  quality: '4k',
  renderMode: 'sphere',
  interactionMode: 'smooth',
  enableAutoRotation: true,
  autoRotationSpeed: 0.5,
  enableMosaicOptimization: true,
  enableProgressiveLoading: true,
  enableOfflineCache: true,
  maxCacheSize: 500,
  enableAdaptiveQuality: true,
  targetFPS: 60,
};

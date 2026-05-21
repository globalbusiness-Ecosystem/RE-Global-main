/**
 * Global Panoramic Viewer Optimization Utilities
 * Implements efficiency, performance, and multi-region support
 * Optimized for 195+ countries and all network conditions
 */

import { QualityLevel } from './panoramic-4k-utils';

// ==================== GLOBAL REGION CONFIGURATION ====================

export type Region = 'NA' | 'EU' | 'ASIA' | 'MENA' | 'AFRICA' | 'LATAM';
export type Language = 'en' | 'ar' | 'fr' | 'es' | 'zh' | 'pt' | 'de' | 'ja' | 'ru';

export interface RegionalConfig {
  cdnEndpoints: string[];
  language: Language;
  timezone: string;
  currency: string;
  rtl: boolean;
  dateFormat: string;
  numberFormat: string;
  imageFormat: 'webp' | 'avif' | 'jpeg' | 'png';
}

export const REGIONAL_CONFIGS: Record<Region, RegionalConfig> = {
  'MENA': {
    cdnEndpoints: ['https://cdn-mena.example.com', 'https://cdn-uae.example.com'],
    language: 'ar',
    timezone: 'Asia/Dubai',
    currency: 'AED',
    rtl: true,
    dateFormat: 'DD/MM/YYYY',
    numberFormat: '1٬000',
    imageFormat: 'webp'
  },
  'EU': {
    cdnEndpoints: ['https://cdn-eu.example.com', 'https://cdn-uk.example.com'],
    language: 'en',
    timezone: 'Europe/London',
    currency: 'EUR',
    rtl: false,
    dateFormat: 'DD/MM/YYYY',
    numberFormat: '1.000',
    imageFormat: 'avif'
  },
  'NA': {
    cdnEndpoints: ['https://cdn-us.example.com', 'https://cdn-ca.example.com'],
    language: 'en',
    timezone: 'America/New_York',
    currency: 'USD',
    rtl: false,
    dateFormat: 'MM/DD/YYYY',
    numberFormat: '1,000',
    imageFormat: 'avif'
  },
  'ASIA': {
    cdnEndpoints: ['https://cdn-asia.example.com', 'https://cdn-singapore.example.com'],
    language: 'en',
    timezone: 'Asia/Singapore',
    currency: 'USD',
    rtl: false,
    dateFormat: 'DD/MM/YYYY',
    numberFormat: '1,000',
    imageFormat: 'webp'
  },
  'AFRICA': {
    cdnEndpoints: ['https://cdn-africa.example.com', 'https://cdn-sa.example.com'],
    language: 'en',
    timezone: 'Africa/Johannesburg',
    currency: 'ZAR',
    rtl: false,
    dateFormat: 'DD/MM/YYYY',
    numberFormat: '1 000',
    imageFormat: 'jpeg'
  },
  'LATAM': {
    cdnEndpoints: ['https://cdn-latam.example.com', 'https://cdn-br.example.com'],
    language: 'pt',
    timezone: 'America/Sao_Paulo',
    currency: 'BRL',
    rtl: false,
    dateFormat: 'DD/MM/YYYY',
    numberFormat: '1.000',
    imageFormat: 'webp'
  }
};

// ==================== BANDWIDTH DETECTION ====================

export interface BandwidthInfo {
  speed: number; // Mbps
  effectiveType: '4g' | '3g' | '2g' | 'slow-2g';
  rtt: number; // Round-trip time in ms
  isSlowConnection: boolean;
}

export function detectBandwidth(): BandwidthInfo {
  const connection = (navigator as any).connection ||
                    (navigator as any).mozConnection ||
                    (navigator as any).webkitConnection;

  if (!connection) {
    // Fallback: assume decent connection
    return {
      speed: 5,
      effectiveType: '4g',
      rtt: 50,
      isSlowConnection: false
    };
  }

  const effectiveType = connection.effectiveType || '4g';
  let speed = 5; // default Mbps

  if (effectiveType === '4g') speed = 10;
  if (effectiveType === '3g') speed = 1.5;
  if (effectiveType === '2g') speed = 0.4;
  if (effectiveType === 'slow-2g') speed = 0.2;

  return {
    speed,
    effectiveType,
    rtt: connection.rtt || 50,
    isSlowConnection: effectiveType === '2g' || effectiveType === 'slow-2g'
  };
}

// ==================== ADAPTIVE QUALITY SELECTION ====================

export function selectQualityByBandwidth(bandwidth: BandwidthInfo): QualityLevel {
  if (bandwidth.isSlowConnection) return '1080p';
  if (bandwidth.speed < 1) return '1080p';
  if (bandwidth.speed < 3) return '2k';
  return '4k';
}

export function selectQualityByDevice(): QualityLevel {
  const memory = (navigator as any).deviceMemory;
  const gpu = detectGPU();

  if (!memory) return '2k'; // conservative default

  if (memory >= 8 && gpu) return '4k';
  if (memory >= 4) return '2k';
  return '1080p';
}

// ==================== GPU & HARDWARE DETECTION ====================

export function detectGPU(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || 
               canvas.getContext('experimental-webgl');
    return !!gl;
  } catch {
    return false;
  }
}

export function detectBattery(): Promise<{ level: number; charging: boolean }> {
  return new Promise((resolve) => {
    const getBattery = (navigator as any).getBattery?.() ||
                       Promise.resolve({ level: 1, charging: true });

    getBattery.then((battery: any) => {
      resolve({
        level: battery.level || 1,
        charging: battery.charging !== false
      });
    }).catch(() => {
      resolve({ level: 1, charging: true });
    });
  });
}

// ==================== IMAGE FORMAT DETECTION ====================

export async function detectSupportedFormat(): Promise<'avif' | 'webp' | 'jpeg'> {
  // Test AVIF
  const avifTest = document.createElement('canvas');
  if (avifTest.toDataURL('image/avif').indexOf('image/avif') === 5) {
    return 'avif';
  }

  // Test WebP
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 1;
  const ctx = canvas.getContext('2d');
  if (!ctx) return 'jpeg';

  ctx.fillStyle = 'rgb(0,0,0)';
  ctx.fillRect(0, 0, 1, 1);

  try {
    const webpData = canvas.toDataURL('image/webp');
    if (webpData.indexOf('image/webp') === 5) {
      return 'webp';
    }
  } catch (e) {
    // Fall through
  }

  return 'jpeg';
}

// ==================== MULTI-REGION CDN ROUTING ====================

export interface CDNRoute {
  endpoint: string;
  latency: number;
  region: Region;
}

export async function findFastestCDN(region: Region): Promise<string> {
  const config = REGIONAL_CONFIGS[region];
  const endpoints = config.cdnEndpoints;

  const latencies = await Promise.all(
    endpoints.map(async (endpoint) => {
      const start = performance.now();
      try {
        const response = await fetch(`${endpoint}/ping`, {
          method: 'HEAD',
          mode: 'no-cors',
          cache: 'no-store'
        });
        const latency = performance.now() - start;
        return { endpoint, latency };
      } catch {
        return { endpoint, latency: 999 };
      }
    })
  );

  return latencies.reduce((fastest, current) =>
    current.latency < fastest.latency ? current : fastest
  ).endpoint;
}

// ==================== PROGRESSIVE IMAGE LOADING ====================

export class ProgressiveImageLoader {
  private mainImage: HTMLImageElement | null = null;
  private placeholderUrl: string;
  private mainUrl: string;

  constructor(placeholderUrl: string, mainUrl: string) {
    this.placeholderUrl = placeholderUrl;
    this.mainUrl = mainUrl;
  }

  async load(onProgress?: (progress: number) => void): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      // First, load low-res placeholder
      const placeholder = new Image();
      placeholder.onload = () => {
        resolve(placeholder);

        // Then load main image in background
        const main = new Image();
        let lastProgress = 0;

        main.onprogress = (e) => {
          if (e.lengthComputable) {
            const progress = (e.loaded / e.total) * 100;
            if (progress - lastProgress > 5) {
              onProgress?.(progress);
              lastProgress = progress;
            }
          }
        };

        main.onload = () => {
          this.mainImage = main;
          resolve(main);
        };

        main.onerror = reject;
        main.crossOrigin = 'anonymous';
        main.src = this.mainUrl;
      };

      placeholder.onerror = reject;
      placeholder.crossOrigin = 'anonymous';
      placeholder.src = this.placeholderUrl;
    });
  }

  getMainImage(): HTMLImageElement | null {
    return this.mainImage;
  }
}

// ==================== MOSAIC TILING SYSTEM ====================

export interface ImageTile {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  url: string;
  loaded: boolean;
}

export class MosaicTiler {
  private tiles: Map<string, ImageTile> = new Map();
  private tileSize: number;
  private imageWidth: number;
  private imageHeight: number;

  constructor(imageWidth: number, imageHeight: number, tileSize: number = 256) {
    this.imageWidth = imageWidth;
    this.imageHeight = imageHeight;
    this.tileSize = tileSize;
    this.generateTiles();
  }

  private generateTiles() {
    const tilesX = Math.ceil(this.imageWidth / this.tileSize);
    const tilesY = Math.ceil(this.imageHeight / this.tileSize);

    for (let y = 0; y < tilesY; y++) {
      for (let x = 0; x < tilesX; x++) {
        const id = `${x}-${y}`;
        this.tiles.set(id, {
          id,
          x: x * this.tileSize,
          y: y * this.tileSize,
          width: Math.min(this.tileSize, this.imageWidth - x * this.tileSize),
          height: Math.min(this.tileSize, this.imageHeight - y * this.tileSize),
          url: `panorama_tile_${x}_${y}.jpg`,
          loaded: false
        });
      }
    }
  }

  getTilesInViewport(panX: number, panY: number, zoom: number): ImageTile[] {
    const viewportWidth = window.innerWidth / zoom;
    const viewportHeight = window.innerHeight / zoom;

    return Array.from(this.tiles.values()).filter(tile => {
      const tileRight = tile.x + tile.width;
      const tileBottom = tile.y + tile.height;
      const viewportRight = panX + viewportWidth;
      const viewportBottom = panY + viewportHeight;

      return !(tileRight < panX || tile.x > viewportRight ||
               tileBottom < panY || tile.y > viewportBottom);
    });
  }

  getAdjacentTiles(tileId: string): ImageTile[] {
    const tile = this.tiles.get(tileId);
    if (!tile) return [];

    const adjacent: ImageTile[] = [];
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];

    directions.forEach(([dx, dy]) => {
      const adjX = tile.x / this.tileSize + dx;
      const adjY = tile.y / this.tileSize + dy;
      const adjId = `${adjX}-${adjY}`;
      const adjTile = this.tiles.get(adjId);
      if (adjTile) adjacent.push(adjTile);
    });

    return adjacent;
  }

  getAllTiles(): ImageTile[] {
    return Array.from(this.tiles.values());
  }
}

// ==================== WEB VITALS MONITORING ====================

export interface WebVitals {
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  ttfb: number; // Time to First Byte
}

export class WebVitalsMonitor {
  private vitals: WebVitals = { lcp: 0, fid: 0, cls: 0, ttfb: 0 };

  initialize() {
    // Observe Largest Contentful Paint
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          const lastEntry = entries[entries.length - 1];
          this.vitals.lcp = lastEntry.renderTime || lastEntry.loadTime;
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (e) {
        // Observer not supported
      }

      // Observe First Input Delay
      try {
        const fidObserver = new PerformanceObserver((entryList) => {
          entryList.getEntries().forEach((entry: any) => {
            this.vitals.fid = entry.processingDuration;
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
      } catch (e) {
        // Observer not supported
      }

      // Observe Cumulative Layout Shift
      try {
        const clsObserver = new PerformanceObserver((entryList) => {
          entryList.getEntries().forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              this.vitals.cls += entry.value;
            }
          });
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (e) {
        // Observer not supported
      }
    }

    // TTFB from navigation timing
    window.addEventListener('load', () => {
      const navTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navTiming) {
        this.vitals.ttfb = navTiming.responseStart - navTiming.fetchStart;
      }
    });
  }

  getVitals(): WebVitals {
    return { ...this.vitals };
  }

  isGood(): boolean {
    return this.vitals.lcp < 2500 &&
           this.vitals.fid < 100 &&
           this.vitals.cls < 0.1 &&
           this.vitals.ttfb < 600;
  }
}

// ==================== SERVICE WORKER OFFLINE SUPPORT ====================

export async function registerOfflineSupport(): Promise<boolean> {
  if (!('serviceWorker' in navigator)) return false;

  try {
    await navigator.serviceWorker.register('/sw.js');
    return true;
  } catch (error) {
    console.error('Failed to register service worker:', error);
    return false;
  }
}

export function isOffline(): boolean {
  return !navigator.onLine;
}

// ==================== CACHE MANAGEMENT ====================

export class PanoramicCache {
  private static readonly DB_NAME = 'PanoramicViewerDB';
  private static readonly STORE_NAME = 'panoramas';
  private db: IDBDatabase | null = null;

  async initialize(): Promise<boolean> {
    return new Promise((resolve) => {
      const request = indexedDB.open(PanoramicCache.DB_NAME, 1);

      request.onupgradeneeded = (event: any) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(PanoramicCache.STORE_NAME)) {
          db.createObjectStore(PanoramicCache.STORE_NAME, { keyPath: 'url' });
        }
      };

      request.onsuccess = (event: any) => {
        this.db = event.target.result;
        resolve(true);
      };

      request.onerror = () => resolve(false);
    });
  }

  async set(url: string, imageData: Blob): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([PanoramicCache.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(PanoramicCache.STORE_NAME);
      store.put({ url, data: imageData, timestamp: Date.now() });

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject();
    });
  }

  async get(url: string): Promise<Blob | null> {
    if (!this.db) return null;

    return new Promise((resolve) => {
      const transaction = this.db!.transaction([PanoramicCache.STORE_NAME], 'readonly');
      const store = transaction.objectStore(PanoramicCache.STORE_NAME);
      const request = store.get(url);

      request.onsuccess = () => {
        resolve(request.result?.data || null);
      };

      request.onerror = () => resolve(null);
    });
  }

  async clear(): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve) => {
      const transaction = this.db!.transaction([PanoramicCache.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(PanoramicCache.STORE_NAME);
      store.clear();

      transaction.oncomplete = () => resolve();
    });
  }
}

// ==================== UTILITY FUNCTIONS ====================

export function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  const ua = navigator.userAgent;
  if (/mobile|android|iphone|ipod/i.test(ua)) return 'mobile';
  if (/ipad|android/i.test(ua)) return 'tablet';
  return 'desktop';
}

export function supportsWebP(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return canvas.toDataURL('image/webp').indexOf('image/webp') === 5;
  } catch {
    return false;
  }
}

export function getPrefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function getColorSchemePreference(): 'light' | 'dark' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

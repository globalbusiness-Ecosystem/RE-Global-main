'use client';

/**
 * Advanced performance optimization strategies
 */

interface PerformanceMetrics {
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  cls: number; // Cumulative Layout Shift
  ttfb: number; // Time to First Byte
  renderTime: number;
}

/**
 * Collect Core Web Vitals metrics
 */
export function collectWebVitals(): Partial<PerformanceMetrics> {
  if (typeof window === 'undefined') return {};

  const metrics: Partial<PerformanceMetrics> = {};

  // First Contentful Paint
  if ('PerformanceObserver' in window) {
    try {
      const paintEntries = performance.getEntriesByType('paint');
      paintEntries.forEach(entry => {
        if (entry.name === 'first-contentful-paint') {
          metrics.fcp = entry.startTime;
        }
      });
    } catch (e) {
      // Silently fail for older browsers
    }
  }

  // Navigation timing
  if (performance.timing) {
    metrics.ttfb = performance.timing.responseStart - performance.timing.navigationStart;
  }

  return metrics;
}

/**
 * Request animation frame batching
 */
export class RAFBatcher {
  private tasks: (() => void)[] = [];
  private scheduled = false;

  schedule(task: () => void): void {
    this.tasks.push(task);
    this.ensureScheduled();
  }

  private ensureScheduled(): void {
    if (!this.scheduled) {
      this.scheduled = true;
      requestAnimationFrame(() => {
        const tasksToRun = this.tasks.splice(0);
        tasksToRun.forEach(task => task());
        this.scheduled = false;
      });
    }
  }
}

/**
 * Intersection Observer Sentinel
 */
export class IntersectionSentinel {
  private observer: IntersectionObserver;
  private elements = new WeakMap<Element, () => void>();

  constructor(
    private onVisibilityChange: (isVisible: boolean, element: Element) => void,
    options?: IntersectionObserverInit
  ) {
    this.observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          const callback = this.elements.get(entry.target);
          if (callback) {
            callback();
          }
          this.onVisibilityChange(entry.isIntersecting, entry.target);
        });
      },
      {
        threshold: 0.1,
        ...options
      }
    );
  }

  observe(element: Element, callback: () => void): void {
    this.elements.set(element, callback);
    this.observer.observe(element);
  }

  unobserve(element: Element): void {
    this.observer.unobserve(element);
  }

  disconnect(): void {
    this.observer.disconnect();
  }
}

/**
 * Resource hints manager
 */
export class ResourceHintsManager {
  static preconnect(origins: string[]): void {
    origins.forEach(origin => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = origin;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });
  }

  static prefetch(urls: string[]): void {
    urls.forEach(url => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = url;
      document.head.appendChild(link);
    });
  }

  static dns(origins: string[]): void {
    origins.forEach(origin => {
      const link = document.createElement('link');
      link.rel = 'dns-prefetch';
      link.href = origin;
      document.head.appendChild(link);
    });
  }
}

/**
 * Service Worker manager for offline support
 */
export class ServiceWorkerManager {
  static async register(scriptPath: string = '/sw.js'): Promise<ServiceWorkerContainer> {
    if (!('serviceWorker' in navigator)) {
      console.warn('Service Workers not supported');
      return navigator.serviceWorker;
    }

    try {
      const registration = await navigator.serviceWorker.register(scriptPath);
      console.log('[ServiceWorker] Registered successfully:', registration);
      return navigator.serviceWorker;
    } catch (error) {
      console.error('[ServiceWorker] Registration failed:', error);
      return navigator.serviceWorker;
    }
  }

  static async unregister(): Promise<boolean> {
    if (!('serviceWorker' in navigator)) return false;

    const registrations = await navigator.serviceWorker.getRegistrations();
    const promises = registrations.map(reg => reg.unregister());
    const results = await Promise.all(promises);
    return results.every(r => r === true);
  }
}

/**
 * Compression utility for data
 */
export async function compressData(data: string): Promise<Uint8Array> {
  const encoder = new TextEncoder();
  const encoded = encoder.encode(data);
  
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoded);
      controller.close();
    }
  });

  const compressedStream = stream.pipeThrough(
    new CompressionStream('gzip') as any
  );

  const reader = compressedStream.getReader();
  const chunks: Uint8Array[] = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }

  return new Uint8Array(
    chunks.reduce((acc, chunk) => acc.concat(Array.from(chunk)), [] as number[])
  );
}

/**
 * Request coalescing for duplicate requests
 */
export class RequestCoalescer {
  private pendingRequests = new Map<string, Promise<any>>();

  async fetch<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key)!;
    }

    const promise = requestFn().finally(() => {
      this.pendingRequests.delete(key);
    });

    this.pendingRequests.set(key, promise);
    return promise;
  }
}

/**
 * Memory-efficient data structures
 */
export class CompactMap<K, V> {
  private data = new Map<K, V>();
  private lastAccess = new Map<K, number>();
  private maxSize: number;

  constructor(maxSize: number = 1000) {
    this.maxSize = maxSize;
  }

  set(key: K, value: V): void {
    if (this.data.size >= this.maxSize && !this.data.has(key)) {
      // Remove least recently used
      const lruKey = this.getLRUKey();
      if (lruKey) {
        this.data.delete(lruKey);
        this.lastAccess.delete(lruKey);
      }
    }

    this.data.set(key, value);
    this.lastAccess.set(key, Date.now());
  }

  get(key: K): V | undefined {
    this.lastAccess.set(key, Date.now());
    return this.data.get(key);
  }

  private getLRUKey(): K | undefined {
    let lruKey: K | undefined;
    let lruTime = Infinity;

    this.lastAccess.forEach((time, key) => {
      if (time < lruTime) {
        lruTime = time;
        lruKey = key;
      }
    });

    return lruKey;
  }
}

/**
 * Performance budget tracker
 */
export class PerformanceBudget {
  private budgets: Record<string, number> = {
    firstContentfulPaint: 1800,
    largestContentfulPaint: 2500,
    cumulativeLayoutShift: 0.1,
    timeToInteractive: 3800
  };

  setBudget(metric: string, maxMs: number): void {
    this.budgets[metric] = maxMs;
  }

  checkBudget(): Record<string, boolean> {
    const metrics = collectWebVitals();
    const results: Record<string, boolean> = {};

    Object.entries(this.budgets).forEach(([metric, budget]) => {
      const actual = (metrics as any)[metric];
      results[metric] = actual !== undefined ? actual <= budget : true;
    });

    return results;
  }
}

'use client';

/**
 * Advanced caching strategies for API responses and computations
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  tags?: string[];
}

interface CacheConfig {
  ttl?: number;
  maxSize?: number;
  strategy?: 'LRU' | 'FIFO' | 'TTL';
}

class AdvancedCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private accessOrder: string[] = [];
  private config: Required<CacheConfig>;

  constructor(config: CacheConfig = {}) {
    this.config = {
      ttl: config.ttl ?? 5 * 60 * 1000, // 5 minutes default
      maxSize: config.maxSize ?? 100,
      strategy: config.strategy ?? 'LRU',
    };
  }

  set(key: string, data: T, tags?: string[]): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      tags,
    };

    this.cache.set(key, entry);
    this.accessOrder.push(key);

    // Enforce max size
    if (this.cache.size > this.config.maxSize) {
      this.evict();
    }
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) return null;

    // Check TTL
    if (Date.now() - entry.timestamp > this.config.ttl) {
      this.cache.delete(key);
      this.accessOrder = this.accessOrder.filter(k => k !== key);
      return null;
    }

    // Update LRU order
    if (this.config.strategy === 'LRU') {
      this.accessOrder = this.accessOrder.filter(k => k !== key);
      this.accessOrder.push(key);
    }

    return entry.data;
  }

  invalidateByTag(tag: string): void {
    const keysToDelete: string[] = [];

    this.cache.forEach((entry, key) => {
      if (entry.tags?.includes(tag)) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => {
      this.cache.delete(key);
      this.accessOrder = this.accessOrder.filter(k => k !== key);
    });
  }

  clear(): void {
    this.cache.clear();
    this.accessOrder = [];
  }

  private evict(): void {
    if (this.config.strategy === 'LRU') {
      const keyToRemove = this.accessOrder.shift();
      if (keyToRemove) {
        this.cache.delete(keyToRemove);
      }
    } else if (this.config.strategy === 'FIFO') {
      const keyToRemove = this.accessOrder.shift();
      if (keyToRemove) {
        this.cache.delete(keyToRemove);
      }
    }
  }

  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      strategy: this.config.strategy,
    };
  }
}

// Global caches for different data types
export const marketDataCache = new AdvancedCache({ ttl: 10 * 60 * 1000, maxSize: 50 });
export const priceEstimateCache = new AdvancedCache({ ttl: 30 * 60 * 1000, maxSize: 200 });
export const propertyCache = new AdvancedCache({ ttl: 15 * 60 * 1000, maxSize: 100 });

export { AdvancedCache };

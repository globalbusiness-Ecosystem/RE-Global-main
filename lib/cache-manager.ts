// Advanced caching and request deduplication system

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

const requestCache = new Map<string, any>();
const pendingRequests = new Map<string, Promise<any>>();

/**
 * Create cache key from URL and parameters
 */
function createCacheKey(url: string, params?: Record<string, any>): string {
  const paramString = params ? JSON.stringify(params) : '';
  return `${url}:${paramString}`;
}

/**
 * Check if cache entry is still valid
 */
function isCacheValid<T>(entry: CacheEntry<T>): boolean {
  return Date.now() - entry.timestamp < entry.ttl;
}

/**
 * Fetch with caching and deduplication
 */
export async function cachedFetch<T>(
  url: string,
  options: {
    params?: Record<string, any>;
    ttl?: number; // Time to live in milliseconds
    deduplicateRequests?: boolean;
  } = {}
): Promise<T> {
  const {
    params,
    ttl = 5 * 60 * 1000, // 5 minutes default
    deduplicateRequests = true,
  } = options;

  const cacheKey = createCacheKey(url, params);

  // Check cache first
  if (requestCache.has(cacheKey)) {
    const cached = requestCache.get(cacheKey) as CacheEntry<T>;
    if (isCacheValid(cached)) {
      return cached.data;
    } else {
      requestCache.delete(cacheKey);
    }
  }

  // Deduplicate pending requests
  if (deduplicateRequests && pendingRequests.has(cacheKey)) {
    return pendingRequests.get(cacheKey)!;
  }

  // Create new request
  const request = (async () => {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const data = await response.json();
    
    // Store in cache
    requestCache.set(cacheKey, {
      data,
      timestamp: Date.now(),
      ttl,
    });

    return data as T;
  })();

  // Store pending request for deduplication
  if (deduplicateRequests) {
    pendingRequests.set(cacheKey, request);
  }

  try {
    return await request;
  } finally {
    pendingRequests.delete(cacheKey);
  }
}

/**
 * Clear specific cache entry or entire cache
 */
export function clearCache(url?: string): void {
  if (url) {
    const keys = Array.from(requestCache.keys()).filter(k => k.startsWith(url));
    keys.forEach(k => requestCache.delete(k));
  } else {
    requestCache.clear();
  }
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  return {
    cacheSize: requestCache.size,
    pendingRequests: pendingRequests.size,
    totalMemory: process.memoryUsage?.().heapUsed ?? 0,
  };
}

/**
 * Preload data into cache
 */
export async function preloadCache<T>(
  url: string,
  data: T,
  ttl: number = 5 * 60 * 1000
): Promise<void> {
  const cacheKey = createCacheKey(url);
  requestCache.set(cacheKey, {
    data,
    timestamp: Date.now(),
    ttl,
  });
}

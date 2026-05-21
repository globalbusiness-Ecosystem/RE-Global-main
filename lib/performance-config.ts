'use client';

/**
 * Performance Configuration
 * Centralized settings for all performance optimizations
 */

export const PERFORMANCE_CONFIG = {
  // Caching
  cache: {
    enabled: true,
    ttl: {
      marketData: 10 * 60 * 1000,      // 10 minutes
      priceEstimate: 30 * 60 * 1000,   // 30 minutes
      propertyData: 15 * 60 * 1000,    // 15 minutes
      apiResponse: 5 * 60 * 1000,      // 5 minutes
    },
    maxSize: {
      marketData: 50,
      priceEstimate: 200,
      propertyData: 100,
    },
  },

  // Request Optimization
  requests: {
    deduplicationEnabled: true,
    batchingEnabled: true,
    batchSize: 10,
    batchFlushDelay: 50, // ms
  },

  // Component Rendering
  rendering: {
    memoizationEnabled: true,
    lazyLoadingEnabled: true,
    paginationEnabled: true,
    itemsPerPage: 12,
  },

  // Images
  images: {
    lazyLoadingEnabled: true,
    webpEnabled: true,
    qualityNormal: 80,
    qualityLow: 60,
  },

  // Network Adaptive
  network: {
    adaptiveQualityEnabled: true,
    slowNetworkThreshold: '3g', // '2g' | '3g' | '4g'
  },

  // Performance Monitoring
  monitoring: {
    enabled: true,
    logPerformanceMetrics: false, // Set to true in development
    memoryWarningThreshold: 100, // MB
    longTaskThreshold: 50, // ms
  },

  // Code Splitting
  codeSplitting: {
    dynamicImportsEnabled: true,
    ssrDisabledForPages: [
      'MapPage',
      'AnalyticsPage',
      'SettingsPage',
    ],
  },
};

/**
 * Get cache TTL based on data type
 */
export function getCacheTTL(dataType: keyof typeof PERFORMANCE_CONFIG.cache.ttl): number {
  return PERFORMANCE_CONFIG.cache.ttl[dataType];
}

/**
 * Check if feature is enabled
 */
export function isFeatureEnabled(path: string): boolean {
  const keys = path.split('.');
  let value: any = PERFORMANCE_CONFIG;

  for (const key of keys) {
    value = value?.[key];
  }

  return typeof value === 'boolean' ? value : false;
}

/**
 * Get configuration value safely
 */
export function getConfig<T>(path: string, defaultValue: T): T {
  const keys = path.split('.');
  let value: any = PERFORMANCE_CONFIG;

  for (const key of keys) {
    value = value?.[key];
  }

  return value !== undefined ? value : defaultValue;
}

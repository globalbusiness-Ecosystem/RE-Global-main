import React, { useEffect, useRef, useCallback } from 'react';

/**
 * Cache for expensive computations
 */
const computationCache = new Map<string, { value: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Get cached value or compute if not available
 */
export function getCachedValue<T>(
  key: string,
  computeFn: () => T,
  ttl: number = CACHE_TTL
): T {
  const cached = computationCache.get(key);
  const now = Date.now();

  if (cached && now - cached.timestamp < ttl) {
    return cached.value;
  }

  const value = computeFn();
  computationCache.set(key, { value, timestamp: now });
  return value;
}

/**
 * Clear expired cache entries
 */
export function clearExpiredCache(): void {
  const now = Date.now();
  Array.from(computationCache.entries()).forEach(([key, { timestamp }]) => {
    if (now - timestamp > CACHE_TTL) {
      computationCache.delete(key);
    }
  });
}

/**
 * Debounce hook for expensive operations
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Throttle hook for frequent events
 */
export function useThrottle<T>(value: T, interval: number = 300): T {
  const [throttledValue, setThrottledValue] = React.useState<T>(value);
  const lastUpdatedRef = useRef<number>(Date.now());

  useEffect(() => {
    const now = Date.now();

    if (now >= lastUpdatedRef.current + interval) {
      lastUpdatedRef.current = now;
      setThrottledValue(value);
    } else {
      const timeoutId = setTimeout(() => {
        lastUpdatedRef.current = Date.now();
        setThrottledValue(value);
      }, interval);

      return () => clearTimeout(timeoutId);
    }
  }, [value, interval]);

  return throttledValue;
}

/**
 * Performance monitoring hook
 */
export function usePerformanceMonitor(componentName: string) {
  const mountTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    const mountTime = Date.now() - mountTimeRef.current;
    console.log(`[Performance] ${componentName} mounted in ${mountTime}ms`);

    return () => {
      console.log(`[Performance] ${componentName} unmounted`);
    };
  }, [componentName]);
}

/**
 * Virtualization support for long lists
 * Returns items in viewport range based on scroll position
 */
export function useVirtualization(
  items: any[],
  itemHeight: number,
  containerHeight: number,
  scrollTop: number
) {
  return React.useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - 1);
    const endIndex = Math.min(
      items.length,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + 1
    );

    return {
      items: items.slice(startIndex, endIndex),
      startIndex,
      offsetY: startIndex * itemHeight,
    };
  }, [items, itemHeight, containerHeight, scrollTop]);
}

/**
 * Request idle callback polyfill with timeout
 */
export function useIdleCallback(
  callback: () => void,
  timeout: number = 2000
) {
  const idRef = useRef<number | null>(null);

  useEffect(() => {
    if ('requestIdleCallback' in window) {
      idRef.current = requestIdleCallback(callback, { timeout });
    } else {
      idRef.current = window.setTimeout(callback, timeout) as any;
    }

    return () => {
      if (idRef.current !== null) {
        if ('cancelIdleCallback' in window) {
          cancelIdleCallback(idRef.current as number);
        } else {
          clearTimeout(idRef.current);
        }
      }
    };
  }, [callback, timeout]);
}

/**
 * Intersection Observer hook for lazy loading
 */
export function useIntersectionObserver(
  elementRef: React.RefObject<HTMLElement>,
  callback: (isVisible: boolean) => void,
  options: IntersectionObserverInit = {}
) {
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      callback(entry.isIntersecting);
    }, {
      threshold: 0.1,
      ...options,
    });

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
      observer.disconnect();
    };
  }, [callback, options]);
}

/**
 * Batch multiple state updates
 */
export function useBatchState<T>(initialState: T) {
  const [state, setState] = React.useState(initialState);
  const batchUpdatesRef = useRef<Partial<T>>({});
  const batchTimeoutRef = useRef<NodeJS.Timeout>();

  const batchUpdate = useCallback((updates: Partial<T>) => {
    Object.assign(batchUpdatesRef.current, updates);

    if (batchTimeoutRef.current) {
      clearTimeout(batchTimeoutRef.current);
    }

    batchTimeoutRef.current = setTimeout(() => {
      setState((prev) => ({ ...prev, ...batchUpdatesRef.current }));
      batchUpdatesRef.current = {};
    }, 16); // ~60fps
  }, []);

  return [state, batchUpdate] as const;
}

/**
 * Create debounced callback
 */
export function createDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 300
): T {
  let timeoutId: NodeJS.Timeout;

  return ((...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => callback(...args), delay);
  }) as T;
}

/**
 * Create throttled callback
 */
export function createThrottledCallback<T extends (...args: any[]) => any>(
  callback: T,
  interval: number = 300
): T {
  let lastCallTime = 0;

  return ((...args: any[]) => {
    const now = Date.now();
    if (now - lastCallTime >= interval) {
      lastCallTime = now;
      callback(...args);
    }
  }) as T;
}

/**
 * Component-level render optimization
 * Memoize expensive calculations and prevent unnecessary renders
 */
export function useRenderOptimization(dependencies: React.DependencyList) {
  const renderCountRef = useRef(0);

  useEffect(() => {
    renderCountRef.current++;
    if (process.env.NODE_ENV === 'development') {
      console.log('[Performance] Component render count:', renderCountRef.current);
    }
  }, dependencies);

  return renderCountRef.current;
}

/**
 * Memory usage monitoring hook
 */
export function useMemoryMonitor(threshold: number = 100) {
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!('memory' in performance)) return;

    intervalRef.current = setInterval(() => {
      const memory = (performance as any).memory;
      const usedMemory = memory.usedJSHeapSize / 1048576; // Convert to MB

      if (usedMemory > threshold) {
        console.warn(
          `[Memory] Heap size exceeded threshold: ${usedMemory.toFixed(2)}MB`
        );
      }
    }, 5000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [threshold]);
}

/**
 * Web Worker support for heavy computations
 */
export function useWebWorker(
  workerScript: string,
  callback: (data: any) => void
) {
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    try {
      const blob = new Blob([workerScript], { type: 'application/javascript' });
      const workerUrl = URL.createObjectURL(blob);
      workerRef.current = new Worker(workerUrl);

      workerRef.current.onmessage = (event) => {
        callback(event.data);
      };

      return () => {
        workerRef.current?.terminate();
        URL.revokeObjectURL(workerUrl);
      };
    } catch (error) {
      console.error('[Performance] Failed to create Web Worker:', error);
    }
  }, [callback, workerScript]);

  return workerRef.current;
}

/**
 * Font loading optimization
 */
export function useFontPreload(fontUrls: string[]) {
  useEffect(() => {
    fontUrls.forEach((url) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'font';
      link.type = 'font/woff2';
      link.crossOrigin = 'anonymous';
      link.href = url;
      document.head.appendChild(link);
    });
  }, [fontUrls]);
}

/**
 * Network Information API for adaptive loading
 */
export function useNetworkStatus() {
  const [networkStatus, setNetworkStatus] = React.useState({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    effectiveType: '4g' as 'slow-2g' | '2g' | '3g' | '4g',
    saveData: false,
  });

  useEffect(() => {
    const handleOnline = () => setNetworkStatus(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setNetworkStatus(prev => ({ ...prev, isOnline: false }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check Network Information API
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      setNetworkStatus(prev => ({
        ...prev,
        effectiveType: connection.effectiveType,
        saveData: connection.saveData,
      }));

      const handleChange = () => {
        setNetworkStatus(prev => ({
          ...prev,
          effectiveType: connection.effectiveType,
          saveData: connection.saveData,
        }));
      };

      connection.addEventListener('change', handleChange);
      return () => connection.removeEventListener('change', handleChange);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return networkStatus;
}

/**
 * Long task detection
 */
export function useLongTaskDetection(threshold: number = 50) {
  useEffect(() => {
    if (!('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (entry.duration > threshold) {
            console.warn(`[Performance] Long task detected: ${entry.duration}ms`);
          }
        });
      });

      observer.observe({ entryTypes: ['longtask'] });
      return () => observer.disconnect();
    } catch (error) {
      console.error('[Performance] Long task detection not supported:', error);
    }
  }, [threshold]);
}

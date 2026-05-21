/**
 * QR Payment Performance Optimization Utilities
 * Handles caching, memoization, and performance monitoring
 */

// Cache for product lookups to avoid repeated searches
const productCache = new Map<string, any>();

// Debounce utility for purchase operations
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

// Throttle utility for rapid payment button clicks
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Cache product data to avoid redundant lookups
export function getCachedProduct(productId: string, products: any[]): any {
  if (productCache.has(productId)) {
    return productCache.get(productId);
  }

  const product = products.find((p) => p.id === productId);
  if (product) {
    productCache.set(productId, product);
  }
  return product;
}

// Clear product cache (call when products list updates)
export function clearProductCache(): void {
  productCache.clear();
}

// Memoization helper for expensive calculations
export function memoize<T extends (...args: any[]) => any>(func: T): T {
  const cache = new Map();
  return ((...args: any[]) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = func(...args);
    cache.set(key, result);
    return result;
  }) as T;
}

// Performance monitoring for payment operations
export class PaymentPerformanceMonitor {
  private metrics: Record<string, number[]> = {};

  recordMetric(name: string, value: number): void {
    if (!this.metrics[name]) {
      this.metrics[name] = [];
    }
    this.metrics[name].push(value);
  }

  getAverageMetric(name: string): number {
    const values = this.metrics[name];
    if (!values || values.length === 0) return 0;
    return values.reduce((a, b) => a + b, 0) / values.length;
  }

  getMetricStats(name: string) {
    const values = this.metrics[name] || [];
    return {
      count: values.length,
      average: this.getAverageMetric(name),
      min: Math.min(...values),
      max: Math.max(...values),
    };
  }

  clearMetrics(): void {
    this.metrics = {};
  }
}

// Singleton instance for payment monitoring
export const paymentMonitor = new PaymentPerformanceMonitor();

// Batch payment operations to reduce re-renders
export class PaymentBatcher {
  private queue: Array<() => Promise<void>> = [];
  private processing = false;

  async add(operation: () => Promise<void>): Promise<void> {
    return new Promise((resolve) => {
      this.queue.push(async () => {
        await operation();
        resolve();
      });
      this.process();
    });
  }

  private async process(): Promise<void> {
    if (this.processing || this.queue.length === 0) return;

    this.processing = true;
    const startTime = performance.now();

    try {
      while (this.queue.length > 0) {
        const operation = this.queue.shift();
        if (operation) {
          await operation();
        }
      }
    } finally {
      const endTime = performance.now();
      paymentMonitor.recordMetric('batch_operation_time', endTime - startTime);
      this.processing = false;
    }
  }
}

export const paymentBatcher = new PaymentBatcher();

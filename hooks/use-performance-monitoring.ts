import { useEffect } from 'react';

/**
 * Performance monitoring hook
 * Tracks key performance metrics and reports them
 */
export function usePerformanceMonitoring(componentName: string) {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Measure component render time
    const startTime = performance.now();

    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;

      // Log significant delays (>100ms)
      if (duration > 100) {
        console.warn(
          `[Performance] ${componentName} took ${duration.toFixed(2)}ms to render`
        );
      }
    };
  }, [componentName]);

  // Monitor Core Web Vitals
  useEffect(() => {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      return;
    }

    try {
      // Largest Contentful Paint (LCP)
      const lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        console.info(`[LCP] ${lastEntry.renderTime || lastEntry.loadTime}`);
      });

      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // Cumulative Layout Shift (CLS)
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
            console.info(`[CLS] ${clsValue}`);
          }
        }
      });

      clsObserver.observe({ entryTypes: ['layout-shift'] });

      // First Input Delay (FID) / Interaction to Next Paint (INP)
      const fidObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach((entry) => {
          console.info(`[INP] ${(entry as any).processingDuration}`);
        });
      });

      fidObserver.observe({
        entryTypes: ['first-input', 'interaction'],
      });

      return () => {
        lcpObserver.disconnect();
        clsObserver.disconnect();
        fidObserver.disconnect();
      };
    } catch (e) {
      console.debug('Performance monitoring not available');
    }
  }, []);
}

/**
 * Memory monitoring hook (development only)
 */
export function useMemoryMonitoring() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development' || typeof window === 'undefined') {
      return;
    }

    const interval = setInterval(() => {
      if ((performance as any).memory) {
        const mem = (performance as any).memory;
        const usedMB = (mem.usedJSHeapSize / 1048576).toFixed(2);
        const limitMB = (mem.jsHeapSizeLimit / 1048576).toFixed(2);
        console.debug(
          `[Memory] ${usedMB}MB / ${limitMB}MB (${(
            (mem.usedJSHeapSize / mem.jsHeapSizeLimit) *
            100
          ).toFixed(1)}%)`
        );
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);
}

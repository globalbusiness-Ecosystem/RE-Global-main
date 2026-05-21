'use client';

import { useCallback, useRef, useEffect } from 'react';

/**
 * Request deduplication to prevent duplicate API calls
 */
type RequestKey = string;
type RequestResult<T> = Promise<T>;

interface PendingRequest<T> {
  promise: RequestResult<T>;
  timestamp: number;
}

class RequestDeduplicator {
  private pendingRequests = new Map<RequestKey, PendingRequest<any>>();
  private completedRequests = new Map<RequestKey, { result: any; timestamp: number }>();
  private cacheExpiry = 5 * 60 * 1000; // 5 minutes

  async deduplicateRequest<T>(
    key: RequestKey,
    requestFn: () => Promise<T>
  ): Promise<T> {
    const now = Date.now();

    // Check if we have a cached result
    const cached = this.completedRequests.get(key);
    if (cached && now - cached.timestamp < this.cacheExpiry) {
      return cached.result;
    }

    // Check if there's an in-flight request
    const pending = this.pendingRequests.get(key);
    if (pending) {
      return pending.promise;
    }

    // Create new request
    const promise = requestFn()
      .then((result) => {
        this.completedRequests.set(key, { result, timestamp: now });
        this.pendingRequests.delete(key);
        return result;
      })
      .catch((error) => {
        this.pendingRequests.delete(key);
        throw error;
      });

    this.pendingRequests.set(key, { promise, timestamp: now });
    return promise;
  }

  clearCache(key?: RequestKey): void {
    if (key) {
      this.completedRequests.delete(key);
    } else {
      this.completedRequests.clear();
    }
  }
}

const globalDeduplicator = new RequestDeduplicator();

export function useDeduplicatedRequest<T>(
  key: string,
  requestFn: () => Promise<T>,
  dependencies: React.DependencyList = []
) {
  const resultRef = useRef<T | null>(null);
  const errorRef = useRef<Error | null>(null);
  const loadingRef = useRef(false);

  const execute = useCallback(
    async () => {
      loadingRef.current = true;
      errorRef.current = null;

      try {
        const result = await globalDeduplicator.deduplicateRequest(key, requestFn);
        resultRef.current = result;
        loadingRef.current = false;
        return result;
      } catch (error) {
        errorRef.current = error instanceof Error ? error : new Error(String(error));
        loadingRef.current = false;
        throw error;
      }
    },
    [key, requestFn]
  );

  return {
    execute,
    result: resultRef.current,
    error: errorRef.current,
    loading: loadingRef.current,
  };
}

export function clearDeduplicatedRequestCache(key?: string): void {
  globalDeduplicator.clearCache(key);
}

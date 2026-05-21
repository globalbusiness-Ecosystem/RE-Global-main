import { useEffect, useRef, useState, useCallback } from 'react';

interface UseSWROptions<T> {
  revalidateOnFocus?: boolean;
  revalidateOnReconnect?: boolean;
  refreshInterval?: number;
  dedupingInterval?: number;
  focusThrottleInterval?: number;
  errorRetryCount?: number;
  errorRetryInterval?: number;
}

interface UseSWRReturn<T> {
  data: T | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  mutate: (data?: T | Promise<T>) => Promise<T | undefined>;
}

/**
 * Simple SWR (stale-while-revalidate) hook for data fetching
 */
export function useSWR<T = any>(
  key: string | null,
  fetcher: (key: string) => Promise<T>,
  options: UseSWROptions<T> = {}
): UseSWRReturn<T> {
  const {
    revalidateOnFocus = true,
    revalidateOnReconnect = true,
    refreshInterval = 0,
    dedupingInterval = 2000,
    focusThrottleInterval = 5000,
    errorRetryCount = 5,
    errorRetryInterval = 5000,
  } = options;

  const [data, setData] = useState<T | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const dataRef = useRef<T | undefined>(data);
  const lastFetchRef = useRef<number>(0);
  const retryCountRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const mutate = useCallback(
    async (newData?: T | Promise<T>) => {
      if (newData) {
        if (newData instanceof Promise) {
          setIsLoading(true);
          try {
            const resolvedData = await newData;
            setData(resolvedData);
            dataRef.current = resolvedData;
            setError(null);
            setIsError(false);
            return resolvedData;
          } catch (e) {
            const err = e instanceof Error ? e : new Error(String(e));
            setError(err);
            setIsError(true);
            return undefined;
          } finally {
            setIsLoading(false);
          }
        } else {
          setData(newData);
          dataRef.current = newData;
          setError(null);
          setIsError(false);
          return newData;
        }
      }
      return dataRef.current;
    },
    []
  );

  const fetch = useCallback(async () => {
    if (!key) return;

    const now = Date.now();
    if (now - lastFetchRef.current < dedupingInterval) {
      return;
    }

    lastFetchRef.current = now;
    setIsLoading(true);

    try {
      const result = await fetcher(key);
      setData(result);
      dataRef.current = result;
      setError(null);
      setIsError(false);
      retryCountRef.current = 0;
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e));
      setError(err);
      setIsError(true);

      if (retryCountRef.current < errorRetryCount) {
        retryCountRef.current++;
        timeoutRef.current = setTimeout(
          fetch,
          errorRetryInterval * Math.pow(2, retryCountRef.current - 1)
        );
      }
    } finally {
      setIsLoading(false);
    }
  }, [key, fetcher, dedupingInterval, errorRetryCount, errorRetryInterval]);

  // Initial fetch
  useEffect(() => {
    fetch();
  }, [key]);

  // Revalidation on focus
  useEffect(() => {
    if (!revalidateOnFocus) return;

    let lastFocusTime = Date.now();
    const handleFocus = () => {
      const now = Date.now();
      if (now - lastFocusTime > focusThrottleInterval) {
        lastFocusTime = now;
        fetch();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [fetch, revalidateOnFocus, focusThrottleInterval]);

  // Revalidation on reconnect
  useEffect(() => {
    if (!revalidateOnReconnect) return;

    const handleOnline = () => fetch();
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [fetch, revalidateOnReconnect]);

  // Refresh interval
  useEffect(() => {
    if (!refreshInterval || refreshInterval <= 0) return;

    const interval = setInterval(fetch, refreshInterval);
    return () => clearInterval(interval);
  }, [fetch, refreshInterval]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    data,
    isLoading,
    isError,
    error,
    mutate,
  };
}

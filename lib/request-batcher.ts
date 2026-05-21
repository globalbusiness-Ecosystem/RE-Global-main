'use client';

/**
 * Request batching to reduce number of API calls
 */

interface BatchedRequest<T> {
  id: string;
  data: T;
  timestamp: number;
}

class RequestBatcher<T, R> {
  private queue: BatchedRequest<T>[] = [];
  private flushTimeout: NodeJS.Timeout | null = null;
  private flushDelay: number;
  private batchSize: number;
  private processBatchFn: (batch: T[]) => Promise<R[]>;

  constructor(
    processBatchFn: (batch: T[]) => Promise<R[]>,
    flushDelay: number = 50,
    batchSize: number = 10
  ) {
    this.processBatchFn = processBatchFn;
    this.flushDelay = flushDelay;
    this.batchSize = batchSize;
  }

  add(id: string, data: T): Promise<R> {
    return new Promise((resolve, reject) => {
      this.queue.push({
        id,
        data,
        timestamp: Date.now(),
      });

      // Auto-flush if batch is full
      if (this.queue.length >= this.batchSize) {
        this.flush().catch(reject);
      } else if (!this.flushTimeout) {
        this.flushTimeout = setTimeout(() => this.flush(), this.flushDelay);
      }

      // Resolve with placeholder (will be updated on flush)
      resolve({} as R);
    });
  }

  async flush(): Promise<void> {
    if (this.flushTimeout) {
      clearTimeout(this.flushTimeout);
      this.flushTimeout = null;
    }

    if (this.queue.length === 0) return;

    const batch = this.queue.splice(0, this.batchSize);
    const batchData = batch.map(r => r.data);

    try {
      await this.processBatchFn(batchData);
    } catch (error) {
      console.error('[Batching] Batch processing failed:', error);
      // Re-queue failed items
      this.queue.unshift(...batch);
    }
  }

  clear(): void {
    this.queue = [];
    if (this.flushTimeout) {
      clearTimeout(this.flushTimeout);
      this.flushTimeout = null;
    }
  }
}

export { RequestBatcher };

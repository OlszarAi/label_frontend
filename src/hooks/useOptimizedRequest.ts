import { useState, useCallback, useRef, useEffect } from 'react';

interface RequestState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  lastFetch: number;
}

interface CacheOptions {
  ttl: number; // Time to live in milliseconds
  maxSize: number; // Maximum cache size
  enableDeduplication: boolean; // Prevent duplicate requests
}

/**
 * Advanced request cache with deduplication and TTL
 */
export class RequestCache {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public cache = new Map<string, RequestState<any>>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private pendingRequests = new Map<string, Promise<any>>();
  private options: CacheOptions;

  constructor(options: Partial<CacheOptions> = {}) {
    this.options = {
      ttl: 5 * 60 * 1000, // 5 minutes default
      maxSize: 100,
      enableDeduplication: true,
      ...options
    };
  }

  /**
   * Get cached data if valid, otherwise make request
   */
  async get<T>(
    key: string, 
    requestFn: () => Promise<T>,
    customTTL?: number
  ): Promise<T> {
    const now = Date.now();
    const ttl = customTTL || this.options.ttl;

    // Check if we have valid cached data
    const cached = this.cache.get(key);
    if (cached && (now - cached.lastFetch) < ttl && cached.data !== null && !cached.error) {
      return cached.data;
    }

    // Prevent duplicate requests
    if (this.options.enableDeduplication && this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key)!;
    }

    // Set loading state
    this.cache.set(key, {
      data: cached?.data || null,
      loading: true,
      error: null,
      lastFetch: now
    });

    // Create request promise
    const requestPromise = this.executeRequest(key, requestFn, now);
    
    if (this.options.enableDeduplication) {
      this.pendingRequests.set(key, requestPromise);
    }

    try {
      const result = await requestPromise;
      this.cleanup();
      return result;
    } finally {
      this.pendingRequests.delete(key);
    }
  }

  private async executeRequest<T>(
    key: string,
    requestFn: () => Promise<T>,
    timestamp: number
  ): Promise<T> {
    try {
      const data = await requestFn();
      
      this.cache.set(key, {
        data,
        loading: false,
        error: null,
        lastFetch: timestamp
      });

      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Don't cache authentication errors to prevent retry loops
      if (errorMessage === 'AUTHENTICATION_REQUIRED') {
        this.cache.set(key, {
          data: null,
          loading: false,
          error: errorMessage,
          lastFetch: 0 // Force immediate retry when auth is available
        });
      } else {
        this.cache.set(key, {
          data: null,
          loading: false,
          error: errorMessage,
          lastFetch: timestamp
        });
      }

      throw error;
    }
  }

  /**
   * Get current state (data, loading, error) for a key
   */
  getState<T>(key: string): RequestState<T> | null {
    return this.cache.get(key) || null;
  }

  /**
   * Invalidate specific cache entry
   */
  invalidate(key: string): void {
    this.cache.delete(key);
    this.pendingRequests.delete(key);
  }

  /**
   * Invalidate entries matching pattern
   */
  invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.invalidate(key);
      }
    }
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
    this.pendingRequests.clear();
  }

  /**
   * Clean up old entries
   */
  private cleanup(): void {
    if (this.cache.size <= this.options.maxSize) return;

    const now = Date.now();
    const entriesToDelete: string[] = [];

    // Remove expired entries first
    for (const [key, state] of this.cache.entries()) {
      if (now - state.lastFetch > this.options.ttl) {
        entriesToDelete.push(key);
      }
    }

    // If still too many, remove oldest
    if (this.cache.size - entriesToDelete.length > this.options.maxSize) {
      const sortedEntries = Array.from(this.cache.entries())
        .sort(([, a], [, b]) => a.lastFetch - b.lastFetch);
      
      const excess = this.cache.size - entriesToDelete.length - this.options.maxSize;
      for (let i = 0; i < excess; i++) {
        entriesToDelete.push(sortedEntries[i][0]);
      }
    }

    entriesToDelete.forEach(key => this.cache.delete(key));
  }
}

// Global cache instances
export const projectCache = new RequestCache({
  ttl: 3 * 60 * 1000, // 3 minutes for projects
  maxSize: 50
});

export const labelCache = new RequestCache({
  ttl: 2 * 60 * 1000, // 2 minutes for labels  
  maxSize: 200
});

export const thumbnailCache = new RequestCache({
  ttl: 10 * 60 * 1000, // 10 minutes for thumbnails
  maxSize: 500
});

/**
 * Hook for optimized data fetching with caching
 */
export function useOptimizedRequest<T>(
  key: string,
  requestFn: () => Promise<T>,
  cache: RequestCache = projectCache,
  options: {
    enabled?: boolean;
    ttl?: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dependencies?: any[];
  } = {}
) {
  const { enabled = true, ttl } = options;
  
  const [state, setState] = useState<RequestState<T>>(() => {
    return cache.getState<T>(key) || {
      data: null,
      loading: false,
      error: null,
      lastFetch: 0
    };
  });

  const currentRequestRef = useRef<Promise<T> | null>(null);
  const executeRef = useRef<((force?: boolean) => Promise<void>) | null>(null);

  const execute = useCallback(async (force = false) => {
    if (!enabled) {
      return;
    }

    if (force) {
      cache.invalidate(key);
    }

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const promise = cache.get(key, requestFn, ttl);
      currentRequestRef.current = promise;
      
      const data = await promise;
      
      // Only update state if this is still the current request
      if (currentRequestRef.current === promise) {
        setState({
          data,
          loading: false,
          error: null,
          lastFetch: Date.now()
        });
      }
    } catch (error) {
      // Only update state if this is still the current request
      if (currentRequestRef.current !== null) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }));
      }
    }
  }, [key, requestFn, cache, ttl, enabled]);

  // Update executeRef whenever execute changes
  executeRef.current = execute;

  const refresh = useCallback(() => executeRef.current?.(true), []);

  // Auto-execute when enabled or key changes
  useEffect(() => {
    if (enabled && executeRef.current) {
      executeRef.current();
    }
    
    return () => {
      currentRequestRef.current = null;
    };
  }, [enabled, key]); // Remove execute from dependencies to prevent infinite loop

  return {
    ...state,
    execute: refresh,
    refresh
  };
}

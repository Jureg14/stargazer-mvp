import { encodeGeohash } from './geohash';

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

class CacheEngine {
  private cache = new Map<string, CacheEntry<unknown>>();
  private maxEntries = 500;
  private hits = 0;
  private misses = 0;

  /**
   * Generates a standardized cache key based on Geohash (precision 4), target date, and optional parameters.
   */
  public generateKey(prefix: string, lat: number, lon: number, date: string, extra?: string): string {
    const geohash = encodeGeohash(lat, lon, 4);
    return `${prefix}:${geohash}:${date}${extra ? `:${extra}` : ''}`;
  }

  /**
   * Retrieves an item from the cache if present and not expired.
   */
  public get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) {
      this.misses++;
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.misses++;
      return null;
    }

    this.hits++;
    return entry.value as T;
  }

  /**
   * Stores an item in the cache with specified TTL in milliseconds (default 1 hour).
   */
  public set<T>(key: string, value: T, ttlMs = 3600_000): void {
    if (this.cache.size >= this.maxEntries) {
      // Evict oldest entry
      const firstKey = this.cache.keys().next().value;
      if (firstKey) this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttlMs,
    });
  }

  /**
   * Returns cache statistics.
   */
  public getStats() {
    return {
      size: this.cache.size,
      hits: this.hits,
      misses: this.misses,
      hitRatio: this.hits + this.misses > 0 ? (this.hits / (this.hits + this.misses)).toFixed(2) : '0.00',
    };
  }

  /**
   * Clears all cached items.
   */
  public clear(): void {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }
}

export const cacheEngine = new CacheEngine();

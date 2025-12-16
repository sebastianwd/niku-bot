import { LRUCache } from 'lru-cache'

export class Cache<K extends {} = string, V extends {} = string> {
  private cache: LRUCache<K, V>
  constructor(options?: LRUCache.Options<K, V, unknown>) {
    this.cache = new LRUCache({
      max: 50,
      ttl: 1000 * 60 * 60 * 24,
      ...options,
    })
  }

  get(key: K) {
    const value = this.cache.get(key)

    return value
  }

  set(key: K, value: V) {
    this.cache.set(key, value)
  }

  has(key: K) {
    return this.cache.has(key)
  }
}

/**
 * Default cache instance with 24 hours TTL
 */
export const cache = new Cache()

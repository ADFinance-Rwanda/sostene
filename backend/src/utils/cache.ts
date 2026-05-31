import { redis } from '../config/redis'

// If Redis is down, both functions quietly fall back: callers still get fresh
// data from the underlying function, and the API stays online. The cache is a
// performance enhancement.

export async function cached<T>(key: string, ttlSeconds: number, fn: () => Promise<T>): Promise<T> {
  if (redis?.isReady) {
    try {
      const hit = await redis.get(key)
      if (hit !== null) {
        console.log(`[cache] HIT  ${key}`)
        return JSON.parse(hit) as T
      }
    } catch (err) {
      console.warn(`[cache] read failed for ${key}:`, err)
    }
  }

  const fresh = await fn()

  if (redis?.isReady) {
    try {
      await redis.set(key, JSON.stringify(fresh), { EX: ttlSeconds })
      console.log(`[cache] MISS ${key} (stored, ttl=${ttlSeconds}s)`)
    } catch (err) {
      console.warn(`[cache] write failed for ${key}:`, err)
    }
  }

  return fresh
}

export async function invalidatePattern(pattern: string): Promise<void> {
  if (!redis?.isReady) return
  try {
    const keys: string[] = []
    // redis@5 scanIterator yields batches (string[]), not single keys.
    for await (const batch of redis.scanIterator({ MATCH: pattern, COUNT: 100 })) {
      for (const key of batch) keys.push(key as unknown as string)
    }
    if (keys.length > 0) {
      await redis.del(keys)
      console.log(`[cache] invalidated ${keys.length} key(s) matching ${pattern}`)
    }
  } catch (err) {
    console.warn(`[cache] invalidation failed for ${pattern}:`, err)
  }
}

// Helpers to build cache keys consistently across services.
export function analyticsKey(kind: 'summary' | 'status' | 'timeline', ownerId: string, suffix: string | number = ''): string {
  return suffix === '' ? `analytics:${kind}:${ownerId}` : `analytics:${kind}:${ownerId}:${suffix}`
}

export function analyticsPatternForOwner(ownerId: string): string {
  return `analytics:*:${ownerId}*`
}

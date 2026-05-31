import { createClient, RedisClientType } from 'redis'

import { REDIS_HOST, REDIS_PASSWORD, REDIS_PORT, REDIS_URL } from './constants'

function redisUrl(): string | null {
  if (REDIS_URL) return REDIS_URL
  if (!REDIS_HOST) return null
  const auth = REDIS_PASSWORD ? `:${encodeURIComponent(REDIS_PASSWORD)}@` : ''
  return `redis://${auth}${REDIS_HOST}:${REDIS_PORT}`
}

const url = redisUrl()

export const redis: RedisClientType | null = url ? createClient({ url }) : null

// Don't crash the API on a Redis hiccup — the cache layer falls back to direct
// DB queries when Redis is unavailable.
redis?.on('error', (err) => console.warn('[redis] error:', err.message))

export async function connectRedis(): Promise<void> {
  if (!redis) {
    console.warn('[redis] not configured; cache disabled')
    return
  }
  try {
    await redis.connect()
    console.log('[redis] connected')
  } catch (err) {
    console.warn('[redis] connect failed; cache disabled until reconnect:', err)
  }
}

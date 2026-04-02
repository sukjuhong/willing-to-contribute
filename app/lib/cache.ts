import { Redis } from '@upstash/redis';

// Lazy-initialized Redis client; null when env vars are missing
let redis: Redis | null = null;

function getRedis(): Redis | null {
  if (redis) return redis;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  try {
    redis = new Redis({ url, token });
    return redis;
  } catch (err) {
    console.warn('[cache] Failed to initialize Redis client:', err);
    return null;
  }
}

// In-memory fallback when Redis is unavailable
interface MemEntry<T> {
  value: T;
  expiresAt: number;
}
const memCache = new Map<string, MemEntry<unknown>>();
const MAX_CACHE_ENTRIES = 100;

export async function cacheGet<T>(key: string): Promise<T | null> {
  const client = getRedis();
  if (client) {
    try {
      const value = await client.get<T>(key);
      return value ?? null;
    } catch (err) {
      console.warn('[cache] Redis GET failed, falling back to memory:', err);
    }
  }
  const entry = memCache.get(key) as MemEntry<T> | undefined;
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    memCache.delete(key);
    return null;
  }
  return entry.value;
}

export async function cacheSet<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
  const client = getRedis();
  if (client) {
    try {
      await client.set(key, value, { ex: ttlSeconds });
      return;
    } catch (err) {
      console.warn('[cache] Redis SET failed, falling back to memory:', err);
    }
  }
  if (memCache.size >= MAX_CACHE_ENTRIES) {
    const oldestKey = memCache.keys().next().value;
    if (oldestKey) memCache.delete(oldestKey);
  }
  memCache.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
}

export async function cacheDelete(key: string): Promise<void> {
  const client = getRedis();
  if (client) {
    try {
      await client.del(key);
      return;
    } catch (err) {
      console.warn('[cache] Redis DEL failed, falling back to memory:', err);
    }
  }
  memCache.delete(key);
}

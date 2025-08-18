// Simple in-memory + localStorage cache with TTL
const memoryCache = new Map()
const LS_PREFIX = 'by_cache__'

const nowMs = () => Date.now()

export function getCachedValue(key) {
  const entry = memoryCache.get(key)
  if (entry && entry.expiresAt > nowMs()) return entry.value

  try {
    if (typeof window !== 'undefined') {
      const raw = window.localStorage.getItem(LS_PREFIX + key)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed && parsed.expiresAt > nowMs()) {
          memoryCache.set(key, parsed)
          return parsed.value
        } else {
          window.localStorage.removeItem(LS_PREFIX + key)
        }
      }
    }
  } catch (_) {}
  return undefined
}

export function setCachedValue(key, value, ttlMs) {
  const expiresAt = nowMs() + Math.max(0, ttlMs || 0)
  const entry = { value, expiresAt }
  memoryCache.set(key, entry)
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(LS_PREFIX + key, JSON.stringify(entry))
    }
  } catch (_) {}
}

export async function getOrFetch(key, ttlMs, fetcher) {
  const cached = getCachedValue(key)
  if (cached !== undefined) return cached
  const value = await fetcher()
  setCachedValue(key, value, ttlMs)
  return value
}

export function invalidateCache(key) {
  memoryCache.delete(key)
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(LS_PREFIX + key)
    }
  } catch (_) {}
}

export function invalidateByPrefix(prefix) {
  // Clear memory
  for (const key of memoryCache.keys()) {
    if (String(key).startsWith(prefix)) memoryCache.delete(key)
  }
  // Clear localStorage
  try {
    if (typeof window !== 'undefined') {
      const toDelete = []
      for (let i = 0; i < window.localStorage.length; i++) {
        const k = window.localStorage.key(i)
        if (k && k.startsWith(LS_PREFIX + prefix)) toDelete.push(k)
      }
      toDelete.forEach(k => window.localStorage.removeItem(k))
    }
  } catch (_) {}
}



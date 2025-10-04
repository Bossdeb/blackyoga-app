// Advanced caching system with memory + localStorage + IndexedDB
const memoryCache = new Map()
const LS_PREFIX = 'by_cache__'
const IDB_NAME = 'blackyoga_cache'
const IDB_VERSION = 1

// Cache configuration
const CACHE_CONFIG = {
  // Different TTL for different data types
  USER_DATA: 5 * 60 * 1000, // 5 minutes
  CLASSES_DATA: 2 * 60 * 1000, // 2 minutes
  BOOKINGS_DATA: 1 * 60 * 1000, // 1 minute
  ADMIN_DATA: 30 * 1000, // 30 seconds
  STATIC_DATA: 24 * 60 * 60 * 1000, // 24 hours
  DEFAULT: 5 * 60 * 1000 // 5 minutes
}

let idb = null

// Initialize IndexedDB
const initIndexedDB = () => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      resolve(null)
      return
    }

    const request = indexedDB.open(IDB_NAME, IDB_VERSION)
    
    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      idb = request.result
      resolve(idb)
    }
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result
      if (!db.objectStoreNames.contains('cache')) {
        const store = db.createObjectStore('cache', { keyPath: 'key' })
        store.createIndex('expiresAt', 'expiresAt', { unique: false })
      }
    }
  })
}

// Initialize IndexedDB on module load
initIndexedDB().catch(console.error)

const nowMs = () => Date.now()

// Enhanced cache with IndexedDB support
export function getCachedValue(key) {
  // Check memory cache first (fastest)
  const memoryEntry = memoryCache.get(key)
  if (memoryEntry && memoryEntry.expiresAt > nowMs()) {
    return memoryEntry.value
  }

  // Check localStorage (fast)
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

  // Check IndexedDB (slower but more storage)
  if (idb) {
    return new Promise((resolve) => {
      const transaction = idb.transaction(['cache'], 'readonly')
      const store = transaction.objectStore('cache')
      const request = store.get(key)
      
      request.onsuccess = () => {
        const result = request.result
        if (result && result.expiresAt > nowMs()) {
          // Update memory cache
          memoryCache.set(key, result)
          resolve(result.value)
        } else {
          resolve(undefined)
        }
      }
      
      request.onerror = () => resolve(undefined)
    })
  }

  return undefined
}

export function setCachedValue(key, value, ttlMs) {
  const expiresAt = nowMs() + Math.max(0, ttlMs || CACHE_CONFIG.DEFAULT)
  const entry = { key, value, expiresAt }
  
  // Update memory cache
  memoryCache.set(key, entry)
  
  // Update localStorage
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(LS_PREFIX + key, JSON.stringify(entry))
    }
  } catch (_) {}
  
  // Update IndexedDB
  if (idb) {
    const transaction = idb.transaction(['cache'], 'readwrite')
    const store = transaction.objectStore('cache')
    store.put(entry)
  }
}

export async function getOrFetch(key, ttlMs, fetcher) {
  const cached = await getCachedValue(key)
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
  
  if (idb) {
    const transaction = idb.transaction(['cache'], 'readwrite')
    const store = transaction.objectStore('cache')
    store.delete(key)
  }
}

export function invalidateByPrefix(prefix) {
  // Clear memory cache
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
  
  // Clear IndexedDB
  if (idb) {
    const transaction = idb.transaction(['cache'], 'readwrite')
    const store = transaction.objectStore('cache')
    const request = store.openCursor()
    
    request.onsuccess = (event) => {
      const cursor = event.target.result
      if (cursor) {
        if (String(cursor.key).startsWith(prefix)) {
          cursor.delete()
        }
        cursor.continue()
      }
    }
  }
}

// Smart cache with automatic TTL based on data type
export function smartCache(key, fetcher, dataType = 'DEFAULT') {
  const ttl = CACHE_CONFIG[dataType] || CACHE_CONFIG.DEFAULT
  return getOrFetch(key, ttl, fetcher)
}

// Cache warming - preload important data
export async function warmCache() {
  try {
    // Preload user data if available
    const cachedUser = typeof window !== 'undefined' ? window.localStorage.getItem('by_user') : null
    if (cachedUser) {
      const userData = JSON.parse(cachedUser)
      setCachedValue(`user_${userData.lineId}`, userData, CACHE_CONFIG.USER_DATA)
    }
  } catch (_) {}
}

// Cleanup expired cache entries
export function cleanupExpiredCache() {
  const now = nowMs()
  
  // Clean memory cache
  for (const [key, entry] of memoryCache.entries()) {
    if (entry.expiresAt <= now) {
      memoryCache.delete(key)
    }
  }
  
  // Clean localStorage
  try {
    if (typeof window !== 'undefined') {
      const toDelete = []
      for (let i = 0; i < window.localStorage.length; i++) {
        const k = window.localStorage.key(i)
        if (k && k.startsWith(LS_PREFIX)) {
          try {
            const raw = window.localStorage.getItem(k)
            const parsed = JSON.parse(raw)
            if (parsed && parsed.expiresAt <= now) {
              toDelete.push(k)
            }
          } catch (_) {
            toDelete.push(k) // Delete corrupted entries
          }
        }
      }
      toDelete.forEach(k => window.localStorage.removeItem(k))
    }
  } catch (_) {}
  
  // Clean IndexedDB
  if (idb) {
    const transaction = idb.transaction(['cache'], 'readwrite')
    const store = transaction.objectStore('cache')
    const index = store.index('expiresAt')
    const range = IDBKeyRange.upperBound(now)
    const request = index.openCursor(range)
    
    request.onsuccess = (event) => {
      const cursor = event.target.result
      if (cursor) {
        cursor.delete()
        cursor.continue()
      }
    }
  }
}

// Auto cleanup every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(cleanupExpiredCache, 5 * 60 * 1000)
}

// Export cache configuration for use in other modules
export { CACHE_CONFIG }



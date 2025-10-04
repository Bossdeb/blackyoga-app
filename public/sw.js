// Service Worker for Black Yoga App
const CACHE_NAME = 'blackyoga-v1'
const STATIC_CACHE_NAME = 'blackyoga-static-v1'
const DYNAMIC_CACHE_NAME = 'blackyoga-dynamic-v1'

// Files to cache immediately
const STATIC_FILES = [
  '/',
  '/index.html',
  '/src/main.js',
  '/src/style.css',
  '/src/App.vue',
  '/src/router.js',
  '/src/lib/firebase.js',
  '/src/config/liff.js',
  '/src/composables/useFirebase.js',
  '/src/composables/useCache.js',
  '/src/composables/useLoading.js',
  '/src/composables/useAppState.js',
  '/src/composables/usePerformance.js',
  '/src/components/BottomNav.vue',
  '/src/components/LoadingSkeleton.vue',
  '/src/components/ErrorBoundary.vue',
  '/src/components/OptimizedImage.vue'
]

// Install event - cache static files
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...')
  
  event.waitUntil(
    Promise.all([
      // Cache static files
      caches.open(STATIC_CACHE_NAME).then((cache) => {
        console.log('Service Worker: Caching static files')
        return cache.addAll(STATIC_FILES)
      }),
      // Skip waiting to activate immediately
      self.skipWaiting()
    ])
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...')
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && 
                cacheName !== DYNAMIC_CACHE_NAME &&
                cacheName.startsWith('blackyoga-')) {
              console.log('Service Worker: Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      }),
      // Take control of all clients
      self.clients.claim()
    ])
  )
})

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }
  
  // Skip Chrome extension requests
  if (url.protocol === 'chrome-extension:') {
    return
  }
  
  // Skip Firebase requests (they handle their own caching)
  if (url.hostname.includes('firebase') || 
      url.hostname.includes('googleapis.com')) {
    return
  }
  
  // Handle different types of requests
  if (url.pathname.startsWith('/src/') || 
      url.pathname.endsWith('.js') || 
      url.pathname.endsWith('.css') ||
      url.pathname.endsWith('.vue')) {
    // Static assets - Cache First strategy
    event.respondWith(cacheFirst(request, STATIC_CACHE_NAME))
  } else if (url.pathname === '/' || url.pathname.endsWith('.html')) {
    // HTML pages - Network First strategy
    event.respondWith(networkFirst(request, DYNAMIC_CACHE_NAME))
  } else {
    // Other requests - Stale While Revalidate strategy
    event.respondWith(staleWhileRevalidate(request, DYNAMIC_CACHE_NAME))
  }
})

// Cache First Strategy - for static assets
async function cacheFirst(request, cacheName) {
  try {
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.log('Cache First failed:', error)
    return new Response('Offline', { status: 503 })
  }
}

// Network First Strategy - for HTML pages
async function networkFirst(request, cacheName) {
  try {
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName)
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch (error) {
    console.log('Network First failed, trying cache:', error)
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    
    // Return offline page if available
    const offlineResponse = await caches.match('/offline.html')
    if (offlineResponse) {
      return offlineResponse
    }
    
    return new Response('Offline', { status: 503 })
  }
}

// Stale While Revalidate Strategy - for API calls
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName)
  const cachedResponse = await cache.match(request)
  
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  }).catch(() => {
    // Return cached response if network fails
    return cachedResponse
  })
  
  return cachedResponse || fetchPromise
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync())
  }
})

async function doBackgroundSync() {
  try {
    // Get pending actions from IndexedDB
    const pendingActions = await getPendingActions()
    
    for (const action of pendingActions) {
      try {
        await processPendingAction(action)
        await removePendingAction(action.id)
      } catch (error) {
        console.log('Failed to process pending action:', error)
      }
    }
  } catch (error) {
    console.log('Background sync failed:', error)
  }
}

// Push notifications
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json()
    const options = {
      body: data.body,
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      vibrate: [100, 50, 100],
      data: data.data,
      actions: data.actions || []
    }
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    )
  }
})

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  
  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow('/')
    )
  }
})

// Helper functions for IndexedDB operations
async function getPendingActions() {
  // This would interact with IndexedDB to get pending actions
  // For now, return empty array
  return []
}

async function processPendingAction(action) {
  // Process the pending action (e.g., sync booking data)
  console.log('Processing pending action:', action)
}

async function removePendingAction(actionId) {
  // Remove the processed action from IndexedDB
  console.log('Removing pending action:', actionId)
}

// Performance monitoring
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'PERFORMANCE_REPORT') {
    console.log('Service Worker received performance report:', event.data.metrics)
    
    // Store performance metrics for analysis
    storePerformanceMetrics(event.data.metrics)
  }
})

async function storePerformanceMetrics(metrics) {
  try {
    // Store metrics in IndexedDB for later analysis
    console.log('Storing performance metrics:', metrics)
  } catch (error) {
    console.log('Failed to store performance metrics:', error)
  }
}

console.log('Service Worker: Loaded successfully')

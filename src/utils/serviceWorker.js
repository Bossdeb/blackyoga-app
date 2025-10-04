// Service Worker Registration
export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        })
        
        console.log('Service Worker registered successfully:', registration.scope)
        
        // Handle updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New version available
                console.log('New version available')
                // You can show a notification to the user here
                showUpdateNotification()
              }
            })
          }
        })
        
        // Handle controller change
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          console.log('Service Worker controller changed')
          // Reload the page to use the new service worker
          window.location.reload()
        })
        
      } catch (error) {
        console.error('Service Worker registration failed:', error)
      }
    })
  }
}

// Show update notification
function showUpdateNotification() {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('อัพเดตแอพ', {
      body: 'มีเวอร์ชันใหม่ของแอพพร้อมใช้งาน',
      icon: '/icon-192x192.png',
      tag: 'app-update'
    })
  }
}

// Request notification permission
export async function requestNotificationPermission() {
  if ('Notification' in window) {
    const permission = await Notification.requestPermission()
    return permission === 'granted'
  }
  return false
}

// Send message to service worker
export function sendMessageToSW(message) {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage(message)
  }
}

// Check if app is online
export function isOnline() {
  return navigator.onLine
}

// Listen for online/offline events
export function onNetworkChange(callback) {
  window.addEventListener('online', () => callback(true))
  window.addEventListener('offline', () => callback(false))
}

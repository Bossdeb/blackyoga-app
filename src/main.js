import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'
import { usePerformance } from './composables/usePerformance.js'
import { registerServiceWorker } from './utils/serviceWorker.js'

// Initialize performance monitoring
const { startMonitoring } = usePerformance()
startMonitoring()

// Register service worker
registerServiceWorker()

createApp(App)
  .use(router)
  .use(Toast, { 
    position: 'top-center', 
    timeout: 2400, 
    closeOnClick: true, 
    pauseOnHover: true,
    maxToasts: 3,
    newestOnTop: true
  })
  .mount('#app')

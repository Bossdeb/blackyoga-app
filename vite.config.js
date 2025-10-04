import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      '.ngrok-free.app',
      '64000d404fd7.ngrok-free.app'
    ]
  },
  build: {
    // Performance optimizations
    target: 'es2015',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks for better caching
          vendor: ['vue', 'vue-router'],
          firebase: ['firebase/app', 'firebase/firestore'],
          ui: ['vue-toastification']
        },
        // Optimize chunk names
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
      }
    },
    // Enable source maps for debugging
    sourcemap: false,
    // Optimize asset handling
    assetsInlineLimit: 4096,
    // Enable CSS code splitting
    cssCodeSplit: true
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['vue', 'vue-router', 'firebase/app', 'firebase/firestore']
  },
  // Enable compression
  esbuild: {
    drop: ['console', 'debugger']
  },
  // PWA and Service Worker configuration
  define: {
    __SW_VERSION__: JSON.stringify(Date.now().toString())
  }
})

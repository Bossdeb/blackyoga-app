<script setup>
import { useFirebase } from './composables/useFirebase.js'
import BottomNav from './components/BottomNav.vue'

const { loading, isAuthenticated, error } = useFirebase()

const retry = () => {
  window.location.reload()
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Loading Screen -->
    <div v-if="loading" class="min-h-screen flex items-center justify-center bg-gray-50">
      <div class="text-center">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-lineGreen mb-4"></div>
        <p class="text-gray-600">กำลังโหลด...</p>
      </div>
    </div>

    <!-- Error Screen -->
    <div v-else-if="error" class="min-h-screen flex items-center justify-center bg-gray-50">
      <div class="text-center max-w-md mx-auto px-6">
        <div class="text-6xl mb-4">⚠️</div>
        <h1 class="text-2xl font-bold text-gray-900 mb-2">เกิดข้อผิดพลาด</h1>
        <p class="text-gray-600 mb-6">{{ error }}</p>
        <button 
          @click="retry"
          class="bg-lineGreen hover:bg-green-600 text-white px-6 py-3 rounded-xl font-semibold"
        >
          ลองใหม่
        </button>
      </div>
    </div>

    <!-- Main App -->
    <div v-else-if="isAuthenticated" class="max-w-md mx-auto bg-gray-50 min-h-screen relative">
      <router-view />
      <BottomNav />
    </div>

    <!-- Login Page (no container) -->
    <div v-else>
      <router-view />
    </div>
  </div>
</template>

<style>
/* Global styles for clean light theme */
body {
  margin: 0;
  font-family: system-ui, -apple-system, sans-serif;
  background: #f9fafb;
  color: #111827;
}

#app {
  min-height: 100vh;
  background: #f9fafb;
}

/* Mobile container styling */
.max-w-md {
  max-width: 28rem; /* 448px - typical mobile width */
}

/* Ensure container has proper positioning */
.relative {
  position: relative;
}

/* Subtle light scrollbar */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #f3f4f6;
}

::-webkit-scrollbar-thumb {
  background: #e5e7eb;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #d1d5db;
}

/* Smooth transitions */
* {
  transition: color 0.2s ease, background-color 0.2s ease, border-color 0.2s ease;
}
</style>

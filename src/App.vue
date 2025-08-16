<script setup>
import { useFirebase } from './composables/useFirebase.js'
import BottomNav from './components/BottomNav.vue'
import { useRoute, useRouter } from 'vue-router'
import { computed, ref, watch } from 'vue'

const { loading, isAuthenticated, error } = useFirebase()
const route = useRoute()
const router = useRouter()

const showBottomNav = computed(() => {
  return isAuthenticated.value && route.name !== 'Onboarding'
})

// Page transition states
const pageLoading = ref(false)
const previousRoute = ref(null)

// Watch for route changes to show loading state
watch(() => route.path, (newPath, oldPath) => {
  if (oldPath && newPath !== oldPath) {
    previousRoute.value = oldPath
    pageLoading.value = true
    
    // Hide loading after a short delay to show transition
    setTimeout(() => {
      pageLoading.value = false
    }, 150)
  }
}, { immediate: false })

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
    <div v-else class="max-w-md mx-auto bg-gray-50 min-h-screen relative">
      <!-- Page Loading Overlay -->
      <div 
        v-if="pageLoading" 
        class="fixed inset-0 bg-white bg-opacity-80 z-40 flex items-center justify-center"
      >
        <div class="text-center">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-lineGreen mb-2"></div>
          <p class="text-sm text-gray-600">กำลังโหลด...</p>
        </div>
      </div>

      <!-- Router View with Transitions -->
      <transition 
        name="page" 
        mode="out-in"
        @before-enter="pageLoading = true"
        @after-enter="pageLoading = false"
      >
        <router-view :key="route.path" />
      </transition>
      
      <BottomNav v-if="showBottomNav" />
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

/* Page Transition Animations */
.page-enter-active,
.page-leave-active {
  transition: all 0.2s ease-in-out;
}

.page-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.page-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

/* Loading animation */
@keyframes fadeInOut {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 1; }
}

.loading-pulse {
  animation: fadeInOut 1.5s ease-in-out infinite;
}
</style>

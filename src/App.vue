<script setup>
import { onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import BottomNav from './components/BottomNav.vue'
import { useAuth } from './composables/useAuth'

const router = useRouter()
const { user, loading, isAuthenticated, initAuth } = useAuth()

onMounted(() => {
  initAuth()
})

// Watch for authentication changes
watch(isAuthenticated, (authenticated) => {
  if (!authenticated && !loading.value) {
    console.log('User not authenticated, redirecting to login')
    router.push('/login')
  }
})

// Watch for loading state
watch(loading, (isLoading) => {
  if (!isLoading && !isAuthenticated()) {
    console.log('Loading finished, user not authenticated, redirecting to login')
    router.push('/login')
  }
})
</script>

<template>
  <div class="min-h-screen bg-black">
    <!-- Loading Screen -->
    <div v-if="loading" class="min-h-screen flex items-center justify-center bg-black">
      <div class="text-center">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
        <p class="text-gray-400">กำลังโหลด...</p>
      </div>
    </div>

    <!-- Main App -->
    <div v-else-if="isAuthenticated()" class="max-w-md mx-auto bg-black min-h-screen relative">
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
/* Global styles for minimal black theme */
body {
  margin: 0;
  font-family: system-ui, -apple-system, sans-serif;
  background: #000000;
  color: #ffffff;
}

#app {
  min-height: 100vh;
  background: #000000;
}

/* Mobile container styling */
.max-w-md {
  max-width: 28rem; /* 448px - typical mobile width */
}

/* Ensure container has proper positioning */
.relative {
  position: relative;
}

/* Custom scrollbar for dark theme */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #1a1a1a;
}

::-webkit-scrollbar-thumb {
  background: #333333;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #555555;
}

/* Ensure proper text contrast */
.text-gray-400 {
  color: #9ca3af;
}

.text-gray-500 {
  color: #6b7280;
}

/* Smooth transitions */
* {
  transition: color 0.2s ease, background-color 0.2s ease, border-color 0.2s ease;
}
</style>

<template>
  <div v-if="hasError" class="min-h-screen flex items-center justify-center bg-gray-50 p-4">
    <div class="text-center max-w-md mx-auto">
      <!-- Error Icon -->
      <div class="text-6xl mb-4">⚠️</div>
      
      <!-- Error Title -->
      <h1 class="text-2xl font-bold text-gray-900 mb-2">
        {{ errorTitle }}
      </h1>
      
      <!-- Error Message -->
      <p class="text-gray-600 mb-6">
        {{ errorMessage }}
      </p>
      
      <!-- Action Buttons -->
      <div class="space-y-3">
        <button 
          @click="retry"
          class="w-full bg-lineGreen hover:bg-green-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors duration-200"
        >
          ลองใหม่
        </button>
        
        <button 
          @click="goHome"
          class="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold transition-colors duration-200"
        >
          กลับหน้าหลัก
        </button>
      </div>
      
      <!-- Debug Info (only in development) -->
      <details v-if="isDevelopment && errorDetails" class="mt-6 text-left">
        <summary class="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
          รายละเอียดข้อผิดพลาด (สำหรับนักพัฒนา)
        </summary>
        <pre class="mt-2 p-3 bg-gray-100 rounded text-xs text-gray-600 overflow-auto">{{ errorDetails }}</pre>
      </details>
    </div>
  </div>
  
  <!-- Render children if no error -->
  <slot v-else />
</template>

<script setup>
import { ref, computed, onErrorCaptured } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  fallbackTitle: {
    type: String,
    default: 'เกิดข้อผิดพลาด'
  },
  fallbackMessage: {
    type: String,
    default: 'เกิดข้อผิดพลาดที่ไม่คาดคิด กรุณาลองใหม่อีกครั้ง'
  },
  showRetry: {
    type: Boolean,
    default: true
  },
  showHome: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['error', 'retry'])

const router = useRouter()
const hasError = ref(false)
const errorDetails = ref(null)

const isDevelopment = computed(() => {
  return import.meta.env.DEV
})

const errorTitle = computed(() => {
  if (hasError.value && errorDetails.value) {
    // Try to extract meaningful error title
    const error = errorDetails.value
    if (error.message?.includes('Network')) return 'ปัญหาเครือข่าย'
    if (error.message?.includes('Firebase')) return 'ปัญหาเซิร์ฟเวอร์'
    if (error.message?.includes('Permission')) return 'ไม่มีสิทธิ์เข้าถึง'
    if (error.message?.includes('NotFound')) return 'ไม่พบข้อมูล'
  }
  return props.fallbackTitle
})

const errorMessage = computed(() => {
  if (hasError.value && errorDetails.value) {
    const error = errorDetails.value
    if (error.message?.includes('Network')) return 'ไม่สามารถเชื่อมต่อเครือข่ายได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต'
    if (error.message?.includes('Firebase')) return 'เกิดปัญหากับเซิร์ฟเวอร์ กรุณาลองใหม่อีกครั้ง'
    if (error.message?.includes('Permission')) return 'คุณไม่มีสิทธิ์เข้าถึงข้อมูลนี้'
    if (error.message?.includes('NotFound')) return 'ไม่พบข้อมูลที่ต้องการ'
  }
  return props.fallbackMessage
})

// Capture Vue errors
onErrorCaptured((error, instance, info) => {
  console.error('ErrorBoundary caught error:', error)
  console.error('Component instance:', instance)
  console.error('Error info:', info)
  
  hasError.value = true
  errorDetails.value = {
    message: error.message,
    stack: error.stack,
    component: instance?.$options?.name || 'Unknown',
    info
  }
  
  emit('error', error, instance, info)
  
  // Prevent error from propagating
  return false
})

// Global error handler
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    console.error('Global error caught:', event.error)
    hasError.value = true
    errorDetails.value = {
      message: event.error?.message || 'Unknown error',
      stack: event.error?.stack,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    }
  })
  
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason)
    hasError.value = true
    errorDetails.value = {
      message: event.reason?.message || 'Unhandled promise rejection',
      stack: event.reason?.stack,
      type: 'promise'
    }
  })
}

const retry = () => {
  hasError.value = false
  errorDetails.value = null
  emit('retry')
}

const goHome = () => {
  hasError.value = false
  errorDetails.value = null
  router.push('/')
}

// Expose methods for manual error handling
defineExpose({
  setError: (error) => {
    hasError.value = true
    errorDetails.value = error
  },
  clearError: () => {
    hasError.value = false
    errorDetails.value = null
  }
})
</script>

<style scoped>
/* Smooth transitions */
.transition-colors {
  transition-property: color, background-color, border-color;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

/* Custom scrollbar for debug info */
pre::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}

pre::-webkit-scrollbar-track {
  background: #f1f5f9;
}

pre::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 2px;
}

pre::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>

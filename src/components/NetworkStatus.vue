<template>
  <div v-if="!isOnline || networkError" 
       class="fixed top-0 left-0 right-0 z-50 bg-red-500 text-white text-center py-2 px-4">
    <div class="flex items-center justify-center gap-2">
      <span class="text-lg">📡</span>
      <span class="font-medium">
        {{ !isOnline ? 'ไม่มีการเชื่อมต่ออินเทอร์เน็ต' : 'เกิดปัญหาการเชื่อมต่อ' }}
      </span>
      <button 
        v-if="networkError && isOnline"
        @click="retryConnection"
        class="ml-2 bg-white text-red-500 px-3 py-1 rounded text-sm font-medium hover:bg-gray-100"
      >
        ลองใหม่
      </button>
    </div>
  </div>
</template>

<script setup>
import { useFirebase } from '../composables/useFirebase.js'

const { isOnline, networkError } = useFirebase()

const retryConnection = () => {
  // Force page reload to retry connection
  window.location.reload()
}
</script>

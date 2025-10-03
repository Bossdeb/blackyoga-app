<template>
  <nav class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
    <div class="max-w-md mx-auto">
      <div class="flex items-center justify-around">
        <router-link
          to="/"
          class="flex flex-col items-center flex-1 py-1 group transition-all duration-200 relative"
          active-class="text-lineGreen"
        >
          <div class="text-2xl mb-1 group-hover:scale-110 transition-transform duration-200">🏠</div>
          <span class="text-xs font-medium mt-0.5 group-hover:text-lineGreen transition-colors duration-200 text-gray-500">หน้าแรก</span>
          <div class="absolute -top-1 left-1/2 transform -translate-x-1/2 w-4 h-0.5 bg-lineGreen rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100"></div>
        </router-link>

        <router-link
          to="/booking"
          class="flex flex-col items-center flex-1 py-1 group transition-all duration-200 relative"
          active-class="text-lineGreen"
        >
          <div class="text-2xl mb-1 group-hover:scale-110 transition-transform duration-200">📅</div>
          <span class="text-xs font-medium mt-0.5 group-hover:text-lineGreen transition-colors duration-200 text-gray-500">การจอง</span>
          <div class="absolute -top-1 left-1/2 transform -translate-x-1/2 w-4 h-0.5 bg-lineGreen rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100"></div>
        </router-link>

        <router-link
          to="/points"
          class="flex flex-col items-center flex-1 py-1 group transition-all duration-200 relative"
          active-class="text-lineGreen"
        >
          <div class="text-2xl mb-1 group-hover:scale-110 transition-transform duration-200">📋</div>
          <span class="text-xs font-medium mt-0.5 group-hover:text-lineGreen transition-colors duration-200 text-gray-500">ประวัติของฉั</span>
          <div class="absolute -top-1 left-1/2 transform -translate-x-1/2 w-4 h-0.5 bg-lineGreen rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100"></div>
        </router-link>

        <!-- Admin button - only show for admin users -->
        <router-link
          v-if="isAdmin"
          to="/admin"
          class="flex flex-col items-center flex-1 py-1 group transition-all duration-200 relative"
          active-class="text-lineGreen"
        >
          <div class="text-2xl mb-1 group-hover:scale-110 transition-transform duration-200">⚙️</div>
          <span class="text-xs font-medium mt-0.5 group-hover:text-lineGreen transition-colors duration-200 text-gray-500">แอดมิน</span>
          <div class="absolute -top-1 left-1/2 transform -translate-x-1/2 w-4 h-0.5 bg-lineGreen rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100"></div>
        </router-link>

        <router-link
          to="/profile"
          class="flex flex-col items-center flex-1 py-1 group transition-all duration-200 relative"
          active-class="text-lineGreen"
        >
          <div class="text-2xl mb-1 group-hover:scale-110 transition-transform duration-200">👤</div>
          <span class="text-xs font-medium mt-0.5 group-hover:text-lineGreen transition-colors duration-200 text-gray-500">โปรไฟล์</span>
          <div class="absolute -top-1 left-1/2 transform -translate-x-1/2 w-4 h-0.5 bg-lineGreen rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100"></div>
        </router-link>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { useFirebase } from '../composables/useFirebase.js'

const { isAdmin } = useFirebase()
</script>

<style scoped>
.router-link-active::before {
  content: '';
  position: absolute;
  top: -1px;
  left: 50%;
  transform: translateX(-50%);
  width: 16px;
  height: 2px;
  background: var(--line-green);
  border-radius: 1px;
}

:root {
  --line-green: #06C755;
}
</style>

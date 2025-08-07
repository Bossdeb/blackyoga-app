<template>
  <nav class="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 flex justify-around items-center h-16 z-[9999] shadow-lg">
    <router-link 
      to="/" 
      class="flex flex-col items-center flex-1 py-1 group transition-all duration-200" 
      active-class="text-white"
    >
      <div class="relative">
        <span class="text-xl group-hover:scale-110 transition-transform duration-200">🏠</span>
        <div class="absolute -top-1 -right-1 w-1.5 h-1.5 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
      </div>
      <span class="text-xs font-medium mt-0.5 group-hover:text-white transition-colors duration-200 text-gray-400">หน้าแรก</span>
    </router-link>
    
    <router-link 
      to="/booking" 
      class="flex flex-col items-center flex-1 py-1 group transition-all duration-200" 
      active-class="text-white"
    >
      <div class="relative">
        <span class="text-xl group-hover:scale-110 transition-transform duration-200">📅</span>
        <div class="absolute -top-1 -right-1 w-1.5 h-1.5 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
      </div>
      <span class="text-xs font-medium mt-0.5 group-hover:text-white transition-colors duration-200 text-gray-400">จองคลาส</span>
    </router-link>
    
    <router-link 
      to="/points" 
      class="flex flex-col items-center flex-1 py-1 group transition-all duration-200" 
      active-class="text-white"
    >
      <div class="relative">
        <span class="text-xl group-hover:scale-110 transition-transform duration-200">⭐</span>
        <div class="absolute -top-1 -right-1 w-1.5 h-1.5 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
      </div>
      <span class="text-xs font-medium mt-0.5 group-hover:text-white transition-colors duration-200 text-gray-400">แต้ม</span>
    </router-link>
    
    <router-link 
      to="/profile" 
      class="flex flex-col items-center flex-1 py-1 group transition-all duration-200" 
      active-class="text-white"
    >
      <div class="relative">
        <span class="text-xl group-hover:scale-110 transition-transform duration-200">👤</span>
        <div class="absolute -top-1 -right-1 w-1.5 h-1.5 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
      </div>
      <span class="text-xs font-medium mt-0.5 group-hover:text-white transition-colors duration-200 text-gray-400">โปรไฟล์</span>
    </router-link>
    
    <router-link 
      to="/admin" 
      class="flex flex-col items-center flex-1 py-1 group transition-all duration-200" 
      active-class="text-white"
    >
      <div class="relative">
        <span class="text-xl group-hover:scale-110 transition-transform duration-200">⚙️</span>
        <div class="absolute -top-1 -right-1 w-1.5 h-1.5 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
      </div>
      <span class="text-xs font-medium mt-0.5 group-hover:text-white transition-colors duration-200 text-gray-400">แอดมิน</span>
    </router-link>
  </nav>
</template>

<script setup>
// สามารถเพิ่ม logic ซ่อนเมนู Admin ได้ในอนาคต
</script>

<style scoped>
/* Active state indicator */
.router-link-active {
  position: relative;
}

.router-link-active::before {
  content: '';
  position: absolute;
  top: -1px;
  left: 50%;
  transform: translateX(-50%);
  width: 16px;
  height: 2px;
  background: #ffffff;
  border-radius: 1px;
}

/* Ensure nav stays on top */
nav {
  position: fixed !important;
  bottom: 0 !important;
  left: 0 !important;
  right: 0 !important;
  z-index: 9999 !important;
  background: #111827 !important;
}
</style>
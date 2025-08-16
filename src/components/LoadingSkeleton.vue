<template>
  <div class="animate-pulse">
    <!-- Class Card Skeleton -->
    <div v-if="type === 'class-card'" class="bg-white rounded-xl p-4 mb-4 shadow-sm">
      <div class="flex items-start space-x-3">
        <div class="w-12 h-12 bg-gray-200 rounded-lg flex-shrink-0"></div>
        <div class="flex-1 min-w-0">
          <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div class="h-3 bg-gray-200 rounded w-1/2 mb-1"></div>
          <div class="h-3 bg-gray-200 rounded w-2/3"></div>
        </div>
        <div class="w-16 h-8 bg-gray-200 rounded-lg"></div>
      </div>
    </div>

    <!-- Booking Card Skeleton -->
    <div v-if="type === 'booking-card'" class="bg-white rounded-xl p-4 mb-4 shadow-sm">
      <div class="flex items-center justify-between mb-3">
        <div class="h-5 bg-gray-200 rounded w-1/3"></div>
        <div class="w-20 h-6 bg-gray-200 rounded-full"></div>
      </div>
      <div class="space-y-2">
        <div class="h-4 bg-gray-200 rounded w-full"></div>
        <div class="h-4 bg-gray-200 rounded w-2/3"></div>
        <div class="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    </div>

    <!-- Points Transaction Skeleton -->
    <div v-if="type === 'transaction'" class="bg-white rounded-xl p-4 mb-3 shadow-sm">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 bg-gray-200 rounded-full"></div>
          <div>
            <div class="h-4 bg-gray-200 rounded w-32 mb-1"></div>
            <div class="h-3 bg-gray-200 rounded w-24"></div>
          </div>
        </div>
        <div class="text-right">
          <div class="h-4 bg-gray-200 rounded w-16 mb-1"></div>
          <div class="h-3 bg-gray-200 rounded w-20"></div>
        </div>
      </div>
    </div>

    <!-- Profile Skeleton -->
    <div v-if="type === 'profile'" class="bg-white rounded-xl p-6 shadow-sm">
      <div class="flex items-center space-x-4 mb-6">
        <div class="w-20 h-20 bg-gray-200 rounded-full"></div>
        <div class="flex-1">
          <div class="h-5 bg-gray-200 rounded w-2/3 mb-2"></div>
          <div class="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
      <div class="space-y-4">
        <div class="h-4 bg-gray-200 rounded w-full"></div>
        <div class="h-4 bg-gray-200 rounded w-3/4"></div>
        <div class="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    </div>

    <!-- List Skeleton -->
    <div v-if="type === 'list'" class="space-y-3">
      <div v-for="i in count" :key="i" class="bg-white rounded-xl p-4 shadow-sm">
        <div class="flex items-center space-x-3">
          <div class="w-12 h-12 bg-gray-200 rounded-lg flex-shrink-0"></div>
          <div class="flex-1">
            <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div class="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div class="w-16 h-8 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    </div>

    <!-- Grid Skeleton -->
    <div v-if="type === 'grid'" class="grid grid-cols-2 gap-4">
      <div v-for="i in count" :key="i" class="bg-white rounded-xl p-4 shadow-sm">
        <div class="w-full h-24 bg-gray-200 rounded-lg mb-3"></div>
        <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div class="h-3 bg-gray-200 rounded w-1/2"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  type: {
    type: String,
    default: 'list',
    validator: (value) => ['class-card', 'booking-card', 'transaction', 'profile', 'list', 'grid'].includes(value)
  },
  count: {
    type: Number,
    default: 3
  }
})
</script>

<style scoped>
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: .5;
  }
}
</style>

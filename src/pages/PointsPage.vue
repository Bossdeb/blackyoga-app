<template>
  <div class="min-h-screen bg-black">
    <!-- Header -->
    <header class="bg-gray-900 text-white shadow-lg border-b border-gray-800">
      <div class="max-w-md mx-auto px-6 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold">⭐ แต้มสะสม</h1>
            <p class="text-gray-400 text-sm">ดูประวัติแต้มและรางวัล</p>
          </div>
          <div class="bg-gray-800 rounded-full p-2">
            <span class="text-2xl">🏆</span>
          </div>
        </div>
      </div>
    </header>

    <!-- Points Summary -->
    <div class="max-w-md mx-auto px-6 py-4">
      <div class="bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-800 mb-6">
        <div class="text-center">
          <div class="text-5xl font-bold text-white mb-2">{{ totalPoints }}</div>
          <div class="text-gray-400 mb-4">แต้มสะสมทั้งหมด</div>
          <div class="flex justify-center items-center gap-2">
            <div class="w-32 bg-gray-800 rounded-full h-2">
              <div 
                class="bg-white h-2 rounded-full transition-all duration-300"
                :style="{ width: `${progressPercentage}%` }"
              ></div>
            </div>
            <span class="text-sm text-gray-400">{{ progressPercentage }}%</span>
          </div>
          <div class="text-xs text-gray-500 mt-2">
            แต้มถัดไป: {{ nextLevelPoints - totalPoints }} แต้ม
          </div>
        </div>
      </div>
    </div>

    <!-- Points History -->
    <main class="max-w-md mx-auto px-6 pb-24">
      <h3 class="text-lg font-semibold text-white mb-4">ประวัติแต้ม</h3>
      
      <div class="space-y-4">
        <div v-for="transaction in pointsHistory" :key="transaction.id" 
             class="bg-gray-900 rounded-xl shadow-sm border border-gray-800 overflow-hidden">
          
          <div class="p-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="text-2xl">{{ transaction.emoji }}</div>
                <div>
                  <h4 class="text-white font-medium">{{ transaction.description }}</h4>
                  <p class="text-sm text-gray-400">{{ formatDate(transaction.date) }}</p>
                </div>
              </div>
              <div class="text-right">
                <div :class="transaction.type === 'earned' ? 'text-green-400' : 'text-red-400'" class="font-bold">
                  {{ transaction.type === 'earned' ? '+' : '-' }}{{ transaction.points }}
                </div>
                <div class="text-xs text-gray-500">{{ transaction.type === 'earned' ? 'ได้รับ' : 'ใช้ไป' }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="pointsHistory.length === 0" class="text-center py-12">
          <div class="text-6xl mb-4">⭐</div>
          <h3 class="text-xl font-semibold text-white mb-2">ยังไม่มีประวัติแต้ม</h3>
          <p class="text-gray-400">จองคลาสเพื่อเริ่มสะสมแต้มกันเลย!</p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuth } from '../composables/useAuth'

const { getUser } = useAuth()
const user = getUser()

const totalPoints = computed(() => {
  return pointsHistory.value.reduce((total, transaction) => {
    if (transaction.type === 'earned') {
      return total + transaction.points
    } else {
      return total - transaction.points
    }
  }, 0)
})

const nextLevelPoints = 200 // Points needed for next level
const progressPercentage = computed(() => {
  return Math.min((totalPoints.value / nextLevelPoints) * 100, 100)
})

const pointsHistory = ref([])

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  // Load points history from localStorage
  const savedHistory = localStorage.getItem('black-yoga-points-history')
  if (savedHistory) {
    pointsHistory.value = JSON.parse(savedHistory)
  } else {
    // Generate history based on actual bookings
    const bookings = JSON.parse(localStorage.getItem('black-yoga-bookings') || '[]')
    const history = []
    
    bookings.forEach((booking, index) => {
      if (booking.status !== 'cancelled') {
        history.push({
          id: `booking-${booking.id}`,
          type: 'earned',
          points: 10,
          description: `จองคลาส ${booking.className}`,
          date: booking.createdAt,
          emoji: '📅'
        })
      }
    })
    
    // Add bonus points for multiple bookings
    if (history.length >= 3) {
      history.push({
        id: 'bonus-multiple',
        type: 'earned',
        points: 5,
        description: 'โบนัสการจองหลายคลาส',
        date: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        emoji: '🎁'
      })
    }
    
    pointsHistory.value = history
    localStorage.setItem('black-yoga-points-history', JSON.stringify(history))
  }
})
</script>
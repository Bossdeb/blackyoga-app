<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white text-gray-900 shadow-sm border-b border-gray-200">
      <div class="max-w-md mx-auto px-6 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold">💰 แต้มเครดิต</h1>
            <p class="text-gray-500 text-sm">ดูประวัติการใช้งานเครดิต</p>
          </div>
          <div class="bg-gray-100 rounded-full p-2">
            <span class="text-2xl">💳</span>
          </div>
        </div>
      </div>
    </header>

    <!-- Points Summary -->
    <div class="max-w-md mx-auto px-6 py-4">
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 mb-6">
        <div class="text-center">
          <div class="text-5xl font-bold text-gray-900 mb-2">{{ currentPoints }}</div>
          <div class="text-gray-500 mb-4">เครดิตคงเหลือ</div>
          <div class="text-sm text-gray-400 mb-4">
            1 คลาส = 1 พอยต์
          </div>
          <div class="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <div class="text-sm text-gray-500 mb-1">ข้อมูลเครดิต</div>
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div class="text-green-600 font-bold">{{ totalAdded }}</div>
                <div class="text-gray-500">เติมเครดิต</div>
              </div>
              <div>
                <div class="text-red-600 font-bold">{{ totalUsed }}</div>
                <div class="text-gray-500">ใช้เครดิต</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Points History -->
    <main class="max-w-md mx-auto px-6 pb-24">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">ประวัติเครดิต</h3>
      
      <div class="space-y-4">
        <div v-for="transaction in pointsHistory" :key="transaction.id" 
             class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          
          <div class="p-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="text-2xl">{{ transaction.emoji }}</div>
                <div>
                  <h4 class="text-gray-900 font-medium">{{ transaction.description }}</h4>
                  <p class="text-sm text-gray-500">{{ formatDate(transaction.date) }}</p>
                </div>
              </div>
              <div class="text-right">
                <div :class="transaction.type === 'added' ? 'text-green-600' : 'text-red-600'" class="font-bold">
                  {{ transaction.type === 'added' ? '+' : '-' }}{{ transaction.points }}
                </div>
                <div class="text-xs text-gray-400">
                  {{ getTransactionTypeText(transaction) }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="pointsHistory.length === 0" class="text-center py-12">
          <div class="text-6xl mb-4">💰</div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">ยังไม่มีประวัติเครดิต</h3>
          <p class="text-gray-500">ติดต่อแอดมินเพื่อเติมเครดิต</p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useAuth } from '../composables/useAuth'

const { getUser } = useAuth()
const user = getUser()

const pointsHistory = ref([])

const currentPoints = computed(() => {
  return pointsHistory.value.reduce((total, transaction) => {
    if (transaction.type === 'added') {
      return total + transaction.points
    } else {
      return total - transaction.points
    }
  }, 0)
})

const totalAdded = computed(() => {
  return pointsHistory.value
    .filter(t => t.type === 'added')
    .reduce((total, t) => total + t.points, 0)
})

const totalUsed = computed(() => {
  return pointsHistory.value
    .filter(t => t.type === 'used')
    .reduce((total, t) => total + t.points, 0)
})

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

const getTransactionTypeText = (transaction) => {
  if (transaction.type === 'added') {
    if (transaction.description.includes('คืนเครดิต')) {
      return 'คืนเครดิต'
    } else if (transaction.description.includes('แอดมิน')) {
      return 'แอดมินเพิ่ม'
    } else {
      return 'เติมเครดิต'
    }
  } else {
    return 'ใช้เครดิต'
  }
}

// Function to load points history
const loadPointsHistory = () => {
  const savedHistory = localStorage.getItem('black-yoga-points-history')
  if (savedHistory) {
    pointsHistory.value = JSON.parse(savedHistory)
  } else {
    // Generate initial demo data
    const history = [
      {
        id: 'initial-credit',
        type: 'added',
        points: 10,
        description: 'เติมเครดิตเริ่มต้น (Demo)',
        date: new Date(Date.now() - 86400000 * 7).toISOString(), // 7 days ago
        emoji: '💰'
      }
    ]
    
    pointsHistory.value = history
    localStorage.setItem('black-yoga-points-history', JSON.stringify(history))
  }
}

onMounted(() => {
  loadPointsHistory()
})

// Watch for changes in localStorage points history
watch(() => localStorage.getItem('black-yoga-points-history'), () => {
  loadPointsHistory()
}, { deep: true })
</script>
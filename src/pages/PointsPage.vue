<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white text-gray-900 shadow-sm border-b border-gray-200">
      <div class="max-w-md mx-auto px-6 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold">💰 แต้มเครดิต</h1>
            <p class="text-gray-500 text-sm">จัดการแต้มสะสมและประวัติ</p>
          </div>
          <div class="bg-gray-100 rounded-full p-2">
            <span class="text-2xl">💎</span>
          </div>
        </div>
      </div>
    </header>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
    </div>

    <!-- Points Summary -->
    <div v-else class="max-w-md mx-auto px-6 py-4">
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <div class="text-center">
          <div class="text-4xl font-bold text-gray-900 mb-2">{{ currentPoints }}</div>
          <div class="text-gray-500 text-sm">แต้มสะสมปัจจุบัน</div>
        </div>
        
        <!-- Quick Stats -->
        <div class="grid grid-cols-2 gap-4 mt-6">
          <div class="text-center">
            <div class="text-2xl font-bold text-green-600">{{ totalEarned }}</div>
            <div class="text-sm text-gray-500">แต้มที่ได้รับ</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-red-600">{{ totalUsed }}</div>
            <div class="text-sm text-gray-500">แต้มที่ใช้ไป</div>
          </div>
        </div>
      </div>
    </div>

      <!-- Transaction History -->
      <main class="max-w-md mx-auto px-6 pb-24">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">ประวัติการทำรายการ</h3>
      
      <div class="space-y-3">
        <div v-for="transaction in pointsHistory" :key="transaction.id" 
             class="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
          
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="text-2xl">{{ transaction.emoji || '💰' }}</div>
              <div class="flex-1">
                <h4 class="text-gray-900 font-medium">{{ transaction.description }}</h4>
                <p class="text-sm text-gray-500">{{ formatDate(transaction.createdAt) }}</p>
              </div>
            </div>
            <div class="text-right">
              <div :class="transaction.type === 'added' ? 'text-green-600' : 'text-red-600'" class="text-lg font-bold">
                {{ transaction.type === 'added' ? '+' : '-' }}{{ transaction.points }}
              </div>
              <div class="text-xs text-gray-400">
                {{ transaction.type === 'added' ? 'ได้รับ' : 'ใช้ไป' }}
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="pointsHistory.length === 0" class="text-center py-12">
          <div class="text-6xl mb-4">💰</div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">ยังไม่มีประวัติการทำรายการ</h3>
          <p class="text-gray-500">เริ่มจองคลาสเพื่อสะสมแต้มกันเลย!</p>
        </div>
      </div>

      <!-- How to Earn Points -->
      <div class="mt-8 bg-white rounded-xl p-4 border border-gray-200">
        <h4 class="text-gray-900 font-medium mb-3">วิธีสะสมแต้ม</h4>
        <div class="space-y-2 text-sm">
          <div class="flex items-center gap-2">
            <span class="text-green-600">✅</span>
            <span class="text-gray-600">สมาชิกใหม่: +10 แต้ม</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-green-600">✅</span>
            <span class="text-gray-600">ยกเลิกการจอง: +1 แต้ม (คืนเครดิต)</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-red-600">❌</span>
            <span class="text-gray-600">จองคลาส: -1 แต้ม</span>
          </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useFirebase } from '../composables/useFirebase.js'

const { getPointsHistory, getUserPoints, user, loading: firebaseLoading } = useFirebase()

const pointsHistory = ref([])
const currentPoints = ref(0)
const loading = ref(true)

const totalEarned = computed(() => {
  return pointsHistory.value
    .filter(t => t.type === 'added')
    .reduce((sum, t) => sum + t.points, 0)
})

const totalUsed = computed(() => {
  return pointsHistory.value
    .filter(t => t.type === 'used')
    .reduce((sum, t) => sum + t.points, 0)
})

const formatDate = (timestamp) => {
  if (!timestamp) return ''
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return date.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const loadPointsHistory = async () => {
  try {
    if (!user.value?.lineId) {
      console.log('No user logged in')
      return
    }
    pointsHistory.value = await getPointsHistory()
  } catch (error) {
    console.error('Error loading points history:', error)
  }
}

const loadCurrentPoints = async () => {
  try {
    if (!user.value?.lineId) {
      console.log('No user logged in')
      return
    }
    currentPoints.value = await getUserPoints()
  } catch (error) {
    console.error('Error loading current points:', error)
  }
}

const loadData = async () => {
  loading.value = true
  try {
    await Promise.all([
      loadPointsHistory(),
      loadCurrentPoints()
    ])
  } finally {
    loading.value = false
  }
}

// Watch for user changes
watch(() => user.value, async (newUser) => {
  if (newUser?.lineId) {
    await loadData()
  }
}, { immediate: true })

// Also watch for firebase loading state
watch(() => firebaseLoading.value, async (isLoading) => {
  if (!isLoading && user.value?.lineId) {
    await loadData()
  }
})

onMounted(async () => {
  if (user.value?.lineId) {
    await loadData()
  }
})
</script>
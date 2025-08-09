<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white text-gray-900 shadow-sm border-b border-gray-200">
      <div class="max-w-md mx-auto px-6 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold">💰 กระเป๋าพอยต์</h1>
            <p class="text-gray-500 text-sm">ยอดพอยต์และประวัติการใช้</p>
          </div>
          <div class="bg-gray-100 rounded-full p-2">
            <span class="text-2xl">💎</span>
          </div>
        </div>
      </div>
    </header>

    <!-- Points Summary -->
    <div class="max-w-md mx-auto px-6 py-4">
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <div class="text-center">
          <div class="text-4xl font-bold text-gray-900 mb-2">{{ currentPoints }}</div>
          <div class="text-gray-500 text-sm">ยอดพอยต์ปัจจุบัน</div>
        </div>
        
        <!-- Quick Stats -->
        <div class="grid grid-cols-2 gap-4 mt-6">
          <div class="text-center">
            <div class="text-2xl font-bold text-green-600">{{ totalEarned }}</div>
            <div class="text-sm text-gray-500">พอยต์ที่เติม/คืน</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-red-600">{{ totalUsed }}</div>
            <div class="text-sm text-gray-500">พอยต์ที่ใช้จอง</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Transaction History -->
    <main class="max-w-md mx-auto px-6 pb-24">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">ประวัติการทำรายการพอยต์</h3>
      
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
                {{ transaction.type === 'added' ? 'เติม/คืน' : 'ใช้จอง' }}
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

      <!-- Info -->
      <div class="mt-8 bg-white rounded-xl p-4 border border-gray-200">
        <h4 class="text-gray-900 font-medium mb-3">กติกาการใช้พอยต์</h4>
        <div class="space-y-2 text-sm text-gray-600">
          <div>• จอง 1 คลาส ใช้ 10 พอยต์</div>
          <div>• ยกเลิกได้ถึง 3 ชม. ก่อนเริ่มคลาส จะคืน 10 พอยต์</div>
          <div>• จองล่วงหน้าได้ไม่เกิน 1 วัน</div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useFirebase } from '../composables/useFirebase.js'

const { getPointsHistory, getUserPoints } = useFirebase()

const pointsHistory = ref([])
const currentPoints = ref(0)

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
    pointsHistory.value = await getPointsHistory()
  } catch (error) {
    console.error('Error loading points history:', error)
  }
}

const loadCurrentPoints = async () => {
  try {
    currentPoints.value = await getUserPoints()
  } catch (error) {
    console.error('Error loading current points:', error)
  }
}

onMounted(async () => {
  await loadPointsHistory()
  await loadCurrentPoints()
})
</script>
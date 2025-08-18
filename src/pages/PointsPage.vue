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
          <div v-if="loading" class="mx-auto h-8 w-24 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div v-else class="text-4xl font-bold text-gray-900 mb-2">{{ currentPoints }}</div>
          <div class="text-gray-500 text-sm">ยอดพอยต์ปัจจุบัน</div>
        </div>
      </div>
    </div>

    <!-- Transaction History -->
    <main class="max-w-md mx-auto px-6 pb-24">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">ประวัติการทำรายการพอยต์</h3>
      
      <div v-if="loading" class="space-y-3">
        <LoadingSkeleton type="transaction" :count="5" />
      </div>
      <div v-else class="space-y-3">
        <div v-for="transaction in pagedTransactions" :key="transaction.id" 
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

        </div>

        <!-- Pagination -->
        <div v-else class="flex items-center justify-between pt-4">
          <button 
            class="px-3 py-2 rounded-lg text-sm border border-gray-300 bg-white disabled:opacity-50"
            :disabled="currentPage === 1"
            @click="goToPage(currentPage - 1)"
          >ก่อนหน้า</button>

          <div class="flex items-center gap-2">
            <button 
              v-for="page in pages" :key="page"
              @click="goToPage(page)"
              :class="page === currentPage ? 'bg-lineGreen text-white border-lineGreen' : 'bg-white text-gray-700 border-gray-300'"
              class="w-8 h-8 rounded-lg text-sm border"
            >{{ page }}</button>
          </div>

          <button 
            class="px-3 py-2 rounded-lg text-sm border border-gray-300 bg-white disabled:opacity-50"
            :disabled="currentPage === totalPages"
            @click="goToPage(currentPage + 1)"
          >ถัดไป</button>
        </div>
      </div>

      <!-- Info -->
      <div class="mt-8 bg-white rounded-xl p-4 border border-gray-200">
        <h4 class="text-gray-900 font-medium mb-3">กติกาการใช้พอยต์</h4>
        <div class="space-y-2 text-sm text-gray-600">
          <div>• จอง 1 คลาส ใช้ 1 พอยต์</div>
          <div>• ยกเลิกได้ถึง 3 ชม. ก่อนเริ่มคลาส จะคืน 1 พอยต์</div>
          <div>• จองล่วงหน้าได้ไม่เกิน 1 วัน</div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useFirebase } from '../composables/useFirebase.js'
import LoadingSkeleton from '../components/LoadingSkeleton.vue'

const { getPointsHistory, getUserPoints, user } = useFirebase()

const pointsHistory = ref([])
const currentPoints = ref(0)
const loading = ref(true)

// Pagination (แสดง 5 รายการต่อหน้า)
const pageSize = ref(5)
const currentPage = ref(1)
const totalPages = computed(() => {
  return Math.max(1, Math.ceil(pointsHistory.value.length / pageSize.value))
})
const pagedTransactions = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return pointsHistory.value.slice(start, start + pageSize.value)
})
const pages = computed(() => Array.from({ length: totalPages.value }, (_, i) => i + 1))
const goToPage = (page) => {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
}

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
    console.log('Loading points history...')
    pointsHistory.value = await getPointsHistory()
    console.log('Points history loaded:', pointsHistory.value)
    // reset to first page on load
    currentPage.value = 1
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
  await Promise.all([loadPointsHistory(), loadCurrentPoints()])
  loading.value = false
})

// Update when user object changes
watch(() => user.value?.points, async () => {
  currentPoints.value = await getUserPoints()
})

// If history length changes and current page exceeds total, snap back
watch(pointsHistory, () => {
  if (currentPage.value > totalPages.value) {
    currentPage.value = totalPages.value
  }
})
</script>
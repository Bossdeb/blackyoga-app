<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm sticky top-0 z-10 border-b border-gray-200">
      <div class="px-6 py-4">
        <div class="flex items-center justify-between">
          <div>
             <h1 class="text-2xl font-bold text-gray-800">BLACK YOGA</h1>
            <p class="text-gray-500 text-sm">Premium Yoga Experience</p>
          </div>
          <div class="bg-gray-100 rounded-full p-2">
            <span class="text-2xl">🧘‍♀️</span>
          </div>
        </div>
      </div>
    </header>

    <!-- Date Selection -->
    <div class="px-6 py-4">
      <!-- Current Date -->
      <div class="text-center mb-4">
        <h2 class="text-lg font-semibold text-gray-800">{{ currentDateFormatted }}</h2>
      </div>

      <!-- Horizontal Date Picker -->
      <div class="relative">
        <div class="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
          <button 
            v-for="date in dateOptions" 
            :key="date.value"
            @click="selectedDate = date.value"
            :class="selectedDate === date.value 
              ? 'bg-lineGreen text-white' 
              : 'bg-white text-gray-800 border border-gray-300 hover:border-gray-400'"
            class="flex-shrink-0 px-4 py-3 rounded-lg font-medium transition-all duration-200 shadow-sm"
          >
            <div class="text-xs font-semibold">{{ date.day }}</div>
            <div class="text-lg font-bold">{{ date.date }}</div>
          </button>
        </div>
        
        <!-- Scroll Indicators -->
        <div class="flex justify-between mt-2">
          <button class="text-gray-400 hover:text-gray-500">
            <span class="text-lg">←</span>
          </button>
          <button class="text-gray-400 hover:text-gray-500">
            <span class="text-lg">→</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Available Classes -->
    <main class="px-6 pb-20">
      <h3 class="text-lg font-semibold text-gray-800 mb-4">Available Classes</h3>
      
      <!-- Classes List -->
      <div v-if="loading">
        <LoadingSkeleton type="class-card" :count="3" />
      </div>

      <div v-else-if="filteredClasses.length > 0" class="space-y-4">
        <div v-for="klass in filteredClasses" :key="klass.id" 
             class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
          
          <div class="p-6">
            <div class="flex items-start justify-between mb-3">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                  <h3 class="text-xl font-bold text-gray-800">{{ klass.name }}</h3>
                  <span v-if="klass.isFull" class="inline-flex items-center gap-1 bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-xs font-semibold">
                    เต็มแล้ว
                  </span>
                </div>
                <div class="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <span class="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-medium">
                    👩‍🏫 {{ klass.teacher }}
                  </span>
                  <span class="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-medium">
                    ⏰ {{ klass.startTime }} - {{ klass.endTime }}
                  </span>
                </div>
                <p class="text-gray-600 text-sm">{{ klass.description }}</p>
                <div class="text-sm text-gray-500 mt-2">
                  จองแล้ว: {{ klass.bookedCount }}/{{ klass.capacity }} คน
                </div>
              </div>
              <div class="text-right">
                <div class="text-2xl mb-1">{{ klass.emoji || '🧘‍♀️' }}</div>
                <div class="text-xs text-gray-400">{{ klass.durationMinutes || 60 }} นาที</div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex gap-3 mt-4">
              <button 
                :disabled="klass.isFull || currentPoints < 1 || bookingInProgress.has(klass.id)"
                :class="klass.isFull 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : currentPoints < 1
                  ? 'bg-red-500 text-white cursor-not-allowed'
                  : bookingInProgress.has(klass.id)
                  ? 'bg-yellow-500 text-white cursor-not-allowed'
                  : 'bg-lineGreen hover:bg-green-600 text-white transform hover:scale-105'"
                class="flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-200 shadow-sm"
                @click="bookClass(klass)"
              >
                {{ 
                  klass.isFull ? 'เต็มแล้ว' : 
                  currentPoints < 1 ? 'พอยต์ไม่เพียงพอ' : 
                  bookingInProgress.has(klass.id) ? 'กำลังจอง...' : 
                  'จองเลย' 
                }}
              </button>
              <button 
                @click="$router.push(`/class/${klass.id}`)"
                class="bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 py-3 px-4 rounded-xl font-medium transition-colors duration-200"
              >
                รายละเอียด
              </button>
            </div>
          </div>

          <!-- Status Bar -->
          <div :class="klass.isFull ? 'bg-red-400' : currentPoints < 1 ? 'bg-red-400' : 'bg-lineGreen'" class="h-1"></div>
        </div>
      </div>

      <!-- No Classes Available -->
      <div v-else class="text-center py-12">
        <div class="text-6xl mb-4">🧘‍♀️</div>
        <h3 class="text-xl font-semibold text-gray-800 mb-2">ไม่มีคลาสในวันนี้</h3>
        <p class="text-gray-500">ลองเลือกวันที่อื่นดูนะคะ</p>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useFirebase } from '../composables/useFirebase.js'
import LoadingSkeleton from '../components/LoadingSkeleton.vue'

const router = useRouter()
const { getClasses, createBooking, getUserPoints, user } = useFirebase()

const selectedDate = ref(new Date().toISOString().split('T')[0])
const classes = ref([])
const currentPoints = ref(0)
const loading = ref(true)
const bookingInProgress = ref(new Set()) // Track which classes are being booked

const currentDateFormatted = computed(() => {
  const date = new Date(selectedDate.value)
  return date.toLocaleDateString('th-TH', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
})

const dateOptions = computed(() => {
  const options = []
  const startDate = new Date()
  startDate.setHours(0, 0, 0, 0)
  
  const days = Array.from({ length: 14 }, (_, i) => {
    const date = new Date(startDate)
    date.setDate(date.getDate() + i)
    return date.toISOString().split('T')[0]
  })
  
  const todayStr = new Date().toISOString().split('T')[0]
  days.forEach(dateStr => {
    const date = new Date(dateStr)
    const day = dateStr === todayStr
      ? 'วันนี้'
      : date.toLocaleDateString('th-TH', { weekday: 'short' })
    const dateNum = date.getDate()
    options.push({ value: dateStr, day, date: dateNum })
  })
  return options
})

const filteredClasses = computed(() => {
  return classes.value.filter(klass => {
    const classDate = new Date(klass.date.toDate ? klass.date.toDate() : klass.date)
    const selectedDateObj = new Date(selectedDate.value)
    return classDate.toDateString() === selectedDateObj.toDateString()
  })
})

const bookClass = async (klass) => {
  if (klass.isFull || bookingInProgress.value.has(klass.id)) return
  
  bookingInProgress.value.add(klass.id)
  
  try {
    await createBooking(klass.id)
    alert(`จองคลาส ${klass.name} สำเร็จแล้ว! (ใช้พอยต์ 1)`) 
    await loadClasses()
    await loadCurrentPoints()
    router.push('/booking')
  } catch (error) {
    if (error.message.includes('คลาสเต็มแล้ว')) {
      alert('ขออภัย คลาสเต็มแล้ว กรุณาลองใหม่')
      await loadClasses() // Refresh to show updated status
    } else {
      alert(error.message || 'เกิดข้อผิดพลาดในการจอง')
    }
  } finally {
    bookingInProgress.value.delete(klass.id)
  }
}

async function loadClasses() {
  try {
    classes.value = await getClasses()
  } catch (error) {
    console.error('Error loading classes:', error)
  } finally {
    loading.value = false
  }
}

async function loadCurrentPoints() {
  try {
    currentPoints.value = await getUserPoints()
  } catch (error) {
    console.error('Error loading points:', error)
  }
}

onMounted(async () => {
  // Load in parallel for speed
  await Promise.all([loadClasses(), loadCurrentPoints()])
})

// Watch for user changes to reload data
watch(() => user.value, async () => {
  if (user.value) {
    await loadClasses()
    await loadCurrentPoints()
  }
})
</script>

<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
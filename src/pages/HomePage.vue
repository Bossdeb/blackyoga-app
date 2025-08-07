<template>
  <div class="min-h-screen bg-black">
    <!-- Header -->
    <header class="bg-gray-900 shadow-sm sticky top-0 z-10 border-b border-gray-800">
      <div class="px-6 py-4">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-white">BLACK YOGA</h1>
            <p class="text-gray-400 text-sm">Premium Yoga Experience</p>
          </div>
          <div class="bg-gray-800 rounded-full p-2">
            <span class="text-2xl">🧘‍♀️</span>
          </div>
        </div>
      </div>
    </header>

    <!-- Date Selection -->
    <div class="px-6 py-4">
      <!-- Current Date -->
      <div class="text-center mb-4">
        <h2 class="text-lg font-semibold text-white">{{ currentDateFormatted }}</h2>
      </div>

      <!-- Horizontal Date Picker -->
      <div class="relative">
        <div class="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
          <button 
            v-for="date in dateOptions" 
            :key="date.value"
            @click="selectedDate = date.value"
            :class="selectedDate === date.value 
              ? 'bg-white text-black' 
              : 'bg-gray-800 text-gray-300 border border-gray-700 hover:border-gray-600'"
            class="flex-shrink-0 px-4 py-3 rounded-lg font-medium transition-all duration-200 shadow-sm"
          >
            <div class="text-xs font-semibold">{{ date.day }}</div>
            <div class="text-lg font-bold">{{ date.date }}</div>
          </button>
        </div>
        
        <!-- Scroll Indicators -->
        <div class="flex justify-between mt-2">
          <button class="text-gray-500 hover:text-gray-400">
            <span class="text-lg">←</span>
          </button>
          <button class="text-gray-500 hover:text-gray-400">
            <span class="text-lg">→</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Available Classes -->
    <main class="px-6 pb-20">
      <h3 class="text-lg font-semibold text-white mb-4">Available Classes</h3>
      
      <!-- Classes List -->
      <div v-if="filteredClasses.length > 0" class="space-y-4">
        <div v-for="klass in filteredClasses" :key="klass.id" 
             class="bg-gray-900 rounded-xl shadow-sm border border-gray-800 overflow-hidden hover:shadow-md transition-shadow duration-200">
          
          <div class="p-6">
            <div class="flex items-start justify-between mb-3">
              <div class="flex-1">
                <h3 class="text-xl font-bold text-white mb-1">{{ klass.name }}</h3>
                <div class="flex items-center gap-2 text-sm text-gray-400 mb-2">
                  <span class="bg-gray-800 text-gray-300 px-2 py-1 rounded-full text-xs font-medium">
                    👩‍🏫 {{ klass.teacher }}
                  </span>
                  <span class="bg-gray-800 text-gray-300 px-2 py-1 rounded-full text-xs font-medium">
                    ⏰ {{ klass.time }}
                  </span>
                </div>
                <p class="text-gray-400 text-sm">{{ klass.description }}</p>
              </div>
              <div class="text-right">
                <div class="text-2xl mb-1">{{ klass.emoji }}</div>
                <div class="text-xs text-gray-500">{{ klass.duration }}</div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex gap-3 mt-4">
              <button 
                :disabled="klass.full || currentPoints < 1"
                :class="klass.full 
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                  : currentPoints < 1
                  ? 'bg-red-600 text-white cursor-not-allowed'
                  : 'bg-white hover:bg-gray-100 text-black transform hover:scale-105'"
                class="flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-200 shadow-sm"
                @click="bookClass(klass)"
              >
                {{ klass.full ? 'เต็มแล้ว' : currentPoints < 1 ? 'เครดิตไม่พอ' : 'จองเลย' }}
              </button>
              <button class="bg-gray-800 hover:bg-gray-700 text-white py-3 px-4 rounded-xl font-medium transition-colors duration-200">
                รายละเอียด
              </button>
            </div>
          </div>

          <!-- Status Bar -->
          <div :class="klass.full ? 'bg-red-500' : currentPoints < 1 ? 'bg-red-500' : 'bg-green-500'" class="h-1"></div>
        </div>
      </div>

      <!-- No Classes Available -->
      <div v-else class="text-center py-12">
        <div class="text-6xl mb-4">🧘‍♀️</div>
        <h3 class="text-xl font-semibold text-white mb-2">ไม่มีคลาสในวันนี้</h3>
        <p class="text-gray-400">ลองเลือกวันที่อื่นดูนะคะ</p>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const selectedDate = ref('2024-01-07') // Default to January 7

// Demo classes data for January 7, 8, 9
const classes = ref([
  // January 7, 2024
  {
    id: 1,
    name: 'Hatha Yoga',
    teacher: 'ครูสมศรี',
    time: '09:00 - 10:00',
    date: '2024-01-07',
    description: 'คลาสโยคะพื้นฐาน เหมาะสำหรับผู้เริ่มต้น',
    emoji: '🧘‍♀️',
    duration: '60 นาที',
    full: false
  },
  {
    id: 2,
    name: 'Vinyasa Flow',
    teacher: 'ครูมณี',
    time: '18:00 - 19:00',
    date: '2024-01-07',
    description: 'โยคะแบบไหลลื่น เชื่อมต่อท่าต่างๆ',
    emoji: '🌊',
    duration: '60 นาที',
    full: false
  },
  // January 8, 2024
  {
    id: 3,
    name: 'Power Yoga',
    teacher: 'ครูแอน',
    time: '07:00 - 08:00',
    date: '2024-01-08',
    description: 'โยคะแบบแข็งแกร่ง เน้นความแข็งแรง',
    emoji: '💪',
    duration: '60 นาที',
    full: false
  },
  {
    id: 4,
    name: 'Yin Yoga',
    teacher: 'ครูอารี',
    time: '19:00 - 20:00',
    date: '2024-01-08',
    description: 'โยคะแบบผ่อนคลาย เน้นการยืดเหยียด',
    emoji: '🌸',
    duration: '60 นาที',
    full: false
  },
  // January 9, 2024
  {
    id: 5,
    name: 'Ashtanga Yoga',
    teacher: 'ครูบี',
    time: '08:00 - 09:00',
    date: '2024-01-09',
    description: 'โยคะแบบดั้งเดิม ตามลำดับท่าที่แน่นอน',
    emoji: '🔥',
    duration: '60 นาที',
    full: false
  },
  {
    id: 6,
    name: 'Restorative Yoga',
    teacher: 'ครูซี',
    time: '17:00 - 18:00',
    date: '2024-01-09',
    description: 'โยคะแบบฟื้นฟู ใช้อุปกรณ์ช่วย',
    emoji: '🛏️',
    duration: '60 นาที',
    full: false
  }
])

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
  const startDate = new Date('2024-01-07')

  // Generate dates for January 7, 8, 9
  const demoDates = Array.from({ length: 30 }, (_, i) => {
  const date = new Date(startDate)
  date.setDate(date.getDate() + i)
  return date.toISOString().split('T')[0] // แปลงเป็นรูปแบบ YYYY-MM-DD
})

  demoDates.forEach(dateStr => {
    const date = new Date(dateStr)
    const day = date.toLocaleDateString('th-TH', { weekday: 'short' })
    const dateNum = date.getDate()
    options.push({
      value: dateStr,
      day,
      date: dateNum
    })
  })
  return options
})

const filteredClasses = computed(() => {
  return classes.value.filter(klass => klass.date === selectedDate.value)
})

// Get current points from localStorage
const currentPoints = computed(() => {
  const pointsHistory = JSON.parse(localStorage.getItem('black-yoga-points-history') || '[]')
  return pointsHistory.reduce((total, transaction) => {
    if (transaction.type === 'added') {
      return total + transaction.points
    } else {
      return total - transaction.points
    }
  }, 0)
})

const bookClass = (klass) => {
  if (klass.full) return
  
  // Check if user has enough credits
  if (currentPoints.value < 1) {
    alert('เครดิตไม่พอ กรุณาติดต่อแอดมินเพื่อเติมเครดิต')
    return
  }
  
  // Save booking to localStorage
  const bookings = JSON.parse(localStorage.getItem('black-yoga-bookings') || '[]')
  const newBooking = {
    id: Date.now(),
    classId: klass.id,
    className: klass.name,
    teacher: klass.teacher,
    time: klass.time,
    date: klass.date,
    emoji: klass.emoji,
    duration: klass.duration,
    status: 'confirmed',
    createdAt: new Date().toISOString()
  }
  bookings.push(newBooking)
  localStorage.setItem('black-yoga-bookings', JSON.stringify(bookings))
  
  // Deduct 1 point from credits
  const pointsHistory = JSON.parse(localStorage.getItem('black-yoga-points-history') || '[]')
  const creditTransaction = {
    id: `booking-${newBooking.id}`,
    type: 'used',
    points: 1,
    description: `จองคลาส ${klass.name}`,
    date: new Date().toISOString(),
    emoji: '📅'
  }
  pointsHistory.push(creditTransaction)
  localStorage.setItem('black-yoga-points-history', JSON.stringify(pointsHistory))
  
  // Update class to full
  klass.full = true
  
  // Show success message
  alert(`จองคลาส ${klass.name} สำเร็จแล้ว! (ใช้เครดิต 1 พอยต์)`)
  
  // Navigate to booking page
  router.push('/booking')
}

// Function to update class availability based on bookings
const updateClassAvailability = () => {
  // Reset all classes to available
  classes.value.forEach(klass => {
    klass.full = false
  })
  
  // Load existing bookings and mark classes as full
  const bookings = JSON.parse(localStorage.getItem('black-yoga-bookings') || '[]')
  bookings.forEach(booking => {
    const klass = classes.value.find(c => c.id === booking.classId)
    if (klass && booking.status !== 'cancelled') {
      klass.full = true
    }
  })
}

onMounted(() => {
  updateClassAvailability()
})

// Watch for changes in localStorage bookings
watch(() => localStorage.getItem('black-yoga-bookings'), () => {
  updateClassAvailability()
}, { deep: true })
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
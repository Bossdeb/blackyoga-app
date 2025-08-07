<template>
  <div class="min-h-screen bg-black">
    <!-- Header -->
    <header class="bg-gray-900 text-white shadow-lg border-b border-gray-800">
      <div class="max-w-md mx-auto px-6 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold">📅 การจองของฉัน</h1>
            <p class="text-gray-400 text-sm">จัดการการจองคลาสโยคะ</p>
          </div>
          <div class="bg-gray-800 rounded-full p-2">
            <span class="text-2xl">🎯</span>
          </div>
        </div>
      </div>
    </header>

    <!-- Stats Cards -->
    <div class="max-w-md mx-auto px-6 py-4">
      <div class="grid grid-cols-2 gap-4 mb-6">
        <div class="bg-gray-900 rounded-2xl p-4 shadow-lg border border-gray-800">
          <div class="text-center">
            <div class="text-3xl font-bold text-white">{{ activeBookings.length }}</div>
            <div class="text-sm text-gray-400">การจองที่กำลังดำเนินการ</div>
          </div>
        </div>
        <div class="bg-gray-900 rounded-2xl p-4 shadow-lg border border-gray-800">
          <div class="text-center">
            <div class="text-3xl font-bold text-white">{{ totalPoints }}</div>
            <div class="text-sm text-gray-400">แต้มสะสม</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Booking List -->
    <main class="max-w-md mx-auto px-6 pb-24">
      <div class="space-y-4">
        <div v-for="booking in activeBookings" :key="booking.id" 
             class="bg-gray-900 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-800 overflow-hidden">
          
          <div class="p-6">
            <!-- Booking Header -->
            <div class="flex items-start justify-between mb-4">
              <div class="flex-1">
                <h3 class="text-xl font-bold text-white mb-2">{{ booking.className }}</h3>
                <div class="flex items-center gap-2 text-sm text-gray-400 mb-2">
                  <span class="bg-gray-800 text-gray-300 px-2 py-1 rounded-full text-xs font-medium">
                    👩‍🏫 {{ booking.teacher }}
                  </span>
                  <span class="bg-gray-800 text-gray-300 px-2 py-1 rounded-full text-xs font-medium">
                    ⏰ {{ booking.time }}
                  </span>
                </div>
                <div class="text-sm text-gray-400">
                  <div>วันที่: {{ formatDate(booking.date) }}</div>
                  <div>สถานะ: 
                    <span :class="getStatusClass(booking.status)" class="font-medium">
                      {{ getStatusText(booking.status) }}
                    </span>
                  </div>
                </div>
              </div>
              <div class="text-right">
                <div class="text-2xl mb-1">{{ booking.emoji }}</div>
                <div class="text-xs text-gray-500">{{ booking.duration }}</div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex gap-3 mt-4">
              <button 
                v-if="booking.status === 'confirmed'"
                @click="cancelBooking(booking.id)"
                class="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-200 shadow-md transform hover:scale-105"
              >
                ยกเลิกการจอง
              </button>
              <button 
                v-else-if="booking.status === 'pending'"
                class="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-200 shadow-md"
              >
                รอการยืนยัน
              </button>
              <button 
                v-else
                class="flex-1 bg-gray-700 text-gray-400 py-3 px-4 rounded-xl font-semibold cursor-not-allowed"
              >
                {{ getStatusText(booking.status) }}
              </button>
              
              <button class="bg-gray-800 hover:bg-gray-700 text-white py-3 px-4 rounded-xl font-medium transition-colors duration-200">
                รายละเอียด
              </button>
            </div>
          </div>

          <!-- Status Bar -->
          <div :class="getStatusBarClass(booking.status)" class="h-1"></div>
        </div>

        <!-- Empty State -->
        <div v-if="activeBookings.length === 0" class="text-center py-12">
          <div class="text-6xl mb-4">📅</div>
          <h3 class="text-xl font-semibold text-white mb-2">ยังไม่มีรายการจอง</h3>
          <p class="text-gray-400 mb-6">ไปจองคลาสโยคะกันเลย!</p>
          <button 
            @click="$router.push('/')"
            class="bg-white hover:bg-gray-100 text-black px-6 py-3 rounded-xl font-semibold shadow-sm transition-all duration-200"
          >
            ดูคลาสที่มี
          </button>
        </div>

        <!-- Cancelled Bookings History -->
        <div v-if="cancelledBookings.length > 0" class="mt-8">
          <h3 class="text-lg font-semibold text-white mb-4">ประวัติการยกเลิก</h3>
          <div class="space-y-3">
            <div v-for="booking in cancelledBookings" :key="booking.id" 
                 class="bg-gray-800 rounded-xl p-4 border border-gray-700">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div class="text-xl">{{ booking.emoji }}</div>
                  <div>
                    <h4 class="text-white font-medium">{{ booking.className }}</h4>
                    <p class="text-sm text-gray-400">{{ formatDate(booking.date) }} - {{ booking.time }}</p>
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-red-400 text-sm font-medium">ยกเลิกแล้ว</div>
                  <div class="text-xs text-gray-500">ได้เครดิตคืน</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'

const bookings = ref([])

const activeBookings = computed(() => {
  return bookings.value.filter(booking => booking.status !== 'cancelled')
})

const cancelledBookings = computed(() => {
  return bookings.value.filter(booking => booking.status === 'cancelled')
})

const totalPoints = computed(() => {
  return activeBookings.value.length * 10 // 10 points per booking
})

const getStatusClass = (status) => {
  switch (status) {
    case 'confirmed':
      return 'text-green-400'
    case 'pending':
      return 'text-yellow-400'
    case 'cancelled':
      return 'text-red-400'
    default:
      return 'text-gray-400'
  }
}

const getStatusText = (status) => {
  switch (status) {
    case 'confirmed':
      return 'ยืนยันแล้ว'
    case 'pending':
      return 'รอการยืนยัน'
    case 'cancelled':
      return 'ยกเลิกแล้ว'
    default:
      return 'ไม่ทราบสถานะ'
  }
}

const getStatusBarClass = (status) => {
  switch (status) {
    case 'confirmed':
      return 'bg-green-500'
    case 'pending':
      return 'bg-yellow-500'
    case 'cancelled':
      return 'bg-red-500'
    default:
      return 'bg-gray-500'
  }
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const cancelBooking = (bookingId) => {
  if (confirm('คุณต้องการยกเลิกการจองนี้หรือไม่?\n\nเมื่อยกเลิกแล้วจะได้เครดิต 1 พอยต์คืน')) {
    const bookingIndex = bookings.value.findIndex(b => b.id === bookingId)
    if (bookingIndex !== -1) {
      const booking = bookings.value[bookingIndex]
      
      // Update booking status to cancelled
      bookings.value[bookingIndex].status = 'cancelled'
      localStorage.setItem('black-yoga-bookings', JSON.stringify(bookings.value))
      
      // Add points back to user's account
      const pointsHistory = JSON.parse(localStorage.getItem('black-yoga-points-history') || '[]')
      const refundTransaction = {
        id: `refund-${bookingId}-${Date.now()}`,
        type: 'added',
        points: 1,
        description: `คืนเครดิตจากการยกเลิกคลาส ${booking.className}`,
        date: new Date().toISOString(),
        emoji: '🔄'
      }
      
      pointsHistory.push(refundTransaction)
      localStorage.setItem('black-yoga-points-history', JSON.stringify(pointsHistory))
      
      // Update class availability - make it available again
      const allClasses = JSON.parse(localStorage.getItem('black-yoga-classes') || '[]')
      if (allClasses.length === 0) {
        // If no saved classes, we need to update the classes in HomePage
        // This will be handled when user navigates back to home
      }
      
      alert(`ยกเลิกการจองเรียบร้อยแล้ว!\n\n✅ ได้เครดิต 1 พอยต์คืนแล้ว\n📝 ดูประวัติได้ที่หน้า "แต้มเครดิต"`)
    }
  }
}

// Function to load bookings
const loadBookings = () => {
  const savedBookings = localStorage.getItem('black-yoga-bookings')
  if (savedBookings) {
    bookings.value = JSON.parse(savedBookings)
  }
}

onMounted(() => {
  loadBookings()
})

// Watch for changes in localStorage bookings
watch(() => localStorage.getItem('black-yoga-bookings'), () => {
  loadBookings()
}, { deep: true })
</script>
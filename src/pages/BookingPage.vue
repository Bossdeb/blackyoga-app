<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white text-gray-900 shadow-sm border-b border-gray-200">
      <div class="max-w-md mx-auto px-6 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold">📅 การจองของฉัน</h1>
            <p class="text-gray-500 text-sm">จัดการการจองคลาสโยคะ</p>
          </div>
          <div class="bg-gray-100 rounded-full p-2">
            <span class="text-2xl">🎯</span>
          </div>
        </div>
      </div>
    </header>

    <!-- Stats Cards -->
    <div class="max-w-md mx-auto px-6 py-4">
      <div class="grid grid-cols-2 gap-4 mb-6">
        <div class="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
          <div class="text-center">
            <div class="text-3xl font-bold text-gray-900">{{ activeBookings.length }}</div>
            <div class="text-sm text-gray-500">การจองที่กำลังดำเนินการ</div>
          </div>
        </div>

      </div>
    </div>


    <!-- Booking List -->
    <main class="max-w-md mx-auto px-6 pb-24">
      <!-- Loading State -->
      <div v-if="loading" class="space-y-4">
        <LoadingSkeleton type="booking-card" :count="3" />
      </div>

      <!-- Bookings Content -->
      <div v-else class="space-y-4">
        <div v-for="booking in activeBookings" :key="booking.id" 
             class="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 overflow-hidden">
          
          <div class="p-6">
            <!-- Booking Header -->
            <div class="flex items-start justify-between mb-4">
              <div class="flex-1">
                <h3 class="text-xl font-bold text-gray-900 mb-2">{{ booking.classData?.name }}</h3>
                <div class="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <span class="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-medium">
                    👩‍🏫 {{ booking.classData?.teacher }}
                  </span>
                  <span class="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-medium">
                    ⏰ {{ booking.classData?.startTime }} - {{ booking.classData?.endTime }}
                  </span>
                </div>
                <div class="text-sm text-gray-600">
                  <div>วันที่: {{ formatDate(booking.classData?.date) }}</div>
                  <div>สถานะ: 
                    <span :class="getStatusClass(booking.status)" class="font-medium">
                      {{ getStatusText(booking.status) }}
                    </span>
                    <div class="text-red-500 font-bold ">* สงวนสิทธิ์ในการยกเลิกล่วงหน้า 2 วัน ก่อนเริ่มคลาส</div>
                  </div>
                </div>
              </div>
              <div class="text-right">
                <div class="text-2xl mb-1">{{ booking.classData?.emoji || '🧘‍♀️' }}</div>
                <div class="text-xs text-gray-400">{{ booking.classData?.durationMinutes || 60 }} นาที</div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex gap-3 mt-4">
              
              <button 
                v-if="booking.status === 'confirmed'"
                @click="cancelBooking(booking.id)"
                class="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-200 shadow-sm"
              >
                ยกเลิกการจอง
              </button>
              <button 
                v-else-if="booking.status === 'pending'"
                class="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-200 shadow-sm"
              >
                รอการยืนยัน
              </button>
              <button 
                v-else
                class="flex-1 bg-gray-100 text-gray-400 py-3 px-4 rounded-xl font-semibold cursor-not-allowed"
              >
                {{ getStatusText(booking.status) }}
              </button>
              
              <button 
                @click="$router.push(`/class/${booking.classData?.id}`)"
                class="bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 py-3 px-4 rounded-xl font-medium transition-colors duration-200"
              >
                รายละเอียด
              </button>
            </div>
          </div>

          <!-- Status Bar -->
          <div :class="getStatusBarClass(booking.status)" class="h-1"></div>
        </div>

        <!-- Empty State -->
        <div v-if="!loading && activeBookings.length === 0" class="text-center py-12">
          <div class="text-6xl mb-4">📅</div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">ยังไม่มีรายการจอง</h3>
          <p class="text-gray-500 mb-6">ไปจองคลาสโยคะกันเลย!</p>
          <button 
            @click="$router.push('/')"
            class="bg-lineGreen hover:bg-green-600 text-white px-6 py-3 rounded-xl font-semibold shadow-sm transition-all duration-200"
          >
            ดูคลาสที่มี
          </button>
        </div>

        <!-- Cancelled Bookings History -->
        <div v-if="cancelledBookings.length > 0" class="mt-8">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">ประวัติการยกเลิก</h3>
          <div class="space-y-3">
            <div v-for="booking in cancelledBookings" :key="booking.id" 
                 class="bg-white rounded-xl p-4 border border-gray-200">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div class="text-xl">{{ booking.classData?.emoji || '🧘‍♀️' }}</div>
                  <div>
                    <h4 class="text-gray-900 font-medium">{{ booking.classData?.name }}</h4>
                    <p class="text-sm text-gray-500">{{ formatDate(booking.classData?.date) }} - {{ booking.classData?.startTime }}</p>
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-red-500 text-sm font-medium">ยกเลิกแล้ว</div>
                  <div class="text-xs text-gray-400">สำเร็จ</div>
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
import { useFirebase } from '../composables/useFirebase.js'
import { useToast } from 'vue-toastification'
import LoadingSkeleton from '../components/LoadingSkeleton.vue'

const { getUserBookings, cancelBooking: firebaseCancelBooking, user } = useFirebase()
const toast = useToast()

const bookings = ref([])
const loading = ref(true)

const activeBookings = computed(() => {
  return bookings.value.filter(booking => {
    if (booking.status === 'cancelled') return false
    
    // Hide classes that have already started
    if (booking.classData) {
      const now = new Date()
      const classDate = new Date(booking.classData.date.toDate ? booking.classData.date.toDate() : booking.classData.date)
      const [startHour, startMinute] = (booking.classData.startTime || '00:00').split(':').map(Number)
      
      const classStartTime = new Date(classDate)
      classStartTime.setHours(startHour, startMinute, 0, 0)
      
      return now < classStartTime
    }
    
    return true
  })
})

const cancelledBookings = computed(() => {
  return bookings.value
    .filter(booking => booking.status === 'cancelled')
    .slice(0, 3)
})

const getStatusClass = (status) => {
  switch (status) {
    case 'confirmed':
      return 'text-green-600'
    case 'pending':
      return 'text-yellow-600'
    case 'cancelled':
      return 'text-red-600'
    default:
      return 'text-gray-600'
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

const formatDate = (date) => {
  if (!date) return ''
  const dateObj = date.toDate ? date.toDate() : new Date(date)
  return dateObj.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const cancelBooking = async (bookingId) => {
  if (!confirm('สามารถยกเลิกได้ล่วงหน้า 2 วัน คุณต้องการยกเลิกการจองใช่หรือไม่ ?')) return
  
  try {
    await firebaseCancelBooking(bookingId)
    await loadBookings()
    toast.success('ยกเลิกการจองสำเร็จ')
  } catch (error) {
    toast.error(error.message || 'เกิดข้อผิดพลาดในการยกเลิก')
  }
}

const loadBookings = async () => {
  try {
    bookings.value = await getUserBookings()
  } catch (error) {
    console.error('Error loading bookings:', error)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await loadBookings()
})

// Reload when user becomes available
watch(() => user.value, async (newUser, oldUser) => {
  if (newUser?.lineId && !oldUser?.lineId) {
    await loadBookings()
  }
})
</script>
<template>
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <header class="bg-white shadow-sm border-b border-gray-200">
        <div class="px-6 py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <button 
                @click="$router.back()"
                class="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <span class="text-xl">←</span>
              </button>
              <div>
                <h1 class="text-xl font-bold text-gray-800">รายละเอียดคลาส</h1>
                <p class="text-gray-500 text-sm">ข้อมูลคลาสโยคะ</p>
              </div>
            </div>
            <div class="bg-gray-100 rounded-full p-2">
              <span class="text-2xl">{{ classData?.emoji || '🧘‍♀️' }}</span>
            </div>
          </div>
        </div>
      </header>
  
      <!-- Loading State -->
      <div v-if="loading" class="px-6 py-8">
        <LoadingSkeleton type="profile" />
      </div>
  
      <!-- Class Details -->
      <div v-else-if="classData" class="px-6 py-6">
        <!-- Class Header -->
        <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 mb-6">
          <div class="flex items-start justify-between mb-4">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-2">
                <h2 class="text-2xl font-bold text-gray-800">{{ classData.name }}</h2>
                <span v-if="classData.isFull" class="inline-flex items-center gap-1 bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-semibold">
                  เต็มแล้ว
                </span>
              </div>
              <p class="text-gray-600 text-lg">{{ classData.description }}</p>
            </div>
            <div class="text-right">
              <div class="text-4xl mb-2">{{ classData.emoji || '🧘‍♀️' }}</div>
              <div class="text-sm text-gray-400">{{ classData.durationMinutes || 60 }} นาที</div>
            </div>
          </div>
  
          <!-- Class Stats -->
          <div class="grid grid-cols-2 gap-4 mb-6">
            <div class="bg-gray-50 rounded-xl p-4">
              <div class="text-center">
                <div class="text-2xl font-bold text-gray-900">{{ classData.bookedCount || 0 }}</div>
                <div class="text-sm text-gray-500">จองแล้ว</div>
              </div>
            </div>
            <div class="bg-gray-50 rounded-xl p-4">
              <div class="text-center">
                <div class="text-2xl font-bold text-gray-900">{{ classData.capacity || 10 }}</div>
                <div class="text-sm text-gray-500">ความจุ</div>
              </div>
            </div>
          </div>
  
          <!-- Progress Bar -->
          <div class="mb-4">
            <div class="flex justify-between text-sm text-gray-600 mb-2">
              <span>อัตราการจอง</span>
              <span>{{ Math.round(((classData.bookedCount || 0) / (classData.capacity || 10)) * 100) }}%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-3">
              <div 
                class="bg-lineGreen h-3 rounded-full transition-all duration-300"
                :style="{ width: `${Math.min(((classData.bookedCount || 0) / (classData.capacity || 10)) * 100, 100)}%` }"
              ></div>
            </div>
          </div>
        </div>
  
        <!-- Class Information -->
        <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 mb-6">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">ข้อมูลคลาส</h3>
          
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span class="text-blue-600 text-lg">👩‍🏫</span>
                </div>
                <div>
                  <div class="text-sm text-gray-500">ครูผู้สอน</div>
                  <div class="font-medium text-gray-800">{{ classData.teacher }}</div>
                </div>
              </div>
            </div>
  
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <span class="text-green-600 text-lg">📅</span>
                </div>
                <div>
                  <div class="text-sm text-gray-500">วันที่</div>
                  <div class="font-medium text-gray-800">{{ formatDate(classData.date) }}</div>
                </div>
              </div>
            </div>
  
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div class="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <span class="text-purple-600 text-lg">⏰</span>
                </div>
                <div>
                  <div class="text-sm text-gray-500">เวลา</div>
                  <div class="font-medium text-gray-800">{{ classData.startTime }} - {{ classData.endTime }}</div>
                </div>
              </div>
            </div>
  
                       <div class="flex items-center justify-between">
               <div class="flex items-center space-x-3">
                 <div class="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                   <span class="text-orange-600 text-lg">💰</span>
                 </div>
                 <div>
                   <div class="text-sm text-gray-500">ค่าใช้จ่าย</div>
                   <div class="font-medium text-gray-800">10 พอยต์</div>
                 </div>
               </div>
             </div>
  
             <div class="flex items-center justify-between">
               <div class="flex items-center space-x-3">
                 <div class="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                   <span class="text-indigo-600 text-lg">📊</span>
                 </div>
                 <div>
                   <div class="text-sm text-gray-500">สถานะ</div>
                   <div class="font-medium text-gray-800">
                     <span v-if="classData.isFull" class="text-red-600">เต็มแล้ว</span>
                     <span v-else class="text-green-600">ว่าง</span>
                   </div>
                 </div>
               </div>
             </div>
          </div>
        </div>
  
        <!-- Booking Rules -->
        <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 mb-6">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">กติกาการจอง</h3>
          <div class="space-y-3 text-sm text-gray-600">
            <div class="flex items-start space-x-3">
              <span class="text-lineGreen mt-0.5">•</span>
              <span>จองล่วงหน้าได้ไม่เกิน 1 วัน</span>
            </div>
            <div class="flex items-start space-x-3">
              <span class="text-lineGreen mt-0.5">•</span>
              <span>ยกเลิกได้ถึง 3 ชั่วโมงก่อนเริ่มคลาส</span>
            </div>
            <div class="flex items-start space-x-3">
              <span class="text-lineGreen mt-0.5">•</span>
              <span>จะได้พอยต์คืนเมื่อยกเลิกการจอง</span>
            </div>
            <div class="flex items-start space-x-3">
              <span class="text-lineGreen mt-0.5">•</span>
              <span>ไม่สามารถจองซ้ำได้หากมีจองอยู่แล้ว</span>
            </div>
          </div>
        </div>
  
        <!-- Action Buttons -->
        <div class="space-y-3">
          <button 
            v-if="!classData.isFull"
            :disabled="currentPoints < 10 || bookingInProgress"
            :class="currentPoints < 10 
              ? 'bg-red-500 text-white cursor-not-allowed' 
              : bookingInProgress
              ? 'bg-yellow-500 text-white cursor-not-allowed'
              : 'bg-lineGreen hover:bg-green-600 text-white transform hover:scale-105'"
            class="w-full py-4 px-6 rounded-xl font-semibold transition-all duration-200 shadow-sm"
            @click="bookClass"
          >
            {{ 
              currentPoints < 10 ? 'พอยต์ไม่เพียงพอ (ต้องมี 10 พอยต์)' : 
              bookingInProgress ? 'กำลังจอง...' : 
              'จองคลาสนี้เลย' 
            }}
          </button>
          
          <button 
            v-else
            class="w-full py-4 px-6 rounded-xl font-semibold bg-gray-100 text-gray-400 cursor-not-allowed"
          >
            คลาสเต็มแล้ว
          </button>
  
          <button 
            @click="$router.push('/')"
            class="w-full py-3 px-6 rounded-xl font-medium bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 transition-colors duration-200"
          >
            ดูคลาสอื่น
          </button>
        </div>
      </div>
  
      <!-- Error State -->
      <div v-else class="px-6 py-12 text-center">
        <div class="text-6xl mb-4">😕</div>
        <h3 class="text-xl font-semibold text-gray-800 mb-2">ไม่พบข้อมูลคลาส</h3>
        <p class="text-gray-500 mb-6">คลาสนี้อาจถูกลบหรือไม่สามารถเข้าถึงได้</p>
        <button 
          @click="$router.push('/')"
          class="bg-lineGreen hover:bg-green-600 text-white px-6 py-3 rounded-xl font-semibold shadow-sm transition-all duration-200"
        >
          กลับไปหน้าหลัก
        </button>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { useFirebase } from '../composables/useFirebase.js'
  import LoadingSkeleton from '../components/LoadingSkeleton.vue'
  
  const route = useRoute()
  const router = useRouter()
  const { getClassById, createBooking, getUserPoints, user } = useFirebase()
  
  const classData = ref(null)
  const currentPoints = ref(0)
  const loading = ref(true)
  const bookingInProgress = ref(false)
  
  const formatDate = (date) => {
    if (!date) return ''
    const dateObj = date.toDate ? date.toDate() : new Date(date)
    return dateObj.toLocaleDateString('th-TH', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }
  
  const bookClass = async () => {
    if (classData.value.isFull || bookingInProgress.value) return
    
    bookingInProgress.value = true
    
    try {
      await createBooking(classData.value.id)
      alert(`จองคลาส ${classData.value.name} สำเร็จแล้ว! (ใช้พอยต์ 10)`) 
      router.push('/booking')
    } catch (error) {
      if (error.message.includes('คลาสเต็มแล้ว')) {
        alert('ขออภัย คลาสเต็มแล้ว กรุณาลองใหม่')
        await loadClassData() // Refresh data
      } else {
        alert(error.message || 'เกิดข้อผิดพลาดในการจอง')
      }
    } finally {
      bookingInProgress.value = false
    }
  }
  
  const loadClassData = async () => {
    try {
      const classId = route.params.id
      if (!classId) {
        throw new Error('Class ID not found')
      }
      
      classData.value = await getClassById(classId)
    } catch (error) {
      console.error('Error loading class data:', error)
      classData.value = null
    } finally {
      loading.value = false
    }
  }
  
  const loadCurrentPoints = async () => {
    try {
      currentPoints.value = await getUserPoints()
    } catch (error) {
      console.error('Error loading points:', error)
    }
  }
  
  onMounted(async () => {
    await Promise.all([loadClassData(), loadCurrentPoints()])
  })
  </script>
  
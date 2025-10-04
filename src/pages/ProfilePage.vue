<template>
  <div class="min-h-screen bg-gray-50" @touchstart="handleTouchStart" @touchmove="handleTouchMove" @touchend="handleTouchEnd">
    <!-- Header -->
    <header class="bg-white text-gray-900 shadow-sm border-b border-gray-200">
      <div class="max-w-md mx-auto px-6 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold">👤 โปรไฟล์</h1>
            <p class="text-gray-500 text-sm">จัดการข้อมูลส่วนตัว</p>
            <p class="text-xs text-gray-400 mt-1">{{ formatRefreshTime }}</p>
          </div>
          <div class="flex items-center gap-2">
            <!-- Refresh Button -->
            <button 
              @click="refreshData"
              :disabled="isRefreshing || isLoading('refresh')"
              class="bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition-colors duration-200 disabled:opacity-50"
              title="รีเฟรชข้อมูล"
            >
              <span 
                class="text-xl"
                :class="{ 'animate-spin': isRefreshing || isLoading('refresh') }"
              >
                {{ isRefreshing || isLoading('refresh') ? '🔄' : '↻' }}
              </span>
            </button>
            <div class="bg-gray-100 rounded-full p-2">
              <span class="text-2xl">⚙️</span>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- User Profile -->
    <div class="max-w-md mx-auto px-6 py-4">
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <div class="flex items-center gap-4 mb-6">
          <img v-if="user?.pictureUrl" :src="user.pictureUrl" class="w-16 h-16 rounded-full border-2 border-gray-200" />
          <div v-else class="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
            <span class="text-2xl text-gray-500">👤</span>
          </div>
          <div class="flex-1">
            <h2 v-if="!user" class="h-6 w-32 bg-gray-200 rounded animate-pulse"></h2>
            <h2 v-else class="text-xl font-bold text-gray-900">{{ (user?.nickname || '') + (user?.firstName ? ' ' + user.firstName : '') || 'User' }}</h2>
            <p class="text-gray-500 text-sm">LINE User</p>
            <div class="flex items-center gap-2 mt-1">
              <span class="bg-lineGreen text-white px-2 py-0.5 rounded-full text-xs font-medium">
                {{ user?.role === 'admin' ? 'แอดมิน' : 'สมาชิก' }}
              </span>
            </div>
          </div>
        </div>

        <!-- User Info -->
        <div class="space-y-3">
          <div class="flex justify-between items-center py-2 border-b border-gray-100">
            <span class="text-gray-600">ชื่อเล่น:</span>
            <span class="text-gray-900 font-medium">{{ user?.nickname || '-' }}</span>
          </div>
          <div class="flex justify-between items-center py-2 border-b border-gray-100">
            <span class="text-gray-600">ชื่อจริง:</span>
            <span class="text-gray-900 font-medium">{{ user?.firstName || '-' }}</span>
          </div>
          <div class="flex justify-between items-center py-2 border-b border-gray-100">
            <span class="text-gray-600">นามสกุล:</span>
            <span class="text-gray-900 font-medium">{{ user?.lastName || '-' }}</span>
          </div>
          <div class="flex justify-between items-center py-2 border-b border-gray-100">
            <span class="text-gray-600">เบอร์โทร:</span>
            <span class="text-gray-900 font-medium">{{ user?.phone || '-' }}</span>
          </div>

        </div>
      </div>

      <!-- Membership Status Card -->
      <div v-if="user" class="mt-4 bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
        <div class="text-center">
          <div class="text-lg font-semibold text-gray-900 mb-2">สถานะสมาชิก</div>
          <div v-if="user.membershipExpireAt" class="text-2xl font-bold mb-2" :class="isExpired ? 'text-red-600' : 'text-green-600'">
            {{ formatDate(user.membershipExpireAt) }}
          </div>
          <div v-else class="text-lg font-bold text-red-600 mb-2">ไม่มีสิทธิ์สมาชิก</div>
          
          <div v-if="isExpired" class="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-3">
            สมาชิกของคุณหมดอายุแล้ว
          </div>
          <div v-else-if="!user.membershipExpireAt" class="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-3">
            คุณยังไม่มีสิทธิ์สมาชิก กรุณาติดต่อแอดมิน
          </div>
          <div v-else class="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl p-3">
            สมาชิกของคุณยังใช้งานได้
          </div>
        </div>
        </div>
      </div>
    </div>

    <!-- Quick Stats -->
    <div class="max-w-md mx-auto px-6 py-4">
      <div class="grid grid-cols-2 gap-4">
        <div class="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
          <div class="text-center">
            <div v-if="isLoading('userStats')" class="h-8 w-16 bg-gray-200 rounded animate-pulse mx-auto mb-2"></div>
            <div v-else class="text-2xl font-bold text-gray-900">{{ totalBookings }}</div>
            <div class="text-sm text-gray-500">การจองทั้งหมด</div>
          </div>
        </div>
        <div class="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
          <div class="text-center">
            <div v-if="isLoading('userStats')" class="h-8 w-16 bg-gray-200 rounded animate-pulse mx-auto mb-2"></div>
            <div v-else class="text-2xl font-bold text-gray-900">{{ activeBookings }}</div>
            <div class="text-sm text-gray-500">การจองที่กำลังดำเนินการ</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Menu Options -->
    <main class="max-w-md mx-auto px-6 pb-24">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">ตัวเลือก</h3>
      
      <div class="space-y-3">
        <div v-for="menuItem in menuItems" :key="menuItem.id" 
             class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          
          <button 
            @click="handleMenuAction(menuItem.action)"
            class="w-full p-4 text-left hover:bg-gray-50 transition-colors duration-200"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="text-2xl">{{ menuItem.emoji }}</div>
                <div>
                  <h4 class="text-gray-900 font-medium">{{ menuItem.title }}</h4>
                  <p class="text-sm text-gray-500">{{ menuItem.description }}</p>
                </div>
              </div>
              <div class="text-gray-400">
                <span class="text-lg">→</span>
              </div>
            </div>
          </button>
        </div>
      </div>
    </main>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useFirebase } from '../composables/useFirebase.js'
import { useAppState } from '../composables/useAppState.js'
import { useLoading } from '../composables/useLoading.js'
import { useUserCache } from '../composables/useUserCache.js'
import { useToast } from 'vue-toastification'

const router = useRouter()
const toast = useToast()
const { user, signOut, refreshCurrentUser } = useFirebase()
const { userBookings, loadUserBookings, refreshUserBookings } = useAppState()
const { isLoading, setLoading, clearLoading } = useLoading()
const { getUserDataWithRefresh, isUserDataFresh } = useUserCache()

// Removed points system
const totalBookings = ref(0)
const activeBookings = ref(0)
const lastRefreshTime = ref(null)
const isRefreshing = ref(false)

// Pull to refresh
const pullToRefresh = ref({
  startY: 0,
  currentY: 0,
  isPulling: false,
  threshold: 80
})

const isExpired = computed(() => {
  if (!user.value?.membershipExpireAt) return false
  const ts = user.value.membershipExpireAt
  const date = ts.toDate ? ts.toDate() : new Date(ts)
  return new Date() > date
})

const menuItems = ref([
  {
    id: 1,
    title: 'แก้ไขโปรไฟล์',
    description: 'เปลี่ยนข้อมูลส่วนตัว',
    emoji: '✏️',
    action: 'edit-profile'
  },
  
  {
    id: 3,
    title: 'ช่วยเหลือ',
    description: 'คู่มือการใช้งาน',
    emoji: '❓',
    action: 'help'
  },
  {
    id: 4,
    title: 'เกี่ยวกับ',
    description: 'ข้อมูลแอปพลิเคชัน',
    emoji: 'ℹ️',
    action: 'about'
  }
])

const handleMenuAction = (action) => {
  switch (action) {
    case 'edit-profile':
      router.push('/profile/edit')
      break
    case 'help':
      router.push('/help')
      break
    case 'about':
      alert('Pitch YOGA v1.0.0\n\nแอปพลิเคชันจองคลาสโยคะ\nพัฒนาโดยทีม Pitch YOGA')
      break
  }
}

const handleLogout = async () => {
  if (!confirm('ยืนยันการออกจากระบบ?')) return
  
  try {
    await signOut()
    router.push('/login')
  } catch (error) {
    console.error('Logout error:', error)
    alert('เกิดข้อผิดพลาดในการออกจากระบบ')
  }
}

const loadUserStats = async (forceRefresh = false) => {
  try {
    setLoading('userStats', true)
    
    // ใช้ข้อมูลจาก cache ก่อน แล้วค่อย refresh
    const bookings = await loadUserBookings(forceRefresh)
    
    totalBookings.value = bookings.length
    activeBookings.value = bookings.filter(b => b.status === 'confirmed').length
    lastRefreshTime.value = new Date()
    
  } catch (error) {
    console.error('Error loading user stats:', error)
  } finally {
    clearLoading('userStats')
  }
}

const refreshData = async () => {
  if (isRefreshing.value) return
  
  try {
    isRefreshing.value = true
    setLoading('refresh', true)
    
    // Refresh user data และ booking data
    await Promise.all([
      getUserDataWithRefresh(),
      refreshUserBookings()
    ])
    
    // Reload stats
    await loadUserStats(true)
    
    // แสดง toast notification
    toast.success('อัพเดตข้อมูลเรียบร้อยแล้ว', {
      timeout: 2000,
      position: 'top-center'
    })
    
  } catch (error) {
    console.error('Error refreshing data:', error)
    toast.error('เกิดข้อผิดพลาดในการอัพเดตข้อมูล', {
      timeout: 3000,
      position: 'top-center'
    })
  } finally {
    isRefreshing.value = false
    clearLoading('refresh')
  }
}

const formatRefreshTime = computed(() => {
  if (!lastRefreshTime.value) return 'ยังไม่เคยอัพเดต'
  
  const now = new Date()
  const diff = now - lastRefreshTime.value
  const minutes = Math.floor(diff / 60000)
  
  if (minutes < 1) return 'เพิ่งอัพเดต'
  if (minutes < 60) return `อัพเดตเมื่อ ${minutes} นาทีที่แล้ว`
  
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `อัพเดตเมื่อ ${hours} ชั่วโมงที่แล้ว`
  
  return lastRefreshTime.value.toLocaleString('th-TH')
})

const formatDate = (timestamp) => {
  if (!timestamp) return ''
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return date.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Auto refresh every 5 minutes
let refreshInterval = null

onMounted(async () => {
  // โหลดข้อมูลจาก cache ก่อน (เร็ว)
  await loadUserStats(false)
  
  // ตั้งค่า auto refresh ทุก 5 นาที
  refreshInterval = setInterval(() => {
    refreshData()
  }, 5 * 60 * 1000) // 5 minutes
})

// Cleanup interval when component unmounts
onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
})

// Pull to refresh handlers
const handleTouchStart = (e) => {
  if (window.scrollY === 0) {
    pullToRefresh.value.startY = e.touches[0].clientY
    pullToRefresh.value.isPulling = true
  }
}

const handleTouchMove = (e) => {
  if (!pullToRefresh.value.isPulling) return
  
  pullToRefresh.value.currentY = e.touches[0].clientY
  const deltaY = pullToRefresh.value.currentY - pullToRefresh.value.startY
  
  if (deltaY > 0 && window.scrollY === 0) {
    e.preventDefault()
  }
}

const handleTouchEnd = (e) => {
  if (!pullToRefresh.value.isPulling) return
  
  const deltaY = pullToRefresh.value.currentY - pullToRefresh.value.startY
  
  if (deltaY > pullToRefresh.value.threshold && window.scrollY === 0) {
    refreshData()
  }
  
  pullToRefresh.value.isPulling = false
  pullToRefresh.value.startY = 0
  pullToRefresh.value.currentY = 0
}

// Watch for user changes to reload stats
watch(user, () => {
  if (user.value) {
    loadUserStats(false)
  }
}, { immediate: true })
</script>
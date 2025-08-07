<template>
  <div class="min-h-screen bg-black">
    <!-- Header -->
    <header class="bg-gray-900 text-white shadow-lg border-b border-gray-800">
      <div class="max-w-md mx-auto px-6 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold">👤 โปรไฟล์</h1>
            <p class="text-gray-400 text-sm">จัดการข้อมูลส่วนตัว</p>
          </div>
          
        </div>
      </div>
    </header>

    <!-- Profile Info -->
    <div class="max-w-md mx-auto px-6 py-4">
      <div class="bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-800 mb-6">
        <div class="text-center mb-6">
          <!-- Profile Picture -->
          <div class="mb-4">
            <img 
              v-if="user?.pictureUrl" 
              :src="user.pictureUrl" 
              :alt="user.name"
              class="w-20 h-20 rounded-full mx-auto border-2 border-gray-700"
            />
            <div v-else class="text-6xl mb-4">{{ user?.avatar || '👤' }}</div>
          </div>
          
          <h2 class="text-2xl font-bold text-white mb-2">{{ user?.name || 'Demo User' }}</h2>
          
          <!-- LINE Status Message -->
          <p v-if="user?.statusMessage" class="text-sm text-gray-500 italic">
            "{{ user.statusMessage }}"
          </p>
          
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-2 gap-4 mb-6">
          <div class="text-center">
            <div class="text-2xl font-bold text-white">{{ totalBookings }}</div>
            <div class="text-sm text-gray-400">คลาสที่จอง</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-white">{{ totalPoints }}</div>
            <div class="text-sm text-gray-400">แต้มสะสม</div>
          </div>
        </div>

        <!-- Member Since -->
        <div class="text-center">
          <div class="text-sm text-gray-400">สมาชิกตั้งแต่</div>
          <div class="text-white font-medium">{{ memberSince }}</div>
        </div>
      </div>
    </div>

    <!-- Menu Items -->
    <main class="max-w-md mx-auto px-6 pb-24">
      <div class="space-y-4">
        <div v-for="item in menuItems" :key="item.id" 
             class="bg-gray-900 rounded-xl shadow-sm border border-gray-800 overflow-hidden">
          
          <button 
            @click="handleMenuClick(item.action)"
            class="w-full p-4 text-left hover:bg-gray-800 transition-colors duration-200"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="text-2xl">{{ item.emoji }}</div>
                <div>
                  <h4 class="text-white font-medium">{{ item.title }}</h4>
                  <p class="text-sm text-gray-400">{{ item.description }}</p>
                </div>
              </div>
              <div class="text-gray-400">
                <span class="text-lg">→</span>
              </div>
            </div>
          </button>
        </div>
      </div>

      <!-- Logout Button -->
      <div class="mt-8">
        <button 
          @click="logout"
          :disabled="loggingOut"
          class="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-200 shadow-lg"
        >
          {{ loggingOut ? 'กำลังออกจากระบบ...' : 'ออกจากระบบ' }}
        </button>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'

const router = useRouter()
const { user, signOut } = useAuth()
const loggingOut = ref(false)

const totalBookings = ref(0)
const totalPoints = ref(0)
const memberSince = ref('')

const menuItems = ref([
  {
    id: 1,
    title: 'แก้ไขโปรไฟล์',
    description: 'เปลี่ยนข้อมูลส่วนตัว',
    emoji: '✏️',
    action: 'edit-profile'
  },
  {
    id: 2,
    title: 'การตั้งค่า',
    description: 'จัดการการแจ้งเตือนและความเป็นส่วนตัว',
    emoji: '⚙️',
    action: 'settings'
  },
  {
    id: 3,
    title: 'ช่วยเหลือ',
    description: 'คำถามที่พบบ่อยและการสนับสนุน',
    emoji: '❓',
    action: 'help'
  },
  {
    id: 4,
    title: 'เกี่ยวกับเรา',
    description: 'ข้อมูลแอปพลิเคชันและทีมพัฒนา',
    emoji: 'ℹ️',
    action: 'about'
  }
])

const handleMenuClick = (action) => {
  switch (action) {
    case 'edit-profile':
      alert('ฟีเจอร์นี้จะเปิดให้ใช้งานเร็วๆ นี้')
      break
    case 'settings':
      alert('ฟีเจอร์นี้จะเปิดให้ใช้งานเร็วๆ นี้')
      break
    case 'help':
      alert('ฟีเจอร์นี้จะเปิดให้ใช้งานเร็วๆ นี้')
      break
    case 'about':
      alert('Black Yoga - แอปพลิเคชันจองคลาสโยคะ\nเวอร์ชัน: 1.0.0\nสำหรับการแสดงผลเท่านั้น')
      break
  }
}

const logout = async () => {
  if (confirm('คุณต้องการออกจากระบบหรือไม่?')) {
    loggingOut.value = true
    try {
      await signOut()
      // Redirect to login page
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
      // Still redirect to login page even if there's an error
      router.push('/login')
    } finally {
      loggingOut.value = false
    }
  }
}

onMounted(() => {
  // Load bookings count from localStorage
  const bookings = JSON.parse(localStorage.getItem('black-yoga-bookings') || '[]')
  totalBookings.value = bookings.filter(booking => booking.status !== 'cancelled').length

  // Calculate total points from points history
  const pointsHistory = JSON.parse(localStorage.getItem('black-yoga-points-history') || '[]')
  totalPoints.value = pointsHistory.reduce((total, transaction) => {
    if (transaction.type === 'earned') {
      return total + transaction.points
    } else {
      return total - transaction.points
    }
  }, 0)

  // Set member since date
  const today = new Date()
  memberSince.value = today.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
})
</script>
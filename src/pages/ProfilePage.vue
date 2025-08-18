<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white text-gray-900 shadow-sm border-b border-gray-200">
      <div class="max-w-md mx-auto px-6 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold">👤 โปรไฟล์</h1>
            <p class="text-gray-500 text-sm">จัดการข้อมูลส่วนตัว</p>
          </div>
          <div class="bg-gray-100 rounded-full p-2">
            <span class="text-2xl">⚙️</span>
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
          <div class="flex justify-between items-center py-2">
             <span class="text-gray-600">พอยต์ในกระเป๋า:</span>
             <span v-if="!user" class="h-5 w-16 bg-gray-200 rounded animate-pulse"></span>
             <span v-else class="text-gray-900 font-medium">{{ currentPoints }} พอยต์</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Stats -->
    <div class="max-w-md mx-auto px-6 py-4">
      <div class="grid grid-cols-2 gap-4">
        <div class="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
          <div class="text-center">
            <div class="text-2xl font-bold text-gray-900">{{ totalBookings }}</div>
            <div class="text-sm text-gray-500">การจองทั้งหมด</div>
          </div>
        </div>
        <div class="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
          <div class="text-center">
            <div class="text-2xl font-bold text-gray-900">{{ activeBookings }}</div>
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
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useFirebase } from '../composables/useFirebase.js'

const router = useRouter()
const { user, signOut, getUserBookings, getUserPoints } = useFirebase()

const currentPoints = ref(0)
const totalBookings = ref(0)
const activeBookings = ref(0)

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
    description: 'ตั้งค่าแอปพลิเคชัน',
    emoji: '⚙️',
    action: 'settings'
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
      alert('ฟีเจอร์แก้ไขโปรไฟล์จะเปิดให้ใช้งานเร็วๆ นี้')
      break
    case 'settings':
      alert('ฟีเจอร์การตั้งค่าจะเปิดให้ใช้งานเร็วๆ นี้')
      break
    case 'help':
      alert('ฟีเจอร์ช่วยเหลือจะเปิดให้ใช้งานเร็วๆ นี้')
      break
    case 'about':
      alert('BLACK YOGA v1.0.0 — แอปจองคลาสโยคะ โดยทีม BLACK YOGA')
      break
  }
}

const handleLogout = async () => {

  const ok = await confirmToast('ยืนยันการออกจากระบบ?', { okText: 'ออกจากระบบ', cancelText: 'ยกเลิก' })
  if (!ok) return
  
  try {
    await signOut()
    router.push('/login')
  } catch (error) {
    console.error('Logout error:', error)
    toast.error('เกิดข้อผิดพลาดในการออกจากระบบ')
  }
}

const loadUserStats = async () => {
  try {
    const bookings = await getUserBookings()
    totalBookings.value = bookings.length
    activeBookings.value = bookings.filter(b => b.status === 'confirmed').length
    currentPoints.value = await getUserPoints()
  } catch (error) {
    console.error('Error loading user stats:', error)
  }
}

onMounted(async () => {
  await loadUserStats()
})

// Keep points in sync with user state for better UX
watch(() => user.value?.points, async () => {
  currentPoints.value = await getUserPoints()
})
</script>
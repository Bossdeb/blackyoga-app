<template>
  <div class="min-h-screen bg-black">
    <!-- Header -->
    <header class="bg-gray-900 text-white shadow-lg border-b border-gray-800">
      <div class="max-w-md mx-auto px-6 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold">⚙️ แอดมิน</h1>
            <p class="text-gray-400 text-sm">จัดการระบบและข้อมูล</p>
          </div>
          <div class="bg-gray-800 rounded-full p-2">
            <span class="text-2xl">🔧</span>
          </div>
        </div>
      </div>
    </header>

    <!-- Admin Stats -->
    <div class="max-w-md mx-auto px-6 py-4">
      <div class="grid grid-cols-2 gap-4 mb-6">
        <div class="bg-gray-900 rounded-2xl p-4 shadow-lg border border-gray-800">
          <div class="text-center">
            <div class="text-2xl font-bold text-white">{{ totalBookings }}</div>
            <div class="text-sm text-gray-400">การจองทั้งหมด</div>
          </div>
        </div>
        <div class="bg-gray-900 rounded-2xl p-4 shadow-lg border border-gray-800">
          <div class="text-center">
            <div class="text-2xl font-bold text-white">{{ totalUsers }}</div>
            <div class="text-sm text-gray-400">ผู้ใช้ทั้งหมด</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Admin Actions -->
    <main class="max-w-md mx-auto px-6 pb-24">
      <h3 class="text-lg font-semibold text-white mb-4">การจัดการระบบ</h3>
      
      <div class="space-y-4">
        <div v-for="action in adminActions" :key="action.id" 
             class="bg-gray-900 rounded-xl shadow-sm border border-gray-800 overflow-hidden">
          
          <button 
            @click="handleAdminAction(action.action)"
            class="w-full p-4 text-left hover:bg-gray-800 transition-colors duration-200"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="text-2xl">{{ action.emoji }}</div>
                <div>
                  <h4 class="text-white font-medium">{{ action.title }}</h4>
                  <p class="text-sm text-gray-400">{{ action.description }}</p>
                </div>
              </div>
              <div class="text-gray-400">
                <span class="text-lg">→</span>
              </div>
            </div>
          </button>
        </div>
      </div>

      <!-- System Info -->
      <div class="mt-8 bg-gray-900 rounded-xl p-4 border border-gray-800">
        <h4 class="text-white font-medium mb-3">ข้อมูลระบบ</h4>
        <div class="space-y-2 text-sm">
          <div class="flex justify-between">
            <span class="text-gray-400">เวอร์ชัน:</span>
            <span class="text-white">1.0.0</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-400">สถานะ:</span>
            <span class="text-green-400">ออนไลน์</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-400">โหมด:</span>
            <span class="text-yellow-400">Demo</span>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const totalBookings = ref(0)
const totalUsers = ref(1)

const adminActions = ref([
  {
    id: 1,
    title: 'จัดการคลาส',
    description: 'เพิ่ม แก้ไข หรือลบคลาสโยคะ',
    emoji: '📚',
    action: 'manage-classes'
  },
  {
    id: 2,
    title: 'ดูรายงาน',
    description: 'สถิติการจองและรายได้',
    emoji: '📊',
    action: 'view-reports'
  },
  {
    id: 3,
    title: 'จัดการผู้ใช้',
    description: 'ดูรายชื่อผู้ใช้และสิทธิ์',
    emoji: '👥',
    action: 'manage-users'
  },
  {
    id: 4,
    title: 'ตั้งค่าระบบ',
    description: 'การตั้งค่าทั่วไปของแอป',
    emoji: '⚙️',
    action: 'system-settings'
  },
  {
    id: 5,
    title: 'ตั้งแต้ม = 100',
    description: 'เพิ่มเครดิตให้ผู้ใช้เป็น 100 พอยต์',
    emoji: '💰',
    action: 'set-points-100'
  },
  {
    id: 6,
    title: 'ล้างข้อมูล',
    description: 'ล้างข้อมูลทั้งหมด (Demo)',
    emoji: '🗑️',
    action: 'clear-data'
  }
])

const handleAdminAction = (action) => {
  switch (action) {
    case 'manage-classes':
      alert('ฟีเจอร์จัดการคลาสจะเปิดให้ใช้งานเร็วๆ นี้')
      break
    case 'view-reports':
      alert('ฟีเจอร์ดูรายงานจะเปิดให้ใช้งานเร็วๆ นี้')
      break
    case 'manage-users':
      alert('ฟีเจอร์จัดการผู้ใช้จะเปิดให้ใช้งานเร็วๆ นี้')
      break
    case 'system-settings':
      alert('ฟีเจอร์ตั้งค่าระบบจะเปิดให้ใช้งานเร็วๆ นี้')
      break
    case 'set-points-100':
      if (confirm('คุณต้องการตั้งแต้มให้ผู้ใช้เป็น 100 พอยต์หรือไม่?')) {
        // Get current points history
        const pointsHistory = JSON.parse(localStorage.getItem('black-yoga-points-history') || '[]')
        
        // Calculate current points
        const currentPoints = pointsHistory.reduce((total, transaction) => {
          if (transaction.type === 'added') {
            return total + transaction.points
          } else {
            return total - transaction.points
          }
        }, 0)
        
        // Calculate how many points to add to reach 100
        const pointsToAdd = 100 - currentPoints
        
        if (pointsToAdd > 0) {
          // Add new transaction
          const newTransaction = {
            id: `admin-set-${Date.now()}`,
            type: 'added',
            points: pointsToAdd,
            description: 'แอดมินเพิ่มเครดิต (ตั้งแต้ม = 100)',
            date: new Date().toISOString(),
            emoji: '💰'
          }
          
          pointsHistory.push(newTransaction)
          localStorage.setItem('black-yoga-points-history', JSON.stringify(pointsHistory))
          
          alert(`เพิ่มเครดิต ${pointsToAdd} พอยต์เรียบร้อยแล้ว! (รวมเป็น 100 พอยต์)`)
        } else if (pointsToAdd < 0) {
          // If current points > 100, we need to add a deduction transaction
          const deductionTransaction = {
            id: `admin-deduct-${Date.now()}`,
            type: 'used',
            points: Math.abs(pointsToAdd),
            description: 'แอดมินปรับเครดิต (ตั้งแต้ม = 100)',
            date: new Date().toISOString(),
            emoji: '💰'
          }
          
          pointsHistory.push(deductionTransaction)
          localStorage.setItem('black-yoga-points-history', JSON.stringify(pointsHistory))
          
          alert(`ปรับเครดิตเรียบร้อยแล้ว! (รวมเป็น 100 พอยต์)`)
        } else {
          alert('เครดิตปัจจุบันคือ 100 พอยต์อยู่แล้ว!')
        }
      }
      break
    case 'clear-data':
      if (confirm('คุณต้องการล้างข้อมูลทั้งหมดหรือไม่? (สำหรับ Demo เท่านั้น)')) {
        localStorage.clear()
        alert('ล้างข้อมูลเรียบร้อยแล้ว กรุณารีเฟรชหน้าเว็บ')
        window.location.reload()
      }
      break
  }
}

onMounted(() => {
  // Load stats from localStorage
  const bookings = JSON.parse(localStorage.getItem('black-yoga-bookings') || '[]')
  totalBookings.value = bookings.length
})
</script>
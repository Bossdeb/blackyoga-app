<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white text-gray-900 shadow-sm border-b border-gray-200">
      <div class="max-w-md mx-auto px-6 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold">⚙️ แอดมิน</h1>
            <p class="text-gray-500 text-sm">จัดการระบบและข้อมูล</p>
          </div>
          <div class="bg-gray-100 rounded-full p-2">
            <span class="text-2xl">🔧</span>
          </div>
        </div>
      </div>
    </header>

    <!-- Admin Stats -->
    <div class="max-w-md mx-auto px-6 py-4">
      <div class="grid grid-cols-2 gap-4 mb-6">
        <div class="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
          <div class="text-center">
            <div class="text-2xl font-bold text-gray-900">{{ totalBookings }}</div>
            <div class="text-sm text-gray-500">การจองทั้งหมด</div>
          </div>
        </div>
        <div class="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
          <div class="text-center">
            <div class="text-2xl font-bold text-gray-900">{{ totalUsers }}</div>
            <div class="text-sm text-gray-500">ผู้ใช้ทั้งหมด</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Admin Actions -->
    <main class="max-w-md mx-auto px-6 pb-24">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">การจัดการระบบ</h3>
      
      <div class="space-y-4">
        <div v-for="action in adminActions" :key="action.id" 
             class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          
          <button 
            @click="handleAdminAction(action.action)"
            class="w-full p-4 text-left hover:bg-gray-50 transition-colors duration-200"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="text-2xl">{{ action.emoji }}</div>
                <div>
                  <h4 class="text-gray-900 font-medium">{{ action.title }}</h4>
                  <p class="text-sm text-gray-500">{{ action.description }}</p>
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
      <div class="mt-8 bg-white rounded-xl p-4 border border-gray-200">
        <h4 class="text-gray-900 font-medium mb-3">ข้อมูลระบบ</h4>
        <div class="space-y-2 text-sm">
          <div class="flex justify-between">
            <span class="text-gray-500">เวอร์ชัน:</span>
            <span class="text-gray-900">1.0.0</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-500">สถานะ:</span>
            <span class="text-green-600">ออนไลน์</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-500">ฐานข้อมูล:</span>
            <span class="text-blue-600">Firebase</span>
          </div>
        </div>
      </div>
    </main>

    <!-- Create Class Modal -->
    <div v-if="showCreateClassModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">สร้างคลาสใหม่</h3>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm text-gray-600 mb-1">ชื่อคลาส *</label>
            <input v-model="newClass.name" class="w-full border border-gray-300 rounded-lg px-3 py-2" required />
          </div>
          <div>
            <label class="block text-sm text-gray-600 mb-1">ครูผู้สอน *</label>
            <input v-model="newClass.teacher" class="w-full border border-gray-300 rounded-lg px-3 py-2" required />
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm text-gray-600 mb-1">เวลาเริ่ม *</label>
              <input v-model="newClass.startTime" type="time" class="w-full border border-gray-300 rounded-lg px-3 py-2" required />
            </div>
            <div>
              <label class="block text-sm text-gray-600 mb-1">เวลาสิ้นสุด *</label>
              <input v-model="newClass.endTime" type="time" class="w-full border border-gray-300 rounded-lg px-3 py-2" required />
            </div>
          </div>
          <div>
            <label class="block text-sm text-gray-600 mb-1">วันที่ *</label>
            <input v-model="newClass.date" type="date" class="w-full border border-gray-300 rounded-lg px-3 py-2" required />
          </div>
          <div>
            <label class="block text-sm text-gray-600 mb-1">คำอธิบาย</label>
            <textarea v-model="newClass.description" class="w-full border border-gray-300 rounded-lg px-3 py-2" rows="2"></textarea>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm text-gray-600 mb-1">ความจุ</label>
              <input v-model="newClass.capacity" type="number" class="w-full border border-gray-300 rounded-lg px-3 py-2" />
            </div>
            <div>
              <label class="block text-sm text-gray-600 mb-1">ไอคอน</label>
              <input v-model="newClass.emoji" class="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="🧘‍♀️" />
            </div>
          </div>
        </div>
        
        <div class="flex gap-3 mt-6">
          <button @click="createClass" class="flex-1 bg-lineGreen hover:bg-green-600 text-white py-2 rounded-lg font-medium">
            สร้างคลาส
          </button>
          <button @click="showCreateClassModal = false" class="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg font-medium">
            ยกเลิก
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useFirebase } from '../composables/useFirebase.js'

const { getAllUsers, createClass: firebaseCreateClass } = useFirebase()

const totalBookings = ref(0)
const totalUsers = ref(0)
const showCreateClassModal = ref(false)

const newClass = ref({
  name: '',
  teacher: '',
  startTime: '',
  endTime: '',
  date: new Date().toISOString().split('T')[0],
  description: '',
  capacity: 10,
  emoji: '🧘‍♀️'
})

const adminActions = ref([
  {
    id: 1,
    title: 'สร้างคลาสใหม่',
    description: 'เพิ่มคลาสโยคะใหม่',
    emoji: '📚',
    action: 'create-class'
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
    title: 'เพิ่มเครดิต',
    description: 'เพิ่มเครดิตให้ผู้ใช้',
    emoji: '💰',
    action: 'add-points'
  }
])

const handleAdminAction = (action) => {
  switch (action) {
    case 'create-class':
      showCreateClassModal.value = true
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
    case 'add-points':
      alert('ฟีเจอร์เพิ่มเครดิตจะเปิดให้ใช้งานเร็วๆ นี้')
      break
  }
}

const createClass = async () => {
  try {
    await firebaseCreateClass({
      ...newClass.value,
      durationMinutes: 60
    })
    alert('สร้างคลาสสำเร็จ!')
    showCreateClassModal.value = false
    // Reset form
    newClass.value = {
      name: '',
      teacher: '',
      startTime: '',
      endTime: '',
      date: new Date().toISOString().split('T')[0],
      description: '',
      capacity: 10,
      emoji: '🧘‍♀️'
    }
  } catch (error) {
    alert('เกิดข้อผิดพลาดในการสร้างคลาส: ' + error.message)
  }
}

onMounted(async () => {
  try {
    const users = await getAllUsers()
    totalUsers.value = users.length
  } catch (error) {
    console.error('Error loading users:', error)
  }
})
</script>
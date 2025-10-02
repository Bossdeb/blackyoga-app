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

      <!-- Existing Classes Section -->
      <div class="mt-8">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">คลาสที่มีอยู่</h3>
        <div class="space-y-3">
          <div v-for="classItem in existingClasses" :key="classItem.id" 
               class="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200 cursor-pointer"
               @click="viewClassDetail(classItem)">
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-2">
                <span class="text-2xl">{{ classItem.emoji || '🧘‍♀️' }}</span>
                <div>
                  <h4 class="font-medium text-gray-900">{{ classItem.name }}</h4>
                  <p class="text-sm text-gray-500">{{ classItem.teacher }}</p>
                </div>
              </div>
              <div class="text-right">
                <div class="text-sm font-medium text-gray-900">
                  {{ formatDate(classItem.date) }}
                </div>
                <div class="text-xs text-gray-500">
                  {{ classItem.startTime }} - {{ classItem.endTime }}
                </div>
              </div>
            </div>
            <div class="flex items-center justify-between">
              <div class="text-sm text-gray-500">
                จองแล้ว {{ classItem.bookedCount || 0 }}/{{ classItem.capacity }}
              </div>
              <div class="flex gap-2">
                <button @click.stop="editClass(classItem)" 
                        class="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200">
                  แก้ไข
                </button>
                <button @click.stop="deleteClass(classItem.id)" 
                        class="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200">
                  ลบ
                </button>
              </div>
            </div>
          </div>
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

    <!-- Deduct Points Modal -->
    <div v-if="showDeductPointsModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">หักแต้มผู้ใช้</h3>

        <div class="space-y-4">
          <div>
            <label class="block text-sm text-gray-600 mb-1">ผู้ใช้</label>
            <div class="bg-gray-50 rounded-lg p-3">
              <div class="font-medium text-gray-900">{{ (selectedUser?.nickname || '') + (selectedUser?.firstName ? ' ' + selectedUser.firstName : '') || 'ไม่มีชื่อ' }}</div>
              <div class="text-sm text-gray-500">แต้มปัจจุบัน: {{ selectedUser?.points || 0 }}</div>
            </div>
          </div>
          <div>
            <label class="block text-sm text-gray-600 mb-1">จำนวนแต้ม *</label>
            <input v-model="pointsToDeduct" type="number" class="w-full border border-gray-300 rounded-lg px-3 py-2" required />
          </div>
          <div>
            <label class="block text-sm text-gray-600 mb-1">เหตุผล</label>
            <input v-model="pointsDeductDescription" class="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="เหตุผลในการหักแต้ม" />
          </div>
        </div>

        <div class="flex gap-3 mt-6">
          <button @click="deductPointsFromUser" class="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg font-medium">
            หักแต้ม
          </button>
          <button @click="showDeductPointsModal = false" class="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg font-medium">
            ยกเลิก
          </button>
        </div>
      </div>
    </div>

    <!-- Create Class Modal -->
    <div v-if="showCreateClassModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-2xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
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

    <!-- User Management Modal -->
    <div v-if="showUserManagementModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-2xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">จัดการผู้ใช้</h3>
        
        <div class="space-y-3 mb-4">
          <div v-for="user in allUsers" :key="user.id" class="bg-gray-50 rounded-lg p-3">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <span class="text-lg">👤</span>
                </div>
                <div>
                  <div class="font-medium text-gray-900">{{ (user.nickname || '') + (user.firstName ? ' ' + user.firstName : '') || 'ไม่มีชื่อ' }}</div>
                  <div class="text-sm text-gray-500">{{ user.role || 'member' }}</div>
                </div>
              </div>
              <div class="text-right">
                <div class="text-sm font-medium text-gray-900">{{ user.points || 0 }} แต้ม</div>
                <div class="flex gap-1 mt-1">
                  <button @click="selectUserForPoints(user)" class="text-xs text-blue-600 hover:text-blue-800">
                    เพิ่มแต้ม
                  </button>
                  <button @click="selectUserForDeduct(user)" class="text-xs text-red-600 hover:text-red-800">
                    ลดแต้ม
                  </button>
                  <button @click="selectUserForRole(user)" class="text-xs text-green-600 hover:text-green-800">
                    เปลี่ยนสิทธิ์
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <button @click="showUserManagementModal = false" class="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg font-medium">
          ปิด
        </button>
      </div>
    </div>

    <!-- Add Points Modal -->
    <div v-if="showAddPointsModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">เพิ่มแต้มให้ผู้ใช้</h3>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm text-gray-600 mb-1">ผู้ใช้</label>
            <div class="bg-gray-50 rounded-lg p-3">
              <div class="font-medium text-gray-900">{{ (selectedUser?.nickname || '') + (selectedUser?.firstName ? ' ' + selectedUser.firstName : '') || 'ไม่มีชื่อ' }}</div>
              <div class="text-sm text-gray-500">แต้มปัจจุบัน: {{ selectedUser?.points || 0 }}</div>
            </div>
          </div>
          <div>
            <label class="block text-sm text-gray-600 mb-1">จำนวนแต้ม *</label>
            <input v-model="pointsToAdd" type="number" class="w-full border border-gray-300 rounded-lg px-3 py-2" required />
          </div>
          <div>
            <label class="block text-sm text-gray-600 mb-1">หมายเหตุ</label>
            <input v-model="pointsDescription" class="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="เหตุผลในการเพิ่มแต้ม" />
          </div>
        </div>
        
        <div class="flex gap-3 mt-6">
          <button @click="addPointsToUser" class="flex-1 bg-lineGreen hover:bg-green-600 text-white py-2 rounded-lg font-medium">
            เพิ่มแต้ม
          </button>
          <button @click="showAddPointsModal = false" class="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg font-medium">
            ยกเลิก
          </button>
        </div>
      </div>
    </div>

    <!-- Role Management Modal -->
    <div v-if="showRoleModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">จัดการสิทธิ์ผู้ใช้</h3>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm text-gray-600 mb-1">ผู้ใช้</label>
            <div class="bg-gray-50 rounded-lg p-3">
              <div class="font-medium text-gray-900">{{ (selectedUser?.nickname || '') + (selectedUser?.firstName ? ' ' + selectedUser.firstName : '') || 'ไม่มีชื่อ' }}</div>
              <div class="text-sm text-gray-500">สิทธิ์ปัจจุบัน: {{ selectedUser?.role || 'member' }}</div>
            </div>
          </div>
          <div>
            <label class="block text-sm text-gray-600 mb-1">สิทธิ์ใหม่ *</label>
            <select v-model="newRole" class="w-full border border-gray-300 rounded-lg px-3 py-2">
              <option value="member">สมาชิก (Member)</option>
              <option value="admin">แอดมิน (Admin)</option>
            </select>
          </div>
        </div>
        
        <div class="flex gap-3 mt-6">
          <button @click="updateUserRole" class="flex-1 bg-lineGreen hover:bg-green-600 text-white py-2 rounded-lg font-medium">
            อัปเดตสิทธิ์
          </button>
          <button @click="showRoleModal = false" class="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg font-medium">
            ยกเลิก
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useFirebase } from '../composables/useFirebase.js'

const { getAllUsers, createClass: firebaseCreateClass, addPointsToUser: firebaseAddPointsToUser, deductPointsFromUser: firebaseDeductPointsFromUser, getClasses, updateClass, deleteClass: firebaseDeleteClass, updateUserRole: firebaseUpdateUserRole, isAdmin, loading } = useFirebase()

const totalBookings = ref(0)
const totalUsers = ref(0)
const showCreateClassModal = ref(false)
const showUserManagementModal = ref(false)
const showAddPointsModal = ref(false)
const showDeductPointsModal = ref(false)
const showRoleModal = ref(false)
const allUsers = ref([])
const existingClasses = ref([])
const selectedUser = ref(null)
const pointsToAdd = ref('')
const pointsDescription = ref('')
const pointsToDeduct = ref('')
const pointsDeductDescription = ref('')
const newRole = ref('member')

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
    title: 'จัดการผู้ใช้',
    description: 'ดูรายชื่อผู้ใช้และเพิ่มพอยต์',
    emoji: '👥',
    action: 'manage-users'
  },
  {
    id: 3,
    title: 'ตั้งค่าระบบ',
    description: 'การตั้งค่าทั่วไปของแอป',
    emoji: '⚙️',
    action: 'system-settings'
  }
])

const formatDate = (date) => {
  if (!date) return 'ไม่มีวันที่'
  
  try {
    // Handle Firestore Timestamp
    if (date && typeof date === 'object' && date.toDate) {
      const d = date.toDate()
      return d.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }
    
    // Handle regular Date object or string
    const d = new Date(date)
    if (isNaN(d.getTime())) {
      return 'วันที่ไม่ถูกต้อง'
    }
    
    return d.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  } catch (error) {
    console.error('Error formatting date:', error, date)
    return 'วันที่ไม่ถูกต้อง'
  }
}

import { useRouter } from 'vue-router'
const router = useRouter()

const handleAdminAction = (action) => {
  switch (action) {
    case 'create-class':
      showCreateClassModal.value = true
      break
    case 'manage-users':
      router.push('/admin/users')
      break
    case 'system-settings':
      alert('ฟีเจอร์ตั้งค่าระบบจะเปิดให้ใช้งานเร็วๆ นี้')
      break
  }
}

const createClass = async () => {
  try {
    if (!newClass.value.name || !newClass.value.teacher || !newClass.value.startTime || !newClass.value.endTime || !newClass.value.date) {
      alert('กรุณากรอกข้อมูลที่จำเป็นให้ครบ')
      return
    }
    
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
    // Reload classes
    await loadExistingClasses()
  } catch (error) {
    alert('เกิดข้อผิดพลาดในการสร้างคลาส: ' + error.message)
  }
}

const loadAllUsers = async () => {
  try {
    if (loading.value || !isAdmin.value) return
    allUsers.value = await getAllUsers()
    totalUsers.value = allUsers.value.length
  } catch (error) {
    console.error('Error loading users:', error)
    // Avoid alerting for transient or permission timing issues
    if (error?.message && !/Admin access required/i.test(error.message)) {
      alert('เกิดข้อผิดพลาดในการโหลดข้อมูลผู้ใช้')
    }
  }
}

const loadExistingClasses = async () => {
  try {
    existingClasses.value = await getClasses()
  } catch (error) {
    console.error('Error loading classes:', error)
  }
}

const editClass = (classItem) => {
  router.push(`/admin/classes/${classItem.id}`)
}

const viewClassDetail = (classItem) => {
  router.push(`/admin/classes/${classItem.id}`)
}

const deleteClass = async (classId) => {
  if (confirm('คุณแน่ใจหรือไม่ที่จะลบคลาสนี้?')) {
    try {
      await firebaseDeleteClass(classId)
      alert('ลบคลาสสำเร็จ!')
      await loadExistingClasses()
    } catch (error) {
      alert('เกิดข้อผิดพลาดในการลบคลาส: ' + error.message)
    }
  }
}

const selectUserForPoints = (user) => {
  selectedUser.value = user
  pointsToAdd.value = ''
  pointsDescription.value = ''
  showUserManagementModal.value = false
  showAddPointsModal.value = true
}

const selectUserForDeduct = (user) => {
  selectedUser.value = user
  pointsToDeduct.value = ''
  pointsDeductDescription.value = ''
  showUserManagementModal.value = false
  showDeductPointsModal.value = true
}

const selectUserForRole = (user) => {
  selectedUser.value = user
  newRole.value = user.role || 'member'
  showUserManagementModal.value = false
  showRoleModal.value = true
}

const addPointsToUser = async () => {
  try {
    if (!selectedUser.value || !pointsToAdd.value || pointsToAdd.value <= 0) {
      alert('กรุณาเลือกผู้ใช้และระบุจำนวนแต้มที่ถูกต้อง')
      return
    }
    
    await firebaseAddPointsToUser(
      selectedUser.value.id,
      parseInt(pointsToAdd.value),
      pointsDescription.value || 'แอดมินเพิ่มเครดิต'
    )
    
    alert(`เพิ่มแต้ม ${pointsToAdd.value} แต้มให้ ${(selectedUser.value.nickname || '') + (selectedUser.value.firstName ? ' ' + selectedUser.value.firstName : '')} สำเร็จ!`)
    showAddPointsModal.value = false
    selectedUser.value = null
    pointsToAdd.value = ''
    pointsDescription.value = ''
    
    // Reload users to update points
    await loadAllUsers()
  } catch (error) {
    alert('เกิดข้อผิดพลาดในการเพิ่มแต้ม: ' + error.message)
  }
}

const deductPointsFromUser = async () => {
  try {
    if (!selectedUser.value || !pointsToDeduct.value || pointsToDeduct.value <= 0) {
      alert('กรุณาเลือกผู้ใช้และระบุจำนวนแต้มที่ถูกต้อง')
      return
    }
    await firebaseDeductPointsFromUser(
      selectedUser.value.id,
      parseInt(pointsToDeduct.value),
      pointsDeductDescription.value || 'แอดมินหักเครดิต'
    )
    alert(`หักแต้ม ${pointsToDeduct.value} แต้มจาก ${(selectedUser.value.nickname || '') + (selectedUser.value.firstName ? ' ' + selectedUser.value.firstName : '')} สำเร็จ!`)
    showDeductPointsModal.value = false
    selectedUser.value = null
    pointsToDeduct.value = ''
    pointsDeductDescription.value = ''
    // Reload users to update points
    await loadAllUsers()
  } catch (error) {
    alert('เกิดข้อผิดพลาดในการหักแต้ม: ' + error.message)
  }
}

const updateUserRole = async () => {
  try {
    if (!selectedUser.value) {
      alert('เลือกผู้ใช้ที่ต้องการเปลี่ยนสิทธิ์')
      return
    }

    await firebaseUpdateUserRole(
      selectedUser.value.id,
      newRole.value
    )

    alert(`เปลี่ยนสิทธิ์ ${(selectedUser.value.nickname || '') + (selectedUser.value.firstName ? ' ' + selectedUser.value.firstName : '')} เป็น ${newRole.value} สำเร็จ!`)
    showRoleModal.value = false
    selectedUser.value = null
    newRole.value = 'member'

    // Reload users to update role
    await loadAllUsers()
  } catch (error) {
    alert('เกิดข้อผิดพลาดในการเปลี่ยนสิทธิ์: ' + error.message)
  }
}

onMounted(async () => {
  try {
    if (!loading.value && isAdmin.value) {
      await loadAllUsers()
      await loadExistingClasses()
    }
  } catch (error) {
    console.error('Error loading data:', error)
  }
})

// When auth state or admin role resolves, (re)load admin data
watch([loading, isAdmin], async ([isLoading, isAdminNow]) => {
  if (!isLoading && isAdminNow) {
    await loadAllUsers()
    await loadExistingClasses()
  }
})
</script>
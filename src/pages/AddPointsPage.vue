<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white text-gray-900 shadow-sm border-b border-gray-200">
      <div class="max-w-md mx-auto px-6 py-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <button @click="$router.go(-1)" class="text-gray-500 hover:text-gray-700">
              <span class="text-xl">←</span>
            </button>
            <div>
              <h1 class="text-2xl font-bold">💰 เพิ่มแต้ม</h1>
              <p class="text-gray-500 text-sm">เพิ่มแต้มให้ผู้ใช้</p>
            </div>
          </div>
          <div class="bg-gray-100 rounded-full p-2">
            <span class="text-2xl">💎</span>
          </div>
        </div>
      </div>
    </header>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
    </div>

    <!-- Add Points Form -->
    <main v-else class="max-w-md mx-auto px-6 py-6">
      <form @submit.prevent="addPoints" class="space-y-6">
        <!-- User Info -->
        <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">ข้อมูลผู้ใช้</h3>
          
          <div v-if="selectedUser" class="flex items-center gap-3">
            <div class="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
              <span class="text-xl">👤</span>
            </div>
            <div>
              <div class="font-semibold text-gray-900">{{ selectedUser.displayName || 'ไม่มีชื่อ' }}</div>
              <div class="text-sm text-gray-500">แต้มปัจจุบัน: {{ selectedUser.points || 0 }} แต้ม</div>
              <div class="text-xs text-gray-400">{{ selectedUser.lineId }}</div>
            </div>
          </div>
          
          <div v-else class="text-center py-4 text-gray-500">
            ไม่พบข้อมูลผู้ใช้
          </div>
        </div>

        <!-- Add Points Form -->
        <div v-if="selectedUser" class="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">เพิ่มแต้ม</h3>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">จำนวนแต้ม *</label>
              <input 
                v-model="pointsToAdd" 
                type="number" 
                min="1"
                required
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                placeholder="เช่น 10"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">หมายเหตุ</label>
              <input 
                v-model="pointsDescription" 
                type="text"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                placeholder="เหตุผลในการเพิ่มแต้ม"
              />
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div v-if="selectedUser" class="flex gap-3">
          <button 
            type="submit"
            :disabled="isAdding || !pointsToAdd || pointsToAdd <= 0"
            class="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white py-3 rounded-xl font-semibold shadow-sm transition-all duration-200"
          >
            {{ isAdding ? 'กำลังเพิ่ม...' : 'เพิ่มแต้ม' }}
          </button>
          <button 
            type="button"
            @click="$router.go(-1)"
            class="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-xl font-semibold transition-colors duration-200"
          >
            ยกเลิก
          </button>
        </div>
      </form>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useFirebase } from '../composables/useFirebase.js'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const { getAllUsers, addPointsToUser, user, isAdmin } = useFirebase()

const selectedUser = ref(null)
const pointsToAdd = ref('')
const pointsDescription = ref('')
const loading = ref(true)
const isAdding = ref(false)

const addPoints = async () => {
  try {
    if (!selectedUser.value || !pointsToAdd.value || pointsToAdd.value <= 0) {
      alert('กรุณาระบุจำนวนแต้มที่ถูกต้อง')
      return
    }
    
    isAdding.value = true
    
    await addPointsToUser(
      selectedUser.value.id,
      parseInt(pointsToAdd.value),
      pointsDescription.value || 'แอดมินเพิ่มเครดิต'
    )
    
    alert(`เพิ่มแต้ม ${pointsToAdd.value} แต้มให้ ${selectedUser.value.displayName} สำเร็จ!`)
    router.push('/admin/users')
    
  } catch (error) {
    alert('เกิดข้อผิดพลาดในการเพิ่มแต้ม: ' + error.message)
  } finally {
    isAdding.value = false
  }
}

const loadUser = async () => {
  try {
    loading.value = true
    
    if (!user.value?.lineId || !isAdmin.value) {
      router.push('/admin')
      return
    }

    const userId = route.params.userId
    if (!userId) {
      alert('ไม่พบ ID ผู้ใช้')
      router.push('/admin/users')
      return
    }

    const users = await getAllUsers()
    selectedUser.value = users.find(u => u.id === userId)
    
    if (!selectedUser.value) {
      alert('ไม่พบผู้ใช้ที่ระบุ')
      router.push('/admin/users')
      return
    }
    
  } catch (error) {
    console.error('Error loading user:', error)
    alert('เกิดข้อผิดพลาดในการโหลดข้อมูลผู้ใช้')
    router.push('/admin/users')
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await loadUser()
})
</script>

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
              <h1 class="text-2xl font-bold">👥 จัดการผู้ใช้</h1>
              <p class="text-gray-500 text-sm">ดูรายชื่อและจัดการผู้ใช้</p>
            </div>
          </div>
          <div class="bg-gray-100 rounded-full p-2">
            <span class="text-2xl">👤</span>
          </div>
        </div>
      </div>
    </header>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
    </div>

    <!-- Users List -->
    <main v-else class="max-w-md mx-auto px-6 py-6">
      <div class="space-y-4">
        <div v-for="user in allUsers" :key="user.id" 
             class="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
          
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                <span class="text-xl">👤</span>
              </div>
              <div>
                <div class="font-semibold text-gray-900">{{ user.displayName || 'ไม่มีชื่อ' }}</div>
                <div class="text-sm text-gray-500">{{ getRoleText(user.role || 'member') }}</div>
                <div class="text-xs text-gray-400">{{ user.lineId }}</div>
              </div>
            </div>
            <div class="text-right">
              <div class="text-lg font-bold text-green-600">{{ user.points || 0 }}</div>
              <div class="text-xs text-gray-500">แต้ม</div>
            </div>
          </div>
          
          <div class="flex gap-2 mt-3">
            <button 
              @click="$router.push(`/admin/add-points/${user.id}`)"
              class="flex-1 bg-blue-100 text-blue-700 py-2 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors"
            >
              เพิ่มแต้ม
            </button>
            <button 
              @click="$router.push(`/admin/change-role/${user.id}`)"
              class="flex-1 bg-green-100 text-green-700 py-2 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors"
            >
              เปลี่ยนสิทธิ์
            </button>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="allUsers.length === 0" class="text-center py-12">
          <div class="text-6xl mb-4">👥</div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">ไม่มีผู้ใช้</h3>
          <p class="text-gray-500">ยังไม่มีผู้ใช้ในระบบ</p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useFirebase } from '../composables/useFirebase.js'
import { useRouter } from 'vue-router'

const router = useRouter()
const { getAllUsers, user, loading: firebaseLoading, isAdmin } = useFirebase()

const allUsers = ref([])
const loading = ref(true)

const getRoleText = (role) => {
  switch (role) {
    case 'admin':
      return 'แอดมิน'
    case 'member':
      return 'สมาชิก'
    default:
      return 'สมาชิก'
  }
}

const loadAllUsers = async () => {
  try {
    if (!user.value?.lineId || !isAdmin.value) {
      console.log('No admin user logged in')
      router.push('/admin')
      return
    }
    allUsers.value = await getAllUsers()
  } catch (error) {
    console.error('Error loading users:', error)
    alert('เกิดข้อผิดพลาดในการโหลดข้อมูลผู้ใช้')
  }
}

const loadData = async () => {
  loading.value = true
  try {
    await loadAllUsers()
  } finally {
    loading.value = false
  }
}

// Watch for user changes
watch(() => user.value, async (newUser) => {
  if (newUser?.lineId && isAdmin.value) {
    await loadData()
  } else if (newUser && !isAdmin.value) {
    router.push('/')
  }
}, { immediate: true })

// Also watch for firebase loading state
watch(() => firebaseLoading.value, async (isLoading) => {
  if (!isLoading && user.value?.lineId && isAdmin.value) {
    await loadData()
  }
})

onMounted(async () => {
  if (user.value?.lineId && isAdmin.value) {
    await loadData()
  } else if (user.value && !isAdmin.value) {
    router.push('/')
  }
})
</script>

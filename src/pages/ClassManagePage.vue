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
              <h1 class="text-2xl font-bold">📚 จัดการคลาส</h1>
              <p class="text-gray-500 text-sm">เพิ่ม แก้ไข และลบคลาส</p>
            </div>
          </div>
          <div class="bg-gray-100 rounded-full p-2">
            <span class="text-2xl">🧘‍♀️</span>
          </div>
        </div>
      </div>
    </header>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
    </div>

    <!-- Add New Class Button -->
    <div v-else class="max-w-md mx-auto px-6 py-4">
      <button 
        @click="$router.push('/admin/create-class')"
        class="w-full bg-green-500 hover:bg-green-600 text-white py-4 px-6 rounded-xl font-semibold shadow-sm transition-all duration-200 mb-6"
      >
        ➕ เพิ่มคลาสใหม่
      </button>

      <!-- Existing Classes -->
      <div class="space-y-4">
        <h3 class="text-lg font-semibold text-gray-900">คลาสที่มีอยู่</h3>
        
        <div v-for="classItem in existingClasses" :key="classItem.id" 
             class="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200">
          
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-3">
              <span class="text-2xl">{{ classItem.emoji || '🧘‍♀️' }}</span>
              <div>
                <h4 class="font-semibold text-gray-900">{{ classItem.name }}</h4>
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
              <button 
                @click="$router.push(`/admin/edit-class/${classItem.id}`)" 
                class="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors"
              >
                แก้ไข
              </button>
              <button 
                @click="deleteClass(classItem.id, classItem.name)" 
                class="bg-red-100 text-red-700 px-3 py-1 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
              >
                ลบ
              </button>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="existingClasses.length === 0" class="text-center py-12">
          <div class="text-6xl mb-4">📚</div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">ยังไม่มีคลาส</h3>
          <p class="text-gray-500">เริ่มสร้างคลาสแรกของคุณกันเลย!</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useFirebase } from '../composables/useFirebase.js'
import { useRouter } from 'vue-router'

const router = useRouter()
const { getClasses, deleteClass: firebaseDeleteClass, user, loading: firebaseLoading, isAdmin } = useFirebase()

const existingClasses = ref([])
const loading = ref(true)

const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date.toDate ? date.toDate() : date)
  return d.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const deleteClass = async (classId, className) => {
  if (confirm(`คุณแน่ใจหรือไม่ที่จะลบคลาส "${className}"?`)) {
    try {
      await firebaseDeleteClass(classId)
      alert('ลบคลาสสำเร็จ!')
      await loadExistingClasses()
    } catch (error) {
      alert('เกิดข้อผิดพลาดในการลบคลาส: ' + error.message)
    }
  }
}

const loadExistingClasses = async () => {
  try {
    if (!user.value?.lineId || !isAdmin.value) {
      console.log('No admin user logged in')
      router.push('/admin')
      return
    }
    existingClasses.value = await getClasses()
  } catch (error) {
    console.error('Error loading classes:', error)
  }
}

const loadData = async () => {
  loading.value = true
  try {
    await loadExistingClasses()
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

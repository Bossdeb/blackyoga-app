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
              <h1 class="text-2xl font-bold">➕ สร้างคลาสใหม่</h1>
              <p class="text-gray-500 text-sm">เพิ่มคลาสโยคะใหม่</p>
            </div>
          </div>
          <div class="bg-gray-100 rounded-full p-2">
            <span class="text-2xl">🧘‍♀️</span>
          </div>
        </div>
      </div>
    </header>

    <!-- Create Class Form -->
    <main class="max-w-md mx-auto px-6 py-6">
      <form @submit.prevent="createClass" class="space-y-6">
        <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">ข้อมูลคลาส</h3>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">ชื่อคลาส *</label>
              <input 
                v-model="newClass.name" 
                type="text"
                required
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                placeholder="เช่น Hatha Yoga"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">ครูผู้สอน *</label>
              <input 
                v-model="newClass.teacher" 
                type="text"
                required
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                placeholder="เช่น ครูสมใจ"
              />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">เวลาเริ่ม *</label>
                <input 
                  v-model="newClass.startTime" 
                  type="time" 
                  required
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">เวลาสิ้นสุด *</label>
                <input 
                  v-model="newClass.endTime" 
                  type="time" 
                  required
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">วันที่ *</label>
              <input 
                v-model="newClass.date" 
                type="date" 
                required
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent" 
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">คำอธิบาย</label>
              <textarea 
                v-model="newClass.description" 
                rows="3"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                placeholder="รายละเอียดของคลาส..."
              ></textarea>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">ความจุ</label>
                <input 
                  v-model="newClass.capacity" 
                  type="number" 
                  min="1"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                  placeholder="10"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">ไอคอน</label>
                <input 
                  v-model="newClass.emoji" 
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                  placeholder="🧘‍♀️" 
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-3">
          <button 
            type="submit"
            :disabled="isCreating"
            class="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white py-3 rounded-xl font-semibold shadow-sm transition-all duration-200"
          >
            {{ isCreating ? 'กำลังสร้าง...' : 'สร้างคลาส' }}
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
import { useRouter } from 'vue-router'

const router = useRouter()
const { createClass: firebaseCreateClass, user, isAdmin } = useFirebase()

const isCreating = ref(false)

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

const createClass = async () => {
  try {
    if (!newClass.value.name || !newClass.value.teacher || !newClass.value.startTime || !newClass.value.endTime || !newClass.value.date) {
      alert('กรุณากรอกข้อมูลที่จำเป็นให้ครบ')
      return
    }
    
    isCreating.value = true
    
    await firebaseCreateClass({
      ...newClass.value,
      durationMinutes: 60
    })
    
    alert('สร้างคลาสสำเร็จ!')
    router.push('/admin/classes')
    
  } catch (error) {
    alert('เกิดข้อผิดพลาดในการสร้างคลาส: ' + error.message)
  } finally {
    isCreating.value = false
  }
}

onMounted(() => {
  // Check if user is admin
  if (!user.value?.lineId || !isAdmin.value) {
    router.push('/admin')
  }
})
</script>

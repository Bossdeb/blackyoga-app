<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-white text-gray-900 shadow-sm border-b border-gray-200">
      <div class="max-w-3xl mx-auto px-6 py-6 flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold">📚 จัดการคลาส</h1>
          <p class="text-gray-500 text-sm">แก้ไขข้อมูลและดูรายชื่อผู้จอง</p>
        </div>
        <router-link to="/admin" class="text-sm text-gray-600 hover:text-gray-800">ย้อนกลับ</router-link>
      </div>
    </header>

    <main class="max-w-3xl mx-auto px-6 py-4 pb-24">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Edit form -->
        <div class="bg-white rounded-2xl p-4 border border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900 mb-3">ข้อมูลคลาส</h3>
          <div class="space-y-3">
            <div>
              <label class="block text-sm text-gray-600 mb-1">ชื่อคลาส</label>
              <input v-model="form.name" class="w-full border border-gray-300 rounded-lg px-3 py-2" />
            </div>
            <div>
              <label class="block text-sm text-gray-600 mb-1">ครูผู้สอน</label>
              <input v-model="form.teacher" class="w-full border border-gray-300 rounded-lg px-3 py-2" />
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-sm text-gray-600 mb-1">เวลาเริ่ม</label>
                <input v-model="form.startTime" type="time" class="w-full border border-gray-300 rounded-lg px-3 py-2" />
              </div>
              <div>
                <label class="block text-sm text-gray-600 mb-1">เวลาสิ้นสุด</label>
                <input v-model="form.endTime" type="time" class="w-full border border-gray-300 rounded-lg px-3 py-2" />
              </div>
            </div>
            <div>
              <label class="block text-sm text-gray-600 mb-1">วันที่</label>
              <input v-model="form.date" type="date" class="w-full border border-gray-300 rounded-lg px-3 py-2" />
            </div>
            <div>
              <label class="block text-sm text-gray-600 mb-1">คำอธิบาย</label>
              <textarea v-model="form.description" rows="2" class="w-full border border-gray-300 rounded-lg px-3 py-2"></textarea>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-sm text-gray-600 mb-1">ความจุ</label>
                <input v-model.number="form.capacity" type="number" class="w-full border border-gray-300 rounded-lg px-3 py-2" />
              </div>
              <div>
                <label class="block text-sm text-gray-600 mb-1">ไอคอน</label>
                <input v-model="form.emoji" class="w-full border border-gray-300 rounded-lg px-3 py-2" />
              </div>
            </div>
            <button @click="save" class="w-full mt-4 bg-lineGreen hover:bg-green-600 text-white rounded-lg px-4 py-2 font-medium transition-colors duration-200">
              บันทึกการเปลี่ยนแปลง
            </button>
          </div>
        </div>

        <!-- Bookers -->
        <div class="bg-white rounded-2xl p-4 border border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900 mb-3">ผู้จอง ({{ bookings.length }})</h3>
          <div v-if="loadingBookings" class="space-y-2">
            <div v-for="i in 5" :key="i" class="h-12 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div v-else>
            <div v-if="bookings.length === 0" class="text-gray-500 text-sm text-center py-8">
              <div class="text-4xl mb-2">📝</div>
              ยังไม่มีผู้จอง
            </div>
            <div v-else class="space-y-3">""
              <div v-for="b in bookings" :key="b.id" 
                   class="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors duration-200">
                <div class="flex items-center gap-3">
                  <div v-if="b.user?.pictureUrl" class="w-10 h-10 rounded-full overflow-hidden">
                    <img :src="b.user.pictureUrl" class="w-full h-full object-cover" />
                  </div>
                  <div v-else class="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <span class="text-lg">👤</span>
                  </div>
                  <div>
                    <div class="font-medium text-gray-900">
                      {{ (b.user?.nickname || '') + (b.user?.firstName ? ' ' + b.user.firstName : '') || b.user?.displayName || 'ไม่มีชื่อ' }}
                    </div>
                    <div class="text-xs text-gray-500">
                      สถานะ: 
                      <span :class="{
                        'text-green-600': b.status === 'confirmed',
                        'text-red-600': b.status === 'cancelled',
                        'text-yellow-600': b.status === 'pending'
                      }">
                        {{ b.status === 'confirmed' ? 'ยืนยันแล้ว' : 
                           b.status === 'cancelled' ? 'ยกเลิกแล้ว' : 
                           b.status === 'pending' ? 'รอยืนยัน' : b.status }}
                      </span>
                    </div>
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-xs text-gray-500">จองเมื่อ</div>
                  <div class="text-xs font-medium text-gray-700">{{ formatDate(b.createdAt) }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useFirebase } from '../composables/useFirebase.js'

const route = useRoute()
const router = useRouter()
const { getClassById, updateClass, getBookingsByClass } = useFirebase()

const classId = route.params.id
const form = ref({ name: '', teacher: '', startTime: '', endTime: '', date: '', description: '', capacity: 10, emoji: '🧘‍♀️' })
const bookings = ref([])
const loadingBookings = ref(true)

const load = async () => {
  try {
    const klass = await getClassById(classId)
    console.log('Loaded class data:', klass)
    
    // Handle date conversion safely
    let classDate = ''
    if (klass.date) {
      try {
        if (klass.date && typeof klass.date === 'object' && klass.date.toDate) {
          // Firestore Timestamp
          classDate = klass.date.toDate().toISOString().split('T')[0]
        } else {
          // Regular Date object or string
          const d = new Date(klass.date)
          if (!isNaN(d.getTime())) {
            classDate = d.toISOString().split('T')[0]
          }
        }
      } catch (error) {
        console.error('Error converting date:', error)
        classDate = new Date().toISOString().split('T')[0]
      }
    }
    
    form.value = {
      name: klass.name || '',
      teacher: klass.teacher || '',
      startTime: klass.startTime || '',
      endTime: klass.endTime || '',
      date: classDate,
      description: klass.description || '',
      capacity: klass.capacity || 10,
      emoji: klass.emoji || '🧘‍♀️'
    }
  } catch (e) {
    console.error('Error loading class:', e)
    alert('โหลดข้อมูลคลาสไม่สำเร็จ')
    router.push('/admin')
  }
}

const loadBookings = async () => {
  loadingBookings.value = true
  try {
    bookings.value = await getBookingsByClass(classId)
  } finally {
    loadingBookings.value = false
  }
}

const save = async () => {
  try {
    // Validate required fields
    if (!form.value.name || !form.value.teacher || !form.value.startTime || !form.value.endTime || !form.value.date) {
      alert('กรุณากรอกข้อมูลที่จำเป็นให้ครบ')
      return
    }
    
    // Convert date safely
    let classDate
    try {
      classDate = new Date(form.value.date)
      if (isNaN(classDate.getTime())) {
        alert('วันที่ไม่ถูกต้อง')
        return
      }
    } catch (error) {
      alert('วันที่ไม่ถูกต้อง')
      return
    }
    
    const updateData = {
      ...form.value,
      date: classDate
    }
    
    console.log('Saving class data:', updateData)
    await updateClass(classId, updateData)
    alert('บันทึกสำเร็จ!')
    
    // Reload data
    await load()
  } catch (e) {
    console.error('Error saving class:', e)
    alert('บันทึกไม่สำเร็จ: ' + e.message)
  }
}

const formatDate = (ts) => {
  if (!ts) return 'ไม่มีข้อมูล'
  
  try {
    // Handle Firestore Timestamp
    if (ts && typeof ts === 'object' && ts.toDate) {
      const d = ts.toDate()
      return d.toLocaleString('th-TH', { 
        dateStyle: 'short', 
        timeStyle: 'short' 
      })
    }
    
    // Handle regular Date object or string
    const d = new Date(ts)
    if (isNaN(d.getTime())) {
      return 'วันที่ไม่ถูกต้อง'
    }
    
    return d.toLocaleString('th-TH', { 
      dateStyle: 'short', 
      timeStyle: 'short' 
    })
  } catch (error) {
    console.error('Error formatting date:', error, ts)
    return 'วันที่ไม่ถูกต้อง'
  }
}

onMounted(async () => {
  await load()
  await loadBookings()
})
</script>

<style scoped>
</style>



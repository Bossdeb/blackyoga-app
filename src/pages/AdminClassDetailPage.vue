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
            <label class="block text-sm text-gray-600">ชื่อคลาส</label>
            <input v-model="form.name" class="w-full border border-gray-300 rounded-lg px-3 py-2" />
            <label class="block text-sm text-gray-600">ครูผู้สอน</label>
            <input v-model="form.teacher" class="w-full border border-gray-300 rounded-lg px-3 py-2" />
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-sm text-gray-600">เวลาเริ่ม</label>
                <input v-model="form.startTime" type="time" class="w-full border border-gray-300 rounded-lg px-3 py-2" />
              </div>
              <div>
                <label class="block text-sm text-gray-600">เวลาสิ้นสุด</label>
                <input v-model="form.endTime" type="time" class="w-full border border-gray-300 rounded-lg px-3 py-2" />
              </div>
            </div>
            <label class="block text-sm text-gray-600">วันที่</label>
            <input v-model="form.date" type="date" class="w-full border border-gray-300 rounded-lg px-3 py-2" />
            <label class="block text-sm text-gray-600">คำอธิบาย</label>
            <textarea v-model="form.description" rows="2" class="w-full border border-gray-300 rounded-lg px-3 py-2"></textarea>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-sm text-gray-600">ความจุ</label>
                <input v-model.number="form.capacity" type="number" class="w-full border border-gray-300 rounded-lg px-3 py-2" />
              </div>
              <div>
                <label class="block text-sm text-gray-600">ไอคอน</label>
                <input v-model="form.emoji" class="w-full border border-gray-300 rounded-lg px-3 py-2" />
              </div>
            </div>
            <button @click="save" class="mt-2 bg-lineGreen text-white rounded-lg px-4 py-2">บันทึก</button>
          </div>
        </div>

        <!-- Bookers -->
        <div class="bg-white rounded-2xl p-4 border border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900 mb-3">ผู้จอง</h3>
          <div v-if="loadingBookings" class="space-y-2">
            <div v-for="i in 5" :key="i" class="h-12 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div v-else>
            <div v-if="bookings.length === 0" class="text-gray-500 text-sm">ยังไม่มีผู้จอง</div>
            <div v-else class="space-y-2">
              <div v-for="b in bookings" :key="b.id" class="flex items-center justify-between p-2 rounded border border-gray-200">
                <div class="flex items-center gap-3">
                  <img v-if="b.user?.pictureUrl" :src="b.user.pictureUrl" class="w-8 h-8 rounded-full" />
                  <div class="text-sm">
                    <div class="font-medium text-gray-900">{{ b.user?.displayName || b.user?.id }}</div>
                    <div class="text-xs text-gray-500">สถานะ: {{ b.status }}</div>
                  </div>
                </div>
                <div class="text-xs text-gray-500">{{ formatDate(b.createdAt) }}</div>
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
    form.value = {
      name: klass.name || '',
      teacher: klass.teacher || '',
      startTime: klass.startTime || '',
      endTime: klass.endTime || '',
      date: new Date(klass.date?.toDate ? klass.date.toDate() : klass.date).toISOString().split('T')[0],
      description: klass.description || '',
      capacity: klass.capacity || 10,
      emoji: klass.emoji || '🧘‍♀️'
    }
  } catch (e) {
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
    await updateClass(classId, { ...form.value, date: new Date(form.value.date) })
    alert('บันทึกสำเร็จ')
  } catch (e) {
    alert('บันทึกไม่สำเร็จ: ' + e.message)
  }
}

const formatDate = (ts) => {
  if (!ts) return ''
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  return d.toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' })
}

onMounted(async () => {
  await load()
  await loadBookings()
})
</script>

<style scoped>
</style>



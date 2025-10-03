<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white text-gray-900 shadow-sm border-b border-gray-200">
      <div class="max-w-md mx-auto px-6 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold">🎟️ สถานะสมาชิก</h1>
            <p class="text-gray-500 text-sm">วันหมดอายุและสิทธิ์การจอง</p>
          </div>
          <div class="bg-gray-100 rounded-full p-2">
            <span class="text-2xl">🗓️</span>
          </div>
        </div>
      </div>
    </header>

    <!-- Membership Summary -->
    <div class="max-w-md mx-auto px-6 py-4">
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <div class="text-center">
          <div class="text-2xl font-bold text-gray-900 mb-2">สถานะสมาชิก</div>
          <div v-if="pointsExpireAt" class="mt-2 text-sm" :class="isExpired ? 'text-red-600' : 'text-gray-600'">
            วันหมดอายุ: {{ formatDate(pointsExpireAt) }}
          </div>
          <div v-else class="mt-2 text-sm text-gray-400">ไม่มีวันหมดอายุ</div>
        </div>
      </div>
      <div v-if="isExpired" class="mt-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-3">
        สมาชิกของคุณหมดอายุแล้ว ไม่สามารถจองได้
      </div>
    </div>

    <!-- Info -->
    <main class="max-w-md mx-auto px-6 pb-24">
      <div class="mt-8 bg-white rounded-xl p-4 border border-gray-200">
        <h4 class="text-gray-900 font-medium mb-3">กติกาการเป็นสมาชิก</h4>
        <div class="space-y-2 text-sm text-gray-600">
          <div>• สมาชิกที่ยังไม่หมดอายุ สามารถจองคลาสได้</div>
          <div>• เมื่อหมดอายุ จะไม่สามารถจองได้จนกว่าจะต่ออายุ</div>
          <div>• จองล่วงหน้าได้ไม่เกิน 1 วัน</div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useFirebase } from '../composables/useFirebase.js'

const { user, refreshCurrentUser } = useFirebase()

const loading = ref(true)

const formatDate = (timestamp) => {
  if (!timestamp) return ''
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return date.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const pointsExpireAt = computed(() => user.value?.pointsExpireAt || null)
const isExpired = computed(() => {
  const ts = pointsExpireAt.value
  if (!ts) return false
  const date = ts.toDate ? ts.toDate() : new Date(ts)
  return new Date() > date
})

onMounted(async () => {
  await Promise.all([refreshCurrentUser()])
  loading.value = false
})
</script>
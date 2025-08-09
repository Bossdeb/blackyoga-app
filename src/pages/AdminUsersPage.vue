<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-white text-gray-900 shadow-sm border-b border-gray-200">
      <div class="max-w-3xl mx-auto px-6 py-6 flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold">👥 จัดการผู้ใช้</h1>
          <p class="text-gray-500 text-sm">ค้นหา ดูข้อมูล และเพิ่มพอยต์</p>
        </div>
        <router-link to="/admin" class="text-sm text-gray-600 hover:text-gray-800">ย้อนกลับ</router-link>
      </div>
    </header>

    <main class="max-w-3xl mx-auto px-6 py-4 pb-24">
      <div class="bg-white rounded-2xl p-4 border border-gray-200">
        <div class="flex items-center gap-3 mb-4">
          <input v-model="search" placeholder="ค้นหาชื่อผู้ใช้..." class="flex-1 border border-gray-300 rounded-lg px-3 py-2" />
          <button @click="refresh" class="px-3 py-2 bg-gray-100 rounded-lg border border-gray-300 hover:bg-gray-200">รีเฟรช</button>
        </div>
        <div v-if="loading" class="space-y-3">
          <div v-for="i in 6" :key="i" class="p-3 rounded-lg border border-gray-200 animate-pulse">
            <div class="h-5 w-40 bg-gray-200 rounded mb-2"></div>
            <div class="h-4 w-24 bg-gray-200 rounded"></div>
          </div>
        </div>
        <div v-else class="divide-y divide-gray-100">
          <div v-for="u in filteredUsers" :key="u.id" class="flex items-center justify-between py-3">
            <div class="flex items-center gap-3">
              <img v-if="u.pictureUrl" :src="u.pictureUrl" class="w-10 h-10 rounded-full" />
              <div v-else class="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">👤</div>
              <div>
                <div class="font-medium text-gray-900">{{ (u.nickname || '') + (u.firstName ? ' ' + u.firstName : '') || 'ไม่มีชื่อ' }}</div>
                <div class="text-xs text-gray-500">{{ u.role || 'member' }}</div>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <div class="text-sm font-medium text-gray-900">{{ u.points || 0 }} พอยต์</div>
              <button @click="openAdd(u)" class="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">เพิ่มพอยต์</button>
              <button @click="openRole(u)" class="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">สิทธิ์</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Add points -->
      <div v-if="showAdd" class="fixed inset-0 bg-black/40 flex items-center justify-center">
        <div class="bg-white rounded-2xl p-6 w-full max-w-sm">
          <h3 class="text-lg font-semibold mb-3">เพิ่มพอยต์ให้ {{ (selected?.nickname || '') + (selected?.firstName ? ' ' + selected.firstName : '') }}</h3>
          <input v-model.number="pointsToAdd" type="number" class="w-full border border-gray-300 rounded-lg px-3 py-2 mb-3" placeholder="จำนวนพอยต์" />
          <input v-model="pointsDesc" class="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4" placeholder="คำอธิบาย (ไม่บังคับ)" />
          <div class="flex gap-2">
            <button @click="confirmAdd" class="flex-1 bg-lineGreen text-white rounded-lg py-2">บันทึก</button>
            <button @click="closeAdd" class="flex-1 bg-gray-200 rounded-lg py-2">ยกเลิก</button>
          </div>
        </div>
      </div>

      <!-- Change role -->
      <div v-if="showRole" class="fixed inset-0 bg-black/40 flex items-center justify-center">
        <div class="bg-white rounded-2xl p-6 w-full max-w-sm">
          <h3 class="text-lg font-semibold mb-3">เปลี่ยนสิทธิ์ {{ (selected?.nickname || '') + (selected?.firstName ? ' ' + selected.firstName : '') }}</h3>
          <select v-model="newRole" class="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4">
            <option value="member">member</option>
            <option value="admin">admin</option>
          </select>
          <div class="flex gap-2">
            <button @click="confirmRole" class="flex-1 bg-lineGreen text-white rounded-lg py-2">บันทึก</button>
            <button @click="closeRole" class="flex-1 bg-gray-200 rounded-lg py-2">ยกเลิก</button>
          </div>
        </div>
      </div>
    </main>
  </div>
  
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useFirebase } from '../composables/useFirebase.js'

const { getAllUsers, addPointsToUser, updateUserRole } = useFirebase()

const users = ref([])
const search = ref('')
const loading = ref(true)

const showAdd = ref(false)
const selected = ref(null)
const pointsToAdd = ref(0)
const pointsDesc = ref('')

const showRole = ref(false)
const newRole = ref('member')

const filteredUsers = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return users.value
  return users.value.filter(u => ((u.nickname || '') + ' ' + (u.firstName || '')).toLowerCase().includes(q))
})

const refresh = async () => {
  loading.value = true
  try {
    users.value = await getAllUsers()
  } finally {
    loading.value = false
  }
}

const openAdd = (u) => { selected.value = u; pointsToAdd.value = 0; pointsDesc.value = ''; showAdd.value = true }
const closeAdd = () => { showAdd.value = false; selected.value = null }
const confirmAdd = async () => {
  if (!selected.value || !pointsToAdd.value || pointsToAdd.value <= 0) return
  await addPointsToUser(selected.value.id || selected.value.lineId, pointsToAdd.value, pointsDesc.value)
  await refresh(); closeAdd()
}

const openRole = (u) => { selected.value = u; newRole.value = u.role || 'member'; showRole.value = true }
const closeRole = () => { showRole.value = false; selected.value = null }
const confirmRole = async () => {
  await updateUserRole(selected.value.id || selected.value.lineId, newRole.value)
  await refresh(); closeRole()
}

onMounted(refresh)
</script>

<style scoped>
</style>



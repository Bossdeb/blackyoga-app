<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-white text-gray-900 shadow-sm border-b border-gray-200 sticky top-0 z-10">
      <div class="max-w-5xl mx-auto px-4 sm:px-6 py-4">
        <div class="flex items-center justify-between gap-3">
          <div>
            <h1 class="text-xl sm:text-2xl font-bold">👥 จัดการผู้ใช้</h1>
            <p class="text-gray-500 text-xs sm:text-sm">ค้นหา ดูข้อมูล และเพิ่มพอยต์</p>
          </div>
          <router-link to="/admin" class="text-sm text-gray-600 hover:text-gray-800">ย้อนกลับ</router-link>
        </div>
        <div class="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
          <input v-model="search" placeholder="ค้นหาชื่อเล่นหรือชื่อจริง..." class="border border-gray-300 rounded-lg px-3 py-2 w-full" />
          <select v-model="roleFilter" class="border border-gray-300 rounded-lg px-3 py-2 w-full">
            <option value="">ทุกสิทธิ์</option>
            <option value="member">member</option>
            <option value="admin">admin</option>
          </select>
          <div class="flex gap-2">
            <button @click="refresh" class="flex-1 px-3 py-2 bg-gray-100 rounded-lg border border-gray-300 hover:bg-gray-200">รีเฟรช</button>
            <span class="hidden sm:inline-flex items-center text-xs text-gray-500">ทั้งหมด {{ totalCount }} คน</span>
          </div>
        </div>
      </div>
    </header>

    <main class="max-w-5xl mx-auto px-4 sm:px-6 py-4 pb-24">
      <div class="bg-white rounded-2xl border border-gray-200">
        <div v-if="loading" class="p-3 sm:p-4 space-y-2">
          <div v-for="i in 10" :key="i" class="h-16 sm:h-14 rounded-lg border border-gray-200 animate-pulse"></div>
        </div>

        <ul v-else class="divide-y divide-gray-100">
          <li v-for="u in pagedUsers" :key="u.id" class="flex items-center justify-between gap-3 p-3 sm:p-4">
            <div class="flex items-center gap-3 min-w-0">
              <img v-if="u.pictureUrl" :src="u.pictureUrl" class="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover" />
              <div v-else class="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-full flex items-center justify-center">👤</div>
              <div class="min-w-0">
                <div class="font-medium text-gray-900 truncate">{{ displayName(u) }}</div>
                <div class="text-xs text-gray-500">{{ u.role || 'member' }}</div>
              </div>
            </div>
            <div class="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <div class="text-sm font-medium text-gray-900 whitespace-nowrap">{{ u.points || 0 }} พอยต์</div>
              <button @click="openAdd(u)" class="text-xs sm:text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded whitespace-nowrap">เพิ่มพอยต์</button>
              <button @click="openRole(u)" class="text-xs sm:text-sm bg-green-100 text-green-700 px-2 py-1 rounded whitespace-nowrap">สิทธิ์</button>
              <router-link :to="`/admin/users/${u.id || u.lineId}`" class="text-xs sm:text-sm bg-gray-100 text-gray-700 px-2 py-1 rounded whitespace-nowrap">รายละเอียด</router-link>
            </div>
          </li>
        </ul>

        <!-- Pagination -->
        <div v-if="!loading && totalPages > 1" class="flex items-center justify-between p-3 sm:p-4 text-sm">
          <div class="text-gray-500">หน้า {{ currentPage }} / {{ totalPages }}</div>
          <div class="flex gap-2">
            <button :disabled="currentPage === 1" @click="currentPage--" class="px-3 py-1 rounded border border-gray-300 disabled:opacity-50">ก่อนหน้า</button>
            <button :disabled="currentPage === totalPages" @click="currentPage++" class="px-3 py-1 rounded border border-gray-300 disabled:opacity-50">ถัดไป</button>
          </div>
        </div>
      </div>

      <!-- Add points -->
      <div v-if="showAdd" class="fixed inset-0 z-[60] bg-black/40 flex items-end sm:items-center justify-center">
        <div class="bg-white w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl max-h-[90vh] flex flex-col overscroll-contain" tabindex="-1">
          <div class="p-4 sm:p-6 space-y-3 overflow-y-auto">
            <h3 class="text-lg font-semibold">เพิ่มพอยต์ให้ {{ displayName(selected) }}</h3>
            <input v-model.number="pointsToAdd" type="number" inputmode="numeric" class="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="จำนวนพอยต์" />
            <input v-model="pointsDesc" class="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="คำอธิบาย (ไม่บังคับ)" />
          </div>
          <div class="p-3 sm:p-4 border-t bg-white sticky bottom-0" style="padding-bottom: max(env(safe-area-inset-bottom), 8px);">
            <div class="flex gap-2">
              <button @click="confirmAdd" class="flex-1 bg-lineGreen text-white rounded-lg py-2">บันทึก</button>
              <button @click="closeAdd" class="flex-1 bg-gray-200 rounded-lg py-2">ยกเลิก</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Change role -->
      <div v-if="showRole" class="fixed inset-0 z-[60] bg-black/40 flex items-end sm:items-center justify-center">
        <div class="bg-white w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl max-h-[90vh] flex flex-col overscroll-contain" tabindex="-1">
          <div class="p-4 sm:p-6 space-y-3 overflow-y-auto">
            <h3 class="text-lg font-semibold">เปลี่ยนสิทธิ์ {{ displayName(selected) }}</h3>
            <select v-model="newRole" class="w-full border border-gray-300 rounded-lg px-3 py-2">
              <option value="member">member</option>
              <option value="admin">admin</option>
            </select>
          </div>
          <div class="p-3 sm:p-4 border-t bg-white sticky bottom-0" style="padding-bottom: max(env(safe-area-inset-bottom), 8px);">
            <div class="flex gap-2">
              <button @click="confirmRole" class="flex-1 bg-lineGreen text-white rounded-lg py-2">บันทึก</button>
              <button @click="closeRole" class="flex-1 bg-gray-200 rounded-lg py-2">ยกเลิก</button>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useFirebase } from '../composables/useFirebase.js'

const { getAllUsers, addPointsToUser, updateUserRole } = useFirebase()

const users = ref([])
const search = ref('')
const loading = ref(true)
const roleFilter = ref('')

// pagination
const currentPage = ref(1)
const pageSize = ref(20)

const showAdd = ref(false)
const selected = ref(null)
const pointsToAdd = ref(0)
const pointsDesc = ref('')

const showRole = ref(false)
const newRole = ref('member')

const filteredUsers = computed(() => {
  const q = search.value.trim().toLowerCase()
  let arr = users.value
  if (roleFilter.value) arr = arr.filter(u => (u.role || 'member') === roleFilter.value)
  if (q) arr = arr.filter(u => ((u.nickname || '') + ' ' + (u.firstName || '')).toLowerCase().includes(q))
  return arr
})

const totalCount = computed(() => filteredUsers.value.length)
const totalPages = computed(() => Math.max(1, Math.ceil(totalCount.value / pageSize.value)))
const pagedUsers = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredUsers.value.slice(start, start + pageSize.value)
})

watch([filteredUsers, pageSize], () => {
  currentPage.value = 1
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

const displayName = (u) => {
  if (!u) return ''
  const n = u.nickname || ''
  const f = u.firstName || ''
  const name = (n + (f ? ' ' + f : '')).trim()
  return name || 'ไม่มีชื่อ'
}
</script>

<style scoped>
</style>



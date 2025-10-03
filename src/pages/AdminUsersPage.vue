<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-white text-gray-900 shadow-sm border-b border-gray-200 sticky top-0 z-10">
      <div class="max-w-5xl mx-auto px-4 sm:px-6 py-4">
        <div class="flex items-center justify-between gap-3">
          <div>
            <h1 class="text-xl sm:text-2xl font-bold">👥 จัดการผู้ใช้</h1>
            <p class="text-gray-500 text-xs sm:text-sm">ค้นหา ดูข้อมูล และจัดการสมาชิก</p>
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
          <li v-for="u in pagedUsers" :key="u.id" class="p-3 sm:p-4">
            <div class="flex items-start sm:items-center gap-3">
              <img v-if="u.pictureUrl" :src="u.pictureUrl" class="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover flex-shrink-0" />
              <div v-else class="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">👤</div>

              <div class="flex-1 min-w-0">
                <div class="font-medium text-gray-900 whitespace-normal break-words">{{ displayName(u) }}</div>
                <div class="text-xs text-gray-500">{{ u.role || 'member' }}</div>
                <div class="mt-1 text-sm font-medium sm:hidden" :class="u.membershipExpireAt ? 'text-green-600' : 'text-red-600'">
                  {{ u.membershipExpireAt ? formatDate(u.membershipExpireAt) : 'ไม่มีสิทธิ์' }}
                </div>
              </div>

              <div class="hidden sm:block text-sm font-medium whitespace-nowrap mr-1" :class="u.membershipExpireAt ? 'text-green-600' : 'text-red-600'">
                {{ u.membershipExpireAt ? formatDate(u.membershipExpireAt) : 'ไม่มีสิทธิ์' }}
              </div>

              <div class="grid grid-cols-2 gap-2 sm:gap-3 flex-shrink-0">
                <button @click="openMembership(u)" class="text-xs sm:text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded whitespace-nowrap">สมาชิก</button>
                <button @click="openRole(u)" class="text-xs sm:text-sm bg-green-100 text-green-700 px-2 py-1 rounded whitespace-nowrap">สิทธิ์</button>
                <router-link :to="`/admin/users/${u.id || u.lineId}`" class="text-xs sm:text-sm bg-gray-100 text-gray-700 px-2 py-1 rounded whitespace-nowrap text-center">รายละเอียด</router-link>
              </div>
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

      <!-- Membership Management -->
      <div v-if="showMembership" class="fixed inset-0 z-[60] bg-black/40 flex items-end sm:items-center justify-center">
        <div class="bg-white w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl max-h-[90vh] flex flex-col overscroll-contain" tabindex="-1">
          <div class="p-4 sm:p-6 space-y-3 overflow-y-auto">
            <h3 class="text-lg font-semibold">จัดการสมาชิก {{ displayName(selected) }}</h3>
            <div class="text-sm text-gray-600">
              วันหมดอายุปัจจุบัน: {{ selected?.membershipExpireAt ? formatDate(selected.membershipExpireAt) : 'ไม่มีวันหมดอายุ' }}
            </div>
            <input v-model="membershipExpiryDate" type="date" class="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="เลือกวันหมดอายุ" />
          </div>
          <div class="p-3 sm:p-4 border-t bg-white sticky bottom-0" style="padding-bottom: max(env(safe-area-inset-bottom), 8px);">
            <div class="flex gap-2">
              <button @click="confirmMembership" class="flex-1 bg-lineGreen text-white rounded-lg py-2">อัปเดต</button>
              <button @click="removeMembership" class="flex-1 bg-red-500 text-white rounded-lg py-2">ลบ</button>
              <button @click="closeMembership" class="flex-1 bg-gray-200 rounded-lg py-2">ยกเลิก</button>
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

const { getAllUsers, setUserMembershipExpiry, updateUserRole } = useFirebase()

const users = ref([])
const search = ref('')
const loading = ref(true)
const roleFilter = ref('')

// pagination
const currentPage = ref(1)
const pageSize = ref(20)

const showMembership = ref(false)
const selected = ref(null)
const membershipExpiryDate = ref('')

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

const openMembership = (u) => { 
  selected.value = u
  if (u.membershipExpireAt) {
    const date = u.membershipExpireAt.toDate ? u.membershipExpireAt.toDate() : new Date(u.membershipExpireAt)
    membershipExpiryDate.value = date.toISOString().split('T')[0]
  } else {
    membershipExpiryDate.value = ''
  }
  showMembership.value = true 
}
const closeMembership = () => { showMembership.value = false; selected.value = null; membershipExpiryDate.value = '' }
const confirmMembership = async () => {
  if (!selected.value || !membershipExpiryDate.value) return
  await setUserMembershipExpiry(selected.value.id || selected.value.lineId, new Date(membershipExpiryDate.value))
  await refresh(); closeMembership()
}
const removeMembership = async () => {
  if (!selected.value) return
  if (!confirm('ยืนยันการลบวันหมดอายุสมาชิก?')) return
  await setUserMembershipExpiry(selected.value.id || selected.value.lineId, null)
  await refresh(); closeMembership()
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

const formatDate = (timestamp) => {
  if (!timestamp) return ''
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return date.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}
</script>

<style scoped>
</style>



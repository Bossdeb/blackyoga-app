<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-white shadow-sm border-b border-gray-200">
      <div class="px-6 py-4">
        <h1 class="text-xl font-bold text-gray-900">ยืนยันข้อมูลสมาชิก</h1>
        <p class="text-gray-500 text-sm">เพิ่มข้อมูลที่จำเป็นเพื่อใช้งานระบบ</p>
      </div>
    </header>

    <main class="max-w-md mx-auto px-6 py-6">
      <div class="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
        <div class="flex items-center gap-3">
          <img v-if="form.pictureUrl" :src="form.pictureUrl" class="w-12 h-12 rounded-full border border-gray-200" />
          <div v-else class="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
            <span class="text-gray-500 text-xl">👤</span>
          </div>
          <div>
            <div class="text-gray-900 font-semibold">{{ form.displayName || 'User' }}</div>
            <div class="text-sm text-gray-500">LINE User</div>
          </div>
        </div>

        <div class="grid grid-cols-1 gap-4">
          <div>
            <label class="block text-sm text-gray-600 mb-1">ชื่อเล่น *</label>
            <input 
              v-model="form.nickname" 
              class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-lineGreen" 
              placeholder="เช่น โจ้" 
              required
            />
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm text-gray-600 mb-1">ชื่อจริง *</label>
              <input 
                v-model="form.firstName" 
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-lineGreen" 
                required
              />
            </div>
            <div>
              <label class="block text-sm text-gray-600 mb-1">นามสกุล *</label>
              <input 
                v-model="form.lastName" 
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-lineGreen" 
                required
              />
            </div>
          </div>
          <div>
            <label class="block text-sm text-gray-600 mb-1">เบอร์โทร *</label>
            <input 
              v-model="form.phone" 
              class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-lineGreen" 
              placeholder="เช่น 0812345678" 
              required
            />
          </div>
        </div>

        <button 
          @click="save" 
          :disabled="saving || !isFormValid"
          class="w-full bg-lineGreen hover:bg-green-600 disabled:bg-gray-300 text-white rounded-xl py-3 font-semibold transition-colors"
        >
          {{ saving ? 'กำลังบันทึก...' : 'บันทึกและเริ่มใช้งาน' }}
        </button>
      </div>
    </main>
  </div>
</template>

<script setup>
import { reactive, computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useFirebase } from '../composables/useFirebase.js'

const router = useRouter()
const { user, updateUserProfile } = useFirebase()

const saving = ref(false)

const form = reactive({
  displayName: '',
  pictureUrl: '',
  nickname: '',
  firstName: '',
  lastName: '',
  phone: ''
})

const isFormValid = computed(() => {
  return form.nickname && form.firstName && form.lastName && form.phone
})

onMounted(() => {
  // Populate form with LINE user data
  if (user.value) {
    form.displayName = user.value.displayName || ''
    form.pictureUrl = user.value.pictureUrl || ''
    form.nickname = user.value.nickname || ''
    form.firstName = user.value.firstName || ''
    form.lastName = user.value.lastName || ''
    form.phone = user.value.phone || ''
  }
})

async function save() {
  if (!isFormValid.value) {
    alert('กรุณากรอกข้อมูลให้ครบถ้วน')
    return
  }

  saving.value = true
  try {
    await updateUserProfile({
      nickname: form.nickname,
      firstName: form.firstName,
      lastName: form.lastName,
      phone: form.phone
    })
    router.push('/')
  } catch (error) {
    console.error('Save error:', error)
    alert('เกิดข้อผิดพลาดในการบันทึก โปรดลองอีกครั้ง')
  } finally {
    saving.value = false
  }
}
</script>

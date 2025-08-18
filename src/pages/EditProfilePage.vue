<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-white text-gray-900 shadow-sm border-b border-gray-200">
      <div class="max-w-md mx-auto px-6 py-6 flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold">✏️ แก้ไขโปรไฟล์</h1>
          <p class="text-gray-500 text-sm">อัปเดตข้อมูลส่วนตัวของคุณ</p>
        </div>
      </div>
    </header>

    <main class="max-w-md mx-auto px-6 py-6">
      <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <form @submit.prevent="save" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">ชื่อเล่น</label>
            <input v-model="form.nickname" class="w-full border border-gray-300 rounded-lg px-3 py-2" />
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">ชื่อ</label>
              <input v-model="form.firstName" class="w-full border border-gray-300 rounded-lg px-3 py-2" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">นามสกุล</label>
              <input v-model="form.lastName" class="w-full border border-gray-300 rounded-lg px-3 py-2" />
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">เบอร์โทร</label>
            <input 
              v-model="form.phone" 
              @blur="validatePhone"
              @input="clearPhoneError"
              :class="[
                'w-full border rounded-lg px-3 py-2',
                phoneError ? 'border-red-500' : 'border-gray-300'
              ]"
              placeholder="0812345678"
            />
            <p v-if="phoneError" class="text-red-500 text-sm mt-1">{{ phoneError }}</p>
          </div>

          <div class="pt-2 flex gap-3">
            <button type="submit" class="flex-1 bg-lineGreen hover:bg-green-600 text-white py-3 rounded-lg font-medium">บันทึก</button>
            <button type="button" @click="$router.back()" class="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-lg font-medium">ยกเลิก</button>
          </div>
        </form>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useFirebase } from '../composables/useFirebase.js'
import { useToast } from 'vue-toastification'

const router = useRouter()
const toast = useToast()
const { user, updateUserProfile } = useFirebase()

const form = ref({ nickname: '', firstName: '', lastName: '', phone: '' })
const phoneError = ref(null)

onMounted(() => {
  if (user.value) {
    form.value.nickname = user.value.nickname || ''
    form.value.firstName = user.value.firstName || ''
    form.value.lastName = user.value.lastName || ''
    form.value.phone = user.value.phone || ''
  }
})

const validatePhone = () => {
  const phone = form.value.phone
  const thaiPhoneRegex = /^0\d{9,10}$/
  if (!thaiPhoneRegex.test(phone)) {
    phoneError.value = 'กรุณากรอกเบอร์โทรศัพท์ 10-11 หลัก (เริ่มต้นด้วย 0) เช่น 0812345678'
  } else {
    phoneError.value = null
  }
}

const clearPhoneError = () => {
  if (phoneError.value) {
    phoneError.value = null
  }
}

const save = async () => {
  // Validate phone before saving
  validatePhone()
  if (phoneError.value) {
    toast.error('เบอร์โทรศัพท์ไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง')
    return
  }

  try {
    await updateUserProfile({ ...form.value })
    toast.success('บันทึกโปรไฟล์สำเร็จ')
    router.push('/profile')
  } catch (e) {
    toast.error('บันทึกโปรไฟล์ไม่สำเร็จ')
  }
}
</script>



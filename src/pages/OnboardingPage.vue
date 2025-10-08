<template>
  <div class="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100">
    <!-- Header -->
    <header class="bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div class="max-w-md mx-auto px-6 py-5 flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">👋 ยินดีต้อนรับ</h1>
          <p class="text-gray-500 text-sm">กรุณากรอกข้อมูลเพิ่มเติม</p>
        </div>
        <div class="bg-lineGreen/10 rounded-full p-3 border border-lineGreen/30">
          <span class="text-2xl">🎉</span>
        </div>
      </div>
    </header>

    <!-- Onboarding Form -->
    <main class="max-w-md mx-auto px-6 py-8">
      <div class="bg-white rounded-3xl shadow-md border border-gray-100 p-6 transition-all duration-300 hover:shadow-lg">
        <div class="text-center mb-6">
          <div class="w-20 h-20 bg-gradient-to-tr from-lineGreen to-green-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
            <span class="text-3xl text-white">👤</span>
          </div>
          <h2 class="text-xl font-semibold text-gray-900 mb-2">ข้อมูลส่วนตัว</h2>
          <p class="text-gray-500 text-sm">กรุณากรอกข้อมูลเพื่อให้เรารู้จักคุณมากขึ้น</p>
        </div>

        <form @submit.prevent="submitProfile" class="space-y-5">
          <!-- Nickname -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">ชื่อเล่น *</label>
            <input
              v-model="profile.nickname"
              type="text"
              class="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-lineGreen focus:border-transparent transition-all duration-200 placeholder-gray-400"
              placeholder="ชื่อเล่นของคุณ"
              required
            />
          </div>

          <!-- Name -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">ชื่อ *</label>
              <input
                v-model="profile.firstName"
                type="text"
                class="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-lineGreen focus:border-transparent placeholder-gray-400"
                placeholder="ชื่อจริง"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">นามสกุล *</label>
              <input
                v-model="profile.lastName"
                type="text"
                class="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-lineGreen focus:border-transparent placeholder-gray-400"
                placeholder="นามสกุล"
                required
              />
            </div>
          </div>

          <!-- Phone -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">เบอร์โทรศัพท์ *</label>
            <input
              v-model="profile.phone"
              type="tel"
              @blur="validatePhone"
              :class="[
                'w-full border rounded-xl px-4 py-2.5 focus:ring-2 focus:border-transparent placeholder-gray-400 transition-all duration-200',
                phoneError ? 'border-red-400 focus:ring-red-400' : 'border-gray-300 focus:ring-lineGreen'
              ]"
              placeholder="0812345678"
              required
            />
            <p v-if="phoneError" class="text-red-500 text-xs mt-1">{{ phoneError }}</p>
          </div>

          <!-- Experience -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">ประสบการณ์โยคะ</label>
            <select
              v-model="profile.experience"
              class="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-lineGreen focus:border-transparent text-gray-700 bg-white"
            >
              <option value="">เลือกประสบการณ์</option>
              <option value="beginner">เริ่มต้น (0-6 เดือน)</option>
              <option value="intermediate">ปานกลาง (6 เดือน - 2 ปี)</option>
              <option value="advanced">ขั้นสูง (2 ปีขึ้นไป)</option>
            </select>
          </div>

          <!-- Goal -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">เป้าหมาย</label>
            <select
              v-model="profile.goal"
              class="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-lineGreen focus:border-transparent text-gray-700 bg-white"
            >
              <option value="">เลือกเป้าหมาย</option>
              <option value="flexibility">เพิ่มความยืดหยุ่น</option>
              <option value="strength">เพิ่มความแข็งแรง</option>
              <option value="relaxation">ผ่อนคลายความเครียด</option>
              <option value="weight-loss">ลดน้ำหนัก</option>
              <option value="meditation">สมาธิและจิตใจ</option>
            </select>
          </div>

          <!-- Health Info -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">ข้อมูลสุขภาพ (ถ้ามี)</label>
            <textarea
              v-model="profile.healthInfo"
              rows="3"
              class="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-lineGreen focus:border-transparent placeholder-gray-400 resize-none"
              placeholder="เช่น โรคประจำตัว การบาดเจ็บ หรือข้อจำกัดต่างๆ"
            ></textarea>
          </div>

          <!-- Button -->
          <div class="pt-2">
            <button
              type="submit"
              :disabled="loading"
              class="w-full bg-gradient-to-r from-lineGreen to-green-500 hover:from-green-600 hover:to-green-500 disabled:from-gray-300 disabled:to-gray-300 text-white py-3 rounded-xl font-medium transition-all duration-300 shadow-sm hover:shadow-md"
            >
              <span v-if="loading">กำลังบันทึก...</span>
              <span v-else>บันทึกข้อมูล</span>
            </button>
          </div>
        </form>

        <div class="mt-6 text-center">
          <p class="text-xs text-gray-400 leading-relaxed">
            ข้อมูลของคุณจะถูกเก็บรักษาไว้อย่างปลอดภัย<br />
            และใช้เฉพาะเพื่อการให้บริการเท่านั้น
          </p>
        </div>
      </div>
    </main>
  </div>
</template>


<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { useFirebase } from '../composables/useFirebase.js'

const router = useRouter()
const { user, updateUserProfile } = useFirebase()
const toast = useToast()

const loading = ref(false)

const profile = ref({
  nickname: '',
  firstName: '',
  lastName: '',
  phone: '',
  experience: '',
  goal: '',
  healthInfo: ''
})

const phoneError = ref(null)

const validatePhone = () => {
  const phone = profile.value.phone
  const thaiPhoneRegex = /^0\d{9,10}$/
  if (!thaiPhoneRegex.test(phone)) {
    phoneError.value = 'กรุณากรอกเบอร์โทรศัพท์ 10-11 หลัก (เริ่มต้นด้วย 0) เช่น 0812345678'
  } else {
    phoneError.value = null
  }
}

const submitProfile = async () => {
  try {
    loading.value = true
    
    // Validate required fields
    if (!profile.value.nickname || !profile.value.firstName || !profile.value.lastName || !profile.value.phone) {
      toast.error('กรุณากรอกข้อมูลที่จำเป็นให้ครบ')
      return
    }

    // Validate phone number
    validatePhone()
    if (phoneError.value) {
      toast.error('เบอร์โทรศัพท์ไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง')
      return
    }

    // Update user profile
    await updateUserProfile({
      nickname: profile.value.nickname,
      firstName: profile.value.firstName,
      lastName: profile.value.lastName,
      phone: profile.value.phone,
      experience: profile.value.experience,
      goal: profile.value.goal,
      healthInfo: profile.value.healthInfo
    })

    toast.success('บันทึกข้อมูลสำเร็จ! ยินดีต้อนรับสู่ Black Yoga')
    
    // Redirect to home page
    router.push('/')
  } catch (error) {
    console.error('Error updating profile:', error)
    toast.error('เกิดข้อผิดพลาดในการบันทึกข้อมูล: ' + (error.message || 'ไม่ทราบสาเหตุ'))
  } finally {
    loading.value = false
  }
}
</script>

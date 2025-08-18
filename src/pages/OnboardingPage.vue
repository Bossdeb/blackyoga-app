<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white text-gray-900 shadow-sm border-b border-gray-200">
      <div class="max-w-md mx-auto px-6 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold">👋 ยินดีต้อนรับ</h1>
            <p class="text-gray-500 text-sm">กรุณากรอกข้อมูลเพิ่มเติม</p>
          </div>
          <div class="bg-lineGreen rounded-full p-2">
            <span class="text-2xl">🎉</span>
          </div>
        </div>
      </div>
    </header>

    <!-- Onboarding Form -->
    <main class="max-w-md mx-auto px-6 py-6">
      <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div class="text-center mb-6">
          <div class="w-20 h-20 bg-lineGreen rounded-full flex items-center justify-center mx-auto mb-4">
            <span class="text-3xl">👤</span>
          </div>
          <h2 class="text-xl font-semibold text-gray-900 mb-2">ข้อมูลส่วนตัว</h2>
          <p class="text-gray-500 text-sm">กรุณากรอกข้อมูลเพื่อให้เรารู้จักคุณมากขึ้น</p>
        </div>

        <form @submit.prevent="submitProfile" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">ชื่อเล่น *</label>
            <input 
              v-model="profile.nickname" 
              type="text" 
              class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-lineGreen focus:border-transparent"
              placeholder="ชื่อเล่นของคุณ"
              required
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">ชื่อ *</label>
              <input 
                v-model="profile.firstName" 
                type="text" 
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-lineGreen focus:border-transparent"
                placeholder="ชื่อจริง"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">นามสกุล *</label>
              <input 
                v-model="profile.lastName" 
                type="text" 
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-lineGreen focus:border-transparent"
                placeholder="นามสกุล"
                required
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">เบอร์โทรศัพท์ *</label>
            <input 
              v-model="profile.phone" 
              type="tel" 
              @blur="validatePhone"
              :class="[
                'w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-lineGreen focus:border-transparent',
                phoneError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
              ]"
              placeholder="0812345678"
              required
            />
            <p v-if="phoneError" class="text-red-500 text-xs mt-1">{{ phoneError }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">ประสบการณ์โยคะ</label>
            <select 
              v-model="profile.experience" 
              class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-lineGreen focus:border-transparent"
            >
              <option value="">เลือกประสบการณ์</option>
              <option value="beginner">เริ่มต้น (0-6 เดือน)</option>
              <option value="intermediate">ปานกลาง (6 เดือน - 2 ปี)</option>
              <option value="advanced">ขั้นสูง (2 ปีขึ้นไป)</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">เป้าหมาย</label>
            <select 
              v-model="profile.goal" 
              class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-lineGreen focus:border-transparent"
            >
              <option value="">เลือกเป้าหมาย</option>
              <option value="flexibility">เพิ่มความยืดหยุ่น</option>
              <option value="strength">เพิ่มความแข็งแรง</option>
              <option value="relaxation">ผ่อนคลายความเครียด</option>
              <option value="weight-loss">ลดน้ำหนัก</option>
              <option value="meditation">สมาธิและจิตใจ</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">ข้อมูลสุขภาพ (ถ้ามี)</label>
            <textarea 
              v-model="profile.healthInfo" 
              class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-lineGreen focus:border-transparent"
              rows="3"
              placeholder="เช่น โรคประจำตัว การบาดเจ็บ หรือข้อจำกัดต่างๆ"
            ></textarea>
          </div>

          <div class="pt-4">
            <button 
              type="submit" 
              :disabled="loading"
              class="w-full bg-lineGreen hover:bg-green-600 disabled:bg-gray-300 text-white py-3 rounded-lg font-medium transition-colors duration-200"
            >
              <span v-if="loading">กำลังบันทึก...</span>
              <span v-else>บันทึกข้อมูล</span>
            </button>
          </div>
        </form>

        <div class="mt-6 text-center">
          <p class="text-xs text-gray-500">
            ข้อมูลของคุณจะถูกเก็บรักษาไว้อย่างปลอดภัยและใช้เฉพาะเพื่อการให้บริการเท่านั้น
          </p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useFirebase } from '../composables/useFirebase.js'

const router = useRouter()
const { user, updateUserProfile } = useFirebase()

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
      alert('กรุณากรอกข้อมูลที่จำเป็นให้ครบ')
      return
    }

    // Validate phone number
    validatePhone()
    if (phoneError.value) {
      alert('เบอร์โทรศัพท์ไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง')
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

    alert('บันทึกข้อมูลสำเร็จ! ยินดีต้อนรับสู่ Black Yoga')
    
    // Redirect to home page
    router.push('/')
  } catch (error) {
    console.error('Error updating profile:', error)
    alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล: ' + error.message)
  } finally {
    loading.value = false
  }
}
</script>
